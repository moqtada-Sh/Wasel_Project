const Joi = require("joi");

const createReportSchema = Joi.object({
    category: Joi.string()
        .valid("closure", "delay", "accident", "weather", "hazard")
        .required(),

    description: Joi.string()
        .trim()
        .max(1000)
        .required(),

    latitude: Joi.number()
        .min(-90)
        .max(90)
        .required(),

    longitude: Joi.number()
        .min(-180)
        .max(180)
        .required()
});

const voteSchema = Joi.object({
    vote: Joi.string()
        .valid("up", "down")
        .required()
});

const moderateSchema = Joi.object({
    action: Joi.string()
        .valid("approve", "reject", "merge", "delete")
        .required(),

    reason: Joi.string()
        .trim()
        .allow(null, "")
});

const idParamSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
});

const getReportsQuerySchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10),

    category: Joi.string()
        .valid("closure", "delay", "accident", "weather", "hazard"),

    status: Joi.string()
        .valid("pending", "approved", "rejected"),

    sortBy: Joi.string()
        .valid("created_at", "confidence_score", "status", "category")
        .default("created_at"),

    order: Joi.string()
        .uppercase()
        .valid("ASC", "DESC")
        .default("DESC")
});

module.exports = {
    createReportSchema,
    voteSchema,
    moderateSchema,
    idParamSchema,
    getReportsQuerySchema
};