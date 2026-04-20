const service = require("./alerts.service");

const createSubscription = async (req, res, next) => {
    try {
        const result = await service.createSubscription(req.body, req.user.id);

        res.status(201).json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

const getMySubscriptions = async (req, res, next) => {
    try {
        const result = await service.getMySubscriptions(req.user.id);

        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

const muteSubscription = async (req, res, next) => {
    try {
        const result = await service.muteSubscription(
            req.params.id,
            req.user.id,
            req.body.mute_until || null
        );

        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

const deleteSubscription = async (req, res, next) => {
    try {
        const result = await service.deleteSubscription(req.params.id, req.user.id);

        res.json({
            success: true,
            message: result.message
        });
    } catch (err) {
        next(err);
    }
};

const getMyNotifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, is_read } = req.query;

        const parsedIsRead =
            typeof is_read === "undefined" ? undefined : is_read === "true";

        const result = await service.getMyNotifications(
            {
                page: Number(page),
                limit: Number(limit),
                is_read: parsedIsRead
            },
            req.user.id
        );

        res.json({
            success: true,
            ...result
        });
    } catch (err) {
        next(err);
    }
};

const markNotificationRead = async (req, res, next) => {
    try {
        const result = await service.markNotificationRead(req.params.id, req.user.id);

        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createSubscription,
    getMySubscriptions,
    muteSubscription,
    deleteSubscription,
    getMyNotifications,
    markNotificationRead
};