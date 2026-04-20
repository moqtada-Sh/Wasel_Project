const Joi = require("joi");

const avoidAreaSchema = Joi.object({
    name: Joi.string().max(100).allow(null, ""),
    center_lat: Joi.number().min(-90).max(90).required(),
    center_lng: Joi.number().min(-180).max(180).required(),
    radius_km: Joi.number().positive().required()
});

const estimateRouteSchema = Joi.object({
    start_lat: Joi.number().min(-90).max(90).required(),
    start_lng: Joi.number().min(-180).max(180).required(),
    end_lat: Joi.number().min(-90).max(90).required(),
    end_lng: Joi.number().min(-180).max(180).required(),

    avoid_checkpoint_ids: Joi.array()
        .items(Joi.number().integer().positive())
        .default([]),

    avoid_areas: Joi.array()
        .items(avoidAreaSchema)
        .default([])
});

const idParamSchema = Joi.object({
    id: Joi.number().integer().required()
});

const getRoutesQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string()
        .valid("created_at", "distance_km", "duration_minutes")
        .default("created_at"),
    order: Joi.string()
        .valid("ASC", "DESC")
        .default("DESC")
});

module.exports = {
    estimateRouteSchema,
    idParamSchema,
    getRoutesQuerySchema
};