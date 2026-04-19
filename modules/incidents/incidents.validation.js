const Joi = require("joi");

const createIncidentSchema = Joi.object({
    checkpoint_id: Joi.number()
        .integer()
        .positive()
        .allow(null),

    type: Joi.string()
        .valid("closure", "delay", "accident", "weather", "hazard")
        .required(),

    severity: Joi.string()
        .valid("low", "medium", "high", "critical")
        .required(),

    description: Joi.string()
        .max(1000)
        .allow(null, "")
        .optional(),

    latitude: Joi.number()
        .min(-90)
        .max(90)
        .required(),

    longitude: Joi.number()
        .min(-180)
        .max(180)
        .required()
});

const updateIncidentSchema = Joi.object({
    checkpoint_id: Joi.number()
        .integer()
        .positive()
        .allow(null),

    type: Joi.string()
        .valid("closure", "delay", "accident", "weather", "hazard"),

    severity: Joi.string()
        .valid("low", "medium", "high", "critical"),

    description: Joi.string()
        .max(1000)
        .allow(null, ""),

    latitude: Joi.number()
        .min(-90)
        .max(90),

    longitude: Joi.number()
        .min(-180)
        .max(180)
}).min(1);

const statusSchema = Joi.object({
    status: Joi.string()
        .valid("reported", "verified", "resolved")
        .required()
});

const idParamSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
});

const getIncidentsQuerySchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10),

    type: Joi.string()
        .valid("closure", "delay", "accident", "weather", "hazard"),

    severity: Joi.string()
        .valid("low", "medium", "high", "critical"),

    status: Joi.string()
        .valid("reported", "verified", "resolved"),

    sortBy: Joi.string()
        .valid("created_at", "updated_at", "severity", "status", "type")
        .default("created_at"),

    order: Joi.string()
        .uppercase()
        .valid("ASC", "DESC")
        .default("DESC")
});

module.exports = {
    createIncidentSchema,
    updateIncidentSchema,
    statusSchema,
    idParamSchema,
    getIncidentsQuerySchema
};