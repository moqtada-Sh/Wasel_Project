const service = require("./context.service");

const getWeather = async (req, res, next) => {
    try {
        const { latitude, longitude } = req.query;

        const result = await service.getWeather(
            Number(latitude),
            Number(longitude)
        );

        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

const reverseGeocode = async (req, res, next) => {
    try {
        const { latitude, longitude } = req.query;

        const result = await service.getAddress(
            Number(latitude),
            Number(longitude)
        );

        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

const getRoute = async (req, res, next) => {
    try {
        const { start_lat, start_lng, end_lat, end_lng } = req.query;

        const result = await service.getRoute(
            Number(start_lat),
            Number(start_lng),
            Number(end_lat),
            Number(end_lng)
        );

        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getWeather,
    reverseGeocode,
    getRoute
};