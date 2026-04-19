const express = require("express");
const router = express.Router();

const controller = require("./reports.controller");
const auth = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/authorizeRoles.middleware");
const validate = require("../../middleware/validation.middleware");

const {
    createReportSchema,
    voteSchema,
    moderateSchema,
    idParamSchema,
    getReportsQuerySchema
} = require("./reports.validation");

router.get(
    "/",
    validate(getReportsQuerySchema, "query"),
    controller.getReports
);

router.get(
    "/:id",
    validate(idParamSchema, "params"),
    controller.getReportById
);

router.post(
    "/",
    auth,
    validate(createReportSchema),
    controller.createReport
);

router.post(
    "/:id/vote",
    auth,
    validate(idParamSchema, "params"),
    validate(voteSchema),
    controller.voteReport
);

router.patch(
    "/:id/moderate",
    auth,
    authorize("admin", "moderator"),
    validate(idParamSchema, "params"),
    validate(moderateSchema),
    controller.moderateReport
);

module.exports = router;