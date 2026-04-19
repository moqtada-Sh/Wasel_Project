const { DataTypes } = require("sequelize");
const db = require("../../database/connection");

const Incident = db.define("Incident", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    checkpoint_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    reported_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    type: {
        type: DataTypes.ENUM("closure", "delay", "accident", "weather", "hazard"),
        allowNull: false
    },

    severity: {
        type: DataTypes.ENUM("low", "medium", "high", "critical"),
        allowNull: false
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    status: {
        type: DataTypes.ENUM("reported", "verified", "resolved"),
        allowNull: false,
        defaultValue: "reported"
    },

    latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
    },

    longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
    },

    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }

}, {
    tableName: "incidents",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});

module.exports = Incident;