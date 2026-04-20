const express = require("express");
const router = express.Router();

const controller = require("./alerts.controller");
const auth = require("../../middleware/auth.middleware");
const validate = require("../../middleware/validation.middleware");

const {
    subscriptionSchema,
    muteSchema,
    idParamSchema,
    notificationsQuerySchema
} = require("./alerts.validation");

// subscriptions
router.post(
    "/subscriptions",
    auth,
    validate(subscriptionSchema),
    controller.createSubscription
);

router.get(
    "/subscriptions/me",
    auth,
    controller.getMySubscriptions
);

router.patch(
    "/subscriptions/:id/mute",
    auth,
    validate(idParamSchema, "params"),
    validate(muteSchema),
    controller.muteSubscription
);

router.delete(
    "/subscriptions/:id",
    auth,
    validate(idParamSchema, "params"),
    controller.deleteSubscription
);

// notifications
router.get(
    "/notifications/me",
    auth,
    validate(notificationsQuerySchema, "query"),
    controller.getMyNotifications
);

router.patch(
    "/notifications/:id/read",
    auth,
    validate(idParamSchema, "params"),
    controller.markNotificationRead
);

module.exports = router;