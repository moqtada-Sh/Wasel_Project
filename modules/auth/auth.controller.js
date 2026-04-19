const service = require('./auth.service');

exports.register = async (req, res, next) => {
    try {
        const result = await service.register(req.body);
        res.status(201).json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const result = await service.login(req.body);
        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

exports.refresh = async (req, res, next) => {
    try {
        const { token } = req.body;
        const result = await service.refresh(token);
        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};