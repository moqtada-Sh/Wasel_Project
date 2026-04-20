const { DataTypes } = require("sequelize");
const db = require("../../database/connection");

const Notification = db.define("Notification", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    alert_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    message: {
        type: DataTypes.STRING(255),
        allowNull: true
    }

}, {
    tableName: "notifications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
});

module.exports = Notification;