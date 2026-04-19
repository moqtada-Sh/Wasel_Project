const service = require("./checkpoints.service");

const createCheckpoint = async (req, res, next) => {
    try {
        const result = await service.createCheckpoint(req.body);

        res.status(201).json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

const getCheckpoints = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            region,
            sortBy,
            order
        } = req.query;

        const result = await service.getCheckpoints({
            page: Number(page),
            limit: Number(limit),
            filters: { status, region },
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

const getCheckpointById = async (req, res, next) => {
    try {
        const result = await service.getCheckpointById(Number(req.params.id));

        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

const updateCheckpoint = async (req, res, next) => {
    try {
        const result = await service.updateCheckpoint(
            Number(req.params.id),
            req.body,
            req.user.id
        );

        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

const deleteCheckpoint = async (req, res, next) => {
    try {
        const result = await service.deleteCheckpoint(Number(req.params.id));

        res.json({
            success: true,
            message: result.message
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createCheckpoint,
    getCheckpoints,
    getCheckpointById,
    updateCheckpoint,
    deleteCheckpoint
};