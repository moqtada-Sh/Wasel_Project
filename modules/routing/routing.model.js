const { DataTypes } = require("sequelize");
const db = require("../../database/connection");

const Route = db.define("Route", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    start_lat: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false
    },

    start_lng: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false
    },

    end_lat: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false
    },

    end_lng: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false
    },

    distance_km: {
        type: DataTypes.FLOAT,
        allowNull: false
    },

    duration_minutes: {
        type: DataTypes.FLOAT,
        allowNull: false
    },

    route_polyline: {
        type: DataTypes.TEXT,
        allowNull: true
    }

}, {
    tableName: "routes",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
});

module.exports = Route;