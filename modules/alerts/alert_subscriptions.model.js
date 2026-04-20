const { DataTypes } = require("sequelize");
const db = require("../../database/connection");

const AlertSubscription = db.define("AlertSubscription", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    region: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    incident_type: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    center_lat: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
    },

    center_lng: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
    },

    radius_km: {
        type: DataTypes.FLOAT,
        allowNull: true
    },

    is_muted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    mute_until: {
        type: DataTypes.DATE,
        allowNull: true
    }

}, {
    tableName: "alert_subscriptions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
});

module.exports = AlertSubscription;