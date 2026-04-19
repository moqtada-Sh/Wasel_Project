const express = require("express");
const router = express.Router();

const controller = require("./context.controller");
const validate = require("../../middleware/validation.middleware");

const { coordinates, route } = require("./context.validation");

router.get("/weather", validate(coordinates, "query"), controller.getWeather);
router.get("/reverse", validate(coordinates, "query"), controller.reverseGeocode);
router.get("/route", validate(route, "query"), controller.getRoute);

module.exports = router;