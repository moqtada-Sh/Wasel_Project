const { Op } = require("sequelize");
const Incident = require("./incidents.model");
const Checkpoint = require("../checkpoints/checkpoints.model");
const db = require("../../database/connection");
const alertsService = require("../alerts/alerts.service");
const weatherService = require("../external/weather.service");
const geocodingService = require("../external/geocoding.service");

const createError = (message, status) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

const normalizeOptionalText = (value) => {
    if (value === "" || typeof value === "undefined") return null;
    return value;
};

const findActiveIncidentById = async (id, includeCheckpoint = false) => {
    const query = {
        where: {
            id,
            is_deleted: false
        }
    };

    if (includeCheckpoint) {
        query.include = [
            {
                model: Checkpoint,
                as: "checkpoint"
            }
        ];
    }

    const incident = await Incident.findOne(query);

    if (!incident) {
        throw createError("Incident not found", 404);
    }

    return incident;
};

const ensureCheckpointExists = async (checkpointId) => {
    if (checkpointId === null || typeof checkpointId === "undefined") return;

    const checkpoint = await Checkpoint.findOne({
        where: {
            id: checkpointId,
            is_deleted: false
        }
    });

    if (!checkpoint) {
        throw createError("Checkpoint not found", 404);
    }
};

const detectDuplicateIncident = async ({
                                           type,
                                           latitude,
                                           longitude,
                                           excludeId = null
                                       }) => {
    const where = {
        is_deleted: false,
        type,
        latitude,
        longitude,
        status: {
            [Op.in]: ["reported", "verified"]
        }
    };

    if (excludeId) {
        where.id = { [Op.ne]: excludeId };
    }

    return await Incident.findOne({ where });
};

const createIncident = async (data) => {
    await ensureCheckpointExists(data.checkpoint_id);

    const duplicate = await detectDuplicateIncident({
        type: data.type,
        latitude: data.latitude,
        longitude: data.longitude
    });

    if (duplicate) {
        throw createError("A similar active incident already exists at this location", 409);
    }

    const incident = await Incident.create({
        checkpoint_id: data.checkpoint_id ?? null,
        reported_by: data.reported_by,
        type: data.type,
        severity: data.severity,
        description: normalizeOptionalText(data.description),
        latitude: data.latitude,
        longitude: data.longitude,
        status: "reported"
    });

    return {
        message: "Incident created successfully",
        data: incident
    };
};

const getIncidents = async ({
                                page = 1,
                                limit = 10,
                                filters = {},
                                sortBy = "created_at",
                                order = "DESC"
                            }) => {
    const safePage = Number.isInteger(page) && page > 0 ? page : 1;
    const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;

    const where = { is_deleted: false };

    if (filters.type) where.type = filters.type;
    if (filters.severity) where.severity = filters.severity;
    if (filters.status) where.status = filters.status;

    const offset = (safePage - 1) * safeLimit;

    const allowedSortFields = ["created_at", "updated_at", "severity", "status", "type"];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "created_at";
    const safeOrder = String(order).toUpperCase() === "ASC" ? "ASC" : "DESC";

    const { count, rows } = await Incident.findAndCountAll({
        where,
        include: [
            {
                model: Checkpoint,
                as: "checkpoint"
            }
        ],
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

const getIncidentById = async (id) => {
    const incident = await findActiveIncidentById(id, true);

    let weather = null;
    let address = null;

    if (incident.latitude && incident.longitude) {
        try {
            const weatherData = await weatherService.getWeatherByCoordinates(
                Number(incident.latitude),
                Number(incident.longitude)
            );

            weather = weatherData.current || weatherData;
        } catch (err) {
            weather = { message: "Weather service unavailable" };
        }

        try {
            const geoData = await geocodingService.reverseGeocode(
                Number(incident.latitude),
                Number(incident.longitude)
            );

            address = geoData.display_name || null;
        } catch (err) {
            address = "Location service unavailable";
        }
    }

    return {
        incident,
        external_context: {
            weather,
            address
        }
    };
};

const updateIncident = async (id, data, userId, userRole) => {
    const incident = await findActiveIncidentById(id);

    if (incident.reported_by !== userId && !["admin", "moderator"].includes(userRole)) {
        throw createError("You are not allowed to update this incident", 403);
    }

    if (incident.status === "resolved" && userRole !== "admin") {
        throw createError("Resolved incidents can only be updated by admin", 403);
    }

    if (Object.prototype.hasOwnProperty.call(data, "status")) {
        delete data.status;
    }

    await ensureCheckpointExists(data.checkpoint_id);

    const nextType =
        typeof data.type !== "undefined" ? data.type : incident.type;
    const nextLatitude =
        typeof data.latitude !== "undefined" ? data.latitude : incident.latitude;
    const nextLongitude =
        typeof data.longitude !== "undefined" ? data.longitude : incident.longitude;

    const duplicate = await detectDuplicateIncident({
        type: nextType,
        latitude: nextLatitude,
        longitude: nextLongitude,
        excludeId: incident.id
    });

    if (duplicate) {
        throw createError("Another similar active incident already exists at this location", 409);
    }

    await incident.update({
        ...data,
        description: Object.prototype.hasOwnProperty.call(data, "description")
            ? normalizeOptionalText(data.description)
            : incident.description
    });

    return {
        message: "Incident updated successfully",
        data: incident
    };
};

const deleteIncident = async (id, userId, userRole) => {
    const incident = await findActiveIncidentById(id);

    if (incident.reported_by !== userId && userRole !== "admin") {
        throw createError("You are not allowed to delete this incident", 403);
    }

    await incident.update({ is_deleted: true });

    return {
        message: "Incident deleted successfully"
    };
};

const changeIncidentStatus = async (id, newStatus, userId) => {
    const incident = await findActiveIncidentById(id);

    const oldStatus = incident.status;

    if (oldStatus === newStatus) {
        throw createError("Status is already set to this value", 400);
    }

    const validTransitions = {
        reported: ["verified"],
        verified: ["resolved"],
        resolved: []
    };

    if (!validTransitions[oldStatus].includes(newStatus)) {
        throw createError(`Invalid status transition from ${oldStatus} to ${newStatus}`, 400);
    }

    await incident.update({ status: newStatus });

    await db.query(
        `
        INSERT INTO incident_status_history
            (incident_id, old_status, new_status, changed_by)
        VALUES (?, ?, ?, ?)
        `,
        {
            replacements: [incident.id, oldStatus, newStatus, userId]
        }
    );

    if (newStatus === "verified") {
        await alertsService.triggerAlertsForVerifiedIncident(incident.id);
    }

    return {
        message: "Incident status updated successfully",
        data: incident
    };
};

module.exports = {
    createIncident,
    getIncidents,
    getIncidentById,
    updateIncident,
    deleteIncident,
    changeIncidentStatus
};