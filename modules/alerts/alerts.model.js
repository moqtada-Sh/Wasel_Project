const { DataTypes } = require("sequelize");
const db = require("../../database/connection");

const Alert = db.define("Alert", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    incident_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    title: {
        type: DataTypes.STRING(150),
        allowNull: true
    },

    message: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    severity: {
        type: DataTypes.ENUM("info", "warning", "critical"),
        allowNull: true
    },

    external_cache_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }

}, {
    tableName: "alerts",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
});

module.exports = Alert;