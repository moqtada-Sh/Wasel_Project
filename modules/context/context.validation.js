const Joi = require("joi");

const coordinates = Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required()
});

const route = Joi.object({
    start_lat: Joi.number().min(-90).max(90).required(),
    start_lng: Joi.number().min(-180).max(180).required(),
    end_lat: Joi.number().min(-90).max(90).required(),
    end_lng: Joi.number().min(-180).max(180).required()
});

module.exports = {
    coordinates,
    route
};