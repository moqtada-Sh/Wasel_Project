const { Op, fn, col, literal } = require("sequelize");
const Report = require("./reports.model");
const ReportVote = require("../report_votes/report_votes.model");
const db = require("../../database/connection");

const createError = (message, status) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

const normalizeText = (value) => {
    if (typeof value !== "string") return value;
    return value.trim();
};

const findActiveReportById = async (id) => {
    const report = await Report.findOne({
        where: {
            id,
            is_deleted: false
        }
    });

    if (!report) {
        throw createError("Report not found", 404);
    }

    return report;
};

const writeAuditLog = async (userId, action, entityType, entityId, transaction = null) => {
    await db.query(
        `
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address)
        VALUES (?, ?, ?, ?, ?)
        `,
        {
            replacements: [userId, action, entityType, entityId, null],
            transaction
        }
    );
};

const createReport = async (data, userId) => {
    const cleanedDescription = normalizeText(data.description);

    const duplicate = await Report.findOne({
        where: {
            is_deleted: false,
            category: data.category,
            latitude: data.latitude,
            longitude: data.longitude,
            status: {
                [Op.in]: ["pending", "approved"]
            }
        },
        order: [["created_at", "DESC"]]
    });

    const duplicateOf = duplicate ? duplicate.id : null;
    const confidenceScore = duplicate ? 0.5 : 1;

    const report = await Report.create({
        user_id: userId,
        category: data.category,
        description: cleanedDescription,
        latitude: data.latitude,
        longitude: data.longitude,
        duplicate_of: duplicateOf,
        confidence_score: confidenceScore
    });

    await writeAuditLog(userId, "create_report", "report", report.id);

    return {
        message: "Report created successfully",
        data: report
    };
};

const getReports = async ({
                              page = 1,
                              limit = 10,
                              filters = {},
                              sortBy = "created_at",
                              order = "DESC"
                          }) => {
    const safePage = Number.isInteger(page) && page > 0 ? page : 1;
    const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;
    const offset = (safePage - 1) * safeLimit;

    const where = {
        is_deleted: false
    };

    if (filters.category) where.category = filters.category;
    if (filters.status) where.status = filters.status;

    const allowedSortFields = ["created_at", "confidence_score", "status", "category"];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "created_at";
    const safeOrder = String(order).toUpperCase() === "ASC" ? "ASC" : "DESC";

    const { count, rows } = await Report.findAndCountAll({
        where,
        order: [[safeSortBy, safeOrder]],
        limit: safeLimit,
        offset
    });

    return {
        page: safePage,
        limit: safeLimit,
        total: count,
        totalPages: Math.ceil(count / safeLimit),
        sortBy: safeSortBy,
        order: safeOrder,
        results: rows
    };
};

const getReportById = async (id) => {
    const report = await findActiveReportById(id);

    const votes = await ReportVote.findAll({
        where: { report_id: report.id },
        attributes: [
            "vote",
            [fn("COUNT", col("id")), "count"]
        ],
        group: ["vote"]
    });

    let upvotes = 0;
    let downvotes = 0;

    votes.forEach((item) => {
        if (item.vote === "up") upvotes = Number(item.dataValues.count);
        if (item.vote === "down") downvotes = Number(item.dataValues.count);
    });

    return {
        report,
        votes_summary: {
            upvotes,
            downvotes,
            score: upvotes - downvotes
        }
    };
};

const voteReport = async (reportId, userId, vote) => {
    await findActiveReportById(reportId);

    const existingVote = await ReportVote.findOne({
        where: {
            report_id: reportId,
            user_id: userId
        }
    });

    let savedVote;

    if (!existingVote) {
        savedVote = await ReportVote.create({
            report_id: reportId,
            user_id: userId,
            vote
        });

        await writeAuditLog(
            userId,
            vote === "up" ? "vote_report_up" : "vote_report_down",
            "report",
            Number(reportId)
        );
    } else if (existingVote.vote !== vote) {
        await existingVote.update({ vote });
        savedVote = existingVote;

        await writeAuditLog(
            userId,
            vote === "up" ? "vote_report_up" : "vote_report_down",
            "report",
            Number(reportId)
        );
    } else {
        throw createError("You already submitted the same vote for this report", 400);
    }

    const upvotes = await ReportVote.count({
        where: { report_id: reportId, vote: "up" }
    });

    const downvotes = await ReportVote.count({
        where: { report_id: reportId, vote: "down" }
    });

    return {
        message: "Vote saved successfully",
        data: savedVote,
        votes_summary: {
            upvotes,
            downvotes,
            score: upvotes - downvotes
        }
    };
};

const moderateReport = async (reportId, action, moderatorId, reason = null) => {
    const transaction = await db.transaction();

    try {
        const report = await Report.findOne({
            where: {
                id: reportId,
                is_deleted: false
            },
            transaction
        });

        if (!report) {
            throw createError("Report not found", 404);
        }

        if (action === "approve") {
            await report.update({ status: "approved" }, { transaction });
        } else if (action === "reject") {
            await report.update({ status: "rejected" }, { transaction });
        } else if (action === "delete") {
            await report.update({ is_deleted: true }, { transaction });
        } else if (action === "merge") {
            if (!report.duplicate_of) {
                throw createError("Merge action requires the report to reference duplicate_of", 400);
            }

            const parentReport = await Report.findOne({
                where: {
                    id: report.duplicate_of,
                    is_deleted: false
                },
                transaction
            });

            if (!parentReport) {
                throw createError("Original report for merge not found", 404);
            }

            await report.update(
                {
                    status: "approved"
                },
                { transaction }
            );
        } else {
            throw createError("Invalid moderation action", 400);
        }

        await db.query(
            `
            INSERT INTO moderation_actions (moderator_id, report_id, action, reason)
            VALUES (?, ?, ?, ?)
            `,
            {
                replacements: [moderatorId, report.id, action, reason],
                transaction
            }
        );

        await writeAuditLog(
            moderatorId,
            `moderate_report_${action}`,
            "report",
            report.id,
            transaction
        );

        await transaction.commit();

        return {
            message: `Report ${action} completed successfully`,
            data: report
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    createReport,
    getReports,
    getReportById,
    voteReport,
    moderateReport
};