const express = require("express");
const router = express.Router();

const controller = require("./routing.controller");
const auth = require("../../middleware/auth.middleware");
const validate = require("../../middleware/validation.middleware");

const {
    estimateRouteSchema,
    idParamSchema,
    getRoutesQuerySchema
} = require("./routing.validation");

router.post(
    "/estimate",
    auth,
    validate(estimateRouteSchema),
    controller.estimateRoute
);

router.get(
    "/history",
    auth,
    validate(getRoutesQuerySchema, "query"),
    controller.getUserRoutes
);

router.get(
    "/:id",
    auth,
    validate(idParamSchema, "params"),
    controller.getRouteById
);

module.exports = router;