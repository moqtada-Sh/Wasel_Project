const express = require("express");
const router = express.Router();

const incidentsController = require("./incidents.controller");
const validate = require("../../middleware/validation.middleware");
const authMiddleware = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/authorizeRoles.middleware");

const {
    createIncidentSchema,
    updateIncidentSchema,
    statusSchema,
    idParamSchema,
    getIncidentsQuerySchema
} = require("./incidents.validation");

// Public
router.get(
    "/",
    validate(getIncidentsQuerySchema, "query"),
    incidentsController.getIncidents
);

router.get(
    "/:id",
    validate(idParamSchema, "params"),
    incidentsController.getIncidentById
);

// Authenticated users
router.post(
    "/",
    authMiddleware,
    validate(createIncidentSchema),
    incidentsController.createIncident
);

router.put(
    "/:id",
    authMiddleware,
    validate(idParamSchema, "params"),
    validate(updateIncidentSchema),
    incidentsController.updateIncident
);

router.delete(
    "/:id",
    authMiddleware,
    validate(idParamSchema, "params"),
    incidentsController.deleteIncident
);

// Admin / Moderator workflow
router.patch(
    "/:id/status",
    authMiddleware,
    authorizeRoles("admin", "moderator"),
    validate(idParamSchema, "params"),
    validate(statusSchema),
    incidentsController.changeIncidentStatus
);

module.exports = router;