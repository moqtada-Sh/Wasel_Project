const { Op } = require("sequelize");
const Checkpoint = require("./checkpoints.model");
const db = require("../../database/connection");

const createError = (message, status) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

const normalizeOptionalText = (value) => {
    if (value === "" || typeof value === "undefined") return null;
    return value;
};

const findActiveCheckpointById = async (id) => {
    const checkpoint = await Checkpoint.findOne({
        where: {
            id,
            is_deleted: false
        }
    });

    if (!checkpoint) {
        throw createError("Checkpoint not found", 404);
    }

    return checkpoint;
};

const createCheckpoint = async (data) => {
    const existing = await Checkpoint.findOne({
        where: {
            is_deleted: false,
            name: data.name,
            latitude: data.latitude,
            longitude: data.longitude
        }
    });

    if (existing) {
        throw createError("Checkpoint with the same name and location already exists", 409);
    }

    const checkpoint = await Checkpoint.create({
        name: data.name,
        status: data.status || "open",
        latitude: data.latitude,
        longitude: data.longitude,
        description: normalizeOptionalText(data.description),
        region: normalizeOptionalText(data.region)
    });

    return {
        message: "Checkpoint created successfully",
        data: checkpoint
    };
};

const getCheckpoints = async ({
                                  page = 1,
                                  limit = 10,
                                  filters = {},
                                  sortBy = "created_at",
                                  order = "DESC"
                              }) => {
    const safePage = Number.isInteger(page) && page > 0 ? page : 1;
    const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;

    const where = {
        is_deleted: false
    };

    if (filters.status) {
        where.status = filters.status;
    }

    if (filters.region) {
        where.region = {
            [Op.like]: `%${filters.region}%`
        };
    }

    const offset = (safePage - 1) * safeLimit;

    const allowedSortFields = ["created_at", "name", "status", "region"];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "created_at";
    const safeOrder = String(order).toUpperCase() === "ASC" ? "ASC" : "DESC";

    const { count, rows } = await Checkpoint.findAndCountAll({
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

const getCheckpointById = async (id) => {
    return await findActiveCheckpointById(id);
};

const updateCheckpoint = async (id, data, userId) => {
    const checkpoint = await findActiveCheckpointById(id);

    const nextName =
        typeof data.name !== "undefined" ? data.name : checkpoint.name;
    const nextLatitude =
        typeof data.latitude !== "undefined" ? data.latitude : checkpoint.latitude;
    const nextLongitude =
        typeof data.longitude !== "undefined" ? data.longitude : checkpoint.longitude;

    const duplicate = await Checkpoint.findOne({
        where: {
            id: { [Op.ne]: checkpoint.id },
            is_deleted: false,
            name: nextName,
            latitude: nextLatitude,
            longitude: nextLongitude
        }
    });

    if (duplicate) {
        throw createError("Another checkpoint with the same name and location already exists", 409);
    }

    const oldStatus = checkpoint.status;

    await checkpoint.update({
        ...data,
        description: Object.prototype.hasOwnProperty.call(data, "description")
            ? normalizeOptionalText(data.description)
            : checkpoint.description,
        region: Object.prototype.hasOwnProperty.call(data, "region")
            ? normalizeOptionalText(data.region)
            : checkpoint.region
    });

    if (data.status && data.status !== oldStatus) {
        await db.query(
            `
            INSERT INTO checkpoint_status_history
                (checkpoint_id, old_status, new_status, changed_by)
            VALUES (?, ?, ?, ?)
            `,
            {
                replacements: [checkpoint.id, oldStatus, data.status, userId]
            }
        );
    }

    return {
        message: "Checkpoint updated successfully",
        data: checkpoint
    };
};

const deleteCheckpoint = async (id) => {
    const checkpoint = await findActiveCheckpointById(id);

    await checkpoint.update({ is_deleted: true });

    return {
        message: "Checkpoint deleted successfully"
    };
};

module.exports = {
    createCheckpoint,
    getCheckpoints,
    getCheckpointById,
    updateCheckpoint,
    deleteCheckpoint
};