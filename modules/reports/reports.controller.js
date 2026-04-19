const service = require("./reports.service");

const createReport = async (req, res, next) => {
    try {
        const result = await service.createReport(req.body, req.user.id);

        res.status(201).json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

const getReports = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            status,
            sortBy,
            order
        } = req.query;

        const result = await service.getReports({
            page: Number(page),
            limit: Number(limit),
            filters: { category, status },
            sortBy,
            order
        });

        res.json({
            success: true,
            ...result
        });
    } catch (err) {
        next(err);
    }
};

const getReportById = async (req, res, next) => {
    try {
        const result = await service.getReportById(Number(req.params.id));

        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

const moderateReport = async (req, res, next) => {
    try {
        const result = await service.moderateReport(
            Number(req.params.id),
            req.body.action,
            req.user.id,
            req.body.reason || null
        );

        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

const voteReport = async (req, res, next) => {
    try {
        const result = await service.voteReport(
            Number(req.params.id),
            req.user.id,
            req.body.vote
        );

        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createReport,
    getReports,
    getReportById,
    moderateReport,
    voteReport
};