const incidentsService = require("./incidents.service");

const createIncident = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            reported_by: req.user.id
        };

        const result = await incidentsService.createIncident(data);

        return res.status(201).json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

const getIncidents = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            type,
            severity,
            status,
            sortBy,
            order
        } = req.query;

        const result = await incidentsService.getIncidents({
            page: Number(page),
            limit: Number(limit),
            filters: { type, severity, status },
            sortBy,
            order
        });

        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (err) {
        next(err);
    }
};

const getIncidentById = async (req, res, next) => {
    try {
        const result = await incidentsService.getIncidentById(Number(req.params.id));

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

const updateIncident = async (req, res, next) => {
    try {
        const result = await incidentsService.updateIncident(
            Number(req.params.id),
            req.body,
            req.user.id,
            req.user.role
        );

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

const deleteIncident = async (req, res, next) => {
    try {
        const result = await incidentsService.deleteIncident(
            Number(req.params.id),
            req.user.id,
            req.user.role
        );

        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (err) {
        next(err);
    }
};

const changeIncidentStatus = async (req, res, next) => {
    try {
        const result = await incidentsService.changeIncidentStatus(
            Number(req.params.id),
            req.body.status,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createIncident,
    getIncidents,
    getIncidentById,
    updateIncident,
    deleteIncident,
    changeIncidentStatus
};