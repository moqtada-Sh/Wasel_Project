const express = require("express");
const router = express.Router();

const controller = require("./checkpoints.controller");
const validate = require("../../middleware/validation.middleware");
const auth = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/authorizeRoles.middleware");

const {
    createCheckpointSchema,
    updateCheckpointSchema,
    idParamSchema,
    getCheckpointsQuerySchema
} = require("./checkpoints.validation");

// Public
router.get(
    "/",
    validate(getCheckpointsQuerySchema, "query"),
    controller.getCheckpoints
);

router.get(
    "/:id",
    validate(idParamSchema, "params"),
    controller.getCheckpointById
);

// Admin only
router.post(
    "/",
    auth,
    authorizeRoles("admin"),
    validate(createCheckpointSchema),
    controller.createCheckpoint
);

router.put(
    "/:id",
    auth,
    authorizeRoles("admin"),
    validate(idParamSchema, "params"),
    validate(updateCheckpointSchema),
    controller.updateCheckpoint
);

router.delete(
    "/:id",
    auth,
    authorizeRoles("admin"),
    validate(idParamSchema, "params"),
    controller.deleteCheckpoint
);

module.exports = router;