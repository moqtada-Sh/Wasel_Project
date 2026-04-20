const Joi = require("joi");

const subscriptionSchema = Joi.object({
    region: Joi.string().max(100).allow(null, ""),

    incident_type: Joi.string()
        .valid("closure", "delay", "accident", "weather", "hazard")
        .allow(null, ""),

    center_lat: Joi.number().min(-90).max(90).allow(null),
    center_lng: Joi.number().min(-180).max(180).allow(null),
    radius_km: Joi.number().positive().allow(null)
})
    .with("center_lat", ["center_lng", "radius_km"])
    .with("center_lng", ["center_lat", "radius_km"])
    .with("radius_km", ["center_lat", "center_lng"])
    .or("region", "incident_type", "center_lat");

const muteSchema = Joi.object({
    mute_until: Joi.date().iso().allow(null)
});

const idParamSchema = Joi.object({
    id: Joi.number().integer().required()
});

const notificationsQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    is_read: Joi.boolean()
});

module.exports = {
    subscriptionSchema,
    muteSchema,
    idParamSchema,
    notificationsQuerySchema
};