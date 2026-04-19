const Incident = require("../modules/incidents/incidents.model");
const Checkpoint = require("../modules/checkpoints/checkpoints.model");

const Route = require("../modules/routing/routing.model");
const RouteIncidentEffect = require("../modules/routing/route_incident_effects.model");

const Report = require("../modules/reports/reports.model");
const ReportVote = require("../modules/report_votes/report_votes.model");


// ================= INCIDENTS <-> CHECKPOINTS =================
Incident.belongsTo(Checkpoint, {
    foreignKey: "checkpoint_id",
    as: "checkpoint"
});

Checkpoint.hasMany(Incident, {
    foreignKey: "checkpoint_id",
    as: "incidents"
});


// ================= ROUTES <-> ROUTE INCIDENT EFFECTS =================
Route.hasMany(RouteIncidentEffect, {
    foreignKey: "route_id",
    as: "incident_effects"
});

RouteIncidentEffect.belongsTo(Route, {
    foreignKey: "route_id",
    as: "route"
});

Incident.hasMany(RouteIncidentEffect, {
    foreignKey: "incident_id",
    as: "route_effects"
});

RouteIncidentEffect.belongsTo(Incident, {
    foreignKey: "incident_id",
    as: "incident"
});


// ================= REPORTS <-> REPORT VOTES =================
Report.hasMany(ReportVote, {
    foreignKey: "report_id",
    as: "votes"
});

ReportVote.belongsTo(Report, {
    foreignKey: "report_id",
    as: "report"
});