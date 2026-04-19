const { DataTypes } = require("sequelize");
const db = require("../../database/connection");

const Report = db.define("Report", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    category: {
        type: DataTypes.ENUM("closure", "delay", "accident", "weather", "hazard"),
        allowNull: false
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false
    },

    longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending"
    },

    duplicate_of: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    confidence_score: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },

    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }

}, {
    tableName: "reports",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
});

module.exports = Report;