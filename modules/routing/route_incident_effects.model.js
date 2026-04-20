const { DataTypes } = require("sequelize");
const db = require("../../database/connection");

const RouteIncidentEffect = db.define("RouteIncidentEffect", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    route_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    incident_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    impact_level: {
        type: DataTypes.ENUM("low", "medium", "high"),
        allowNull: false
    },

    delay_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }

}, {
    tableName: "route_incident_effects",
    timestamps: false
});

module.exports = RouteIncidentEffect;