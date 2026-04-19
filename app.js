const express = require("express");
const logger = require("morgan");
const helmet = require("helmet");

const db = require("./database/connection");
require("./database/associations");

const authRoutes = require("./modules/auth/auth.routes");
const incidentsRoutes = require("./modules/incidents/incidents.routes");
const checkpointsRoutes = require("./modules/checkpoints/checkpoints.routes");
const reportsRoutes = require("./modules/reports/reports.routes");
const routingRoutes = require("./modules/routing/routing.routes");
const alertsRoutes = require("./modules/alerts/alerts.routes");
const contextRoutes = require("./modules/context/context.routes");

const errorMiddleware = require("./middleware/error.middleware");

const app = express();
const API_PREFIX = "/api/v1";


app.use(helmet());


app.use(logger("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

// ===== Root health =====
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Wasel Mobility API running",
    version: "v1"
  });
});


app.get(`${API_PREFIX}`, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Wasel API v1 is running"
  });
});


app.get(`${API_PREFIX}/test-db`, async (req, res) => {
  try {
    await db.authenticate();

    return res.status(200).json({
      success: true,
      message: "Database connected successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message
    });
  }
});


app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/incidents`, incidentsRoutes);
app.use(`${API_PREFIX}/checkpoints`, checkpointsRoutes);
app.use(`${API_PREFIX}/reports`, reportsRoutes);
app.use(`${API_PREFIX}/routing`, routingRoutes);
app.use(`${API_PREFIX}/alerts`, alertsRoutes);
app.use(`${API_PREFIX}/context`, contextRoutes);


app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Wasel API running on port ${PORT}`);
});


app.use(errorMiddleware);

module.exports = app;