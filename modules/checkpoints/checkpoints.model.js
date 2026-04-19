const { DataTypes } = require("sequelize");
const db = require("../../database/connection");

const Checkpoint = db.define("Checkpoint", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM("open", "closed", "delayed"),
        allowNull: false,
        defaultValue: "open"
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    region: {
        type: DataTypes.STRING(100),
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

    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }

}, {
    tableName: "checkpoints",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
});

module.exports = Checkpoint;