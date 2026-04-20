const service = require("./routing.service");

const estimateRoute = async (req, res, next) => {
    try {
        const result = await service.estimateRoute(req.body, req.user.id);

        res.status(201).json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

const getUserRoutes = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy,
            order
        } = req.query;

        const result = await service.getUserRoutes({
            page: Number(page),
            limit: Number(limit),
            sortBy,
            order
        }, req.user.id);

        res.json({
            success: true,
            ...result
        });
    } catch (err) {
        next(err);
    }
};

const getRouteById = async (req, res, next) => {
    try {
        const result = await service.getRouteById(req.params.id, req.user.id);

        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    estimateRoute,
    getUserRoutes,
    getRouteById
};