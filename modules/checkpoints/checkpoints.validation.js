const Joi = require("joi");

const createCheckpointSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(150)
        .required(),

    status: Joi.string()
        .valid("open", "closed", "delayed")
        .optional(),

    latitude: Joi.number()
        .min(-90)
        .max(90)
        .required(),

    longitude: Joi.number()
        .min(-180)
        .max(180)
        .required(),

    description: Joi.string()
        .max(1000)
        .allow(null, "")
        .optional(),

    region: Joi.string()
        .trim()
        .max(100)
        .allow(null, "")
        .optional()
});

const updateCheckpointSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(150),

    status: Joi.string()
        .valid("open", "closed", "delayed"),

    latitude: Joi.number()
        .min(-90)
        .max(90),

    longitude: Joi.number()
        .min(-180)
        .max(180),

    description: Joi.string()
        .max(1000)
        .allow(null, ""),

    region: Joi.string()
        .trim()
        .max(100)
        .allow(null, "")
}).min(1);

const idParamSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
});

const getCheckpointsQuerySchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10),

    status: Joi.string()
        .valid("open", "closed", "delayed"),

    region: Joi.string()
        .trim()
        .max(100),

    sortBy: Joi.string()
        .valid("created_at", "name", "status", "region")
        .default("created_at"),

    order: Joi.string()
        .uppercase()
        .valid("ASC", "DESC")
        .default("DESC")
});

module.exports = {
    createCheckpointSchema,
    updateCheckpointSchema,
    idParamSchema,
    getCheckpointsQuerySchema
};