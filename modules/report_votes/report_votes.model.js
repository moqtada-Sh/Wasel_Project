const { DataTypes } = require("sequelize");
const db = require("../../database/connection");

const ReportVote = db.define("ReportVote", {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    report_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    vote: {
        type: DataTypes.ENUM("up", "down"),
        allowNull: false
    }

}, {
    tableName: "report_votes",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,

    indexes: [
        {
            unique: true,
            fields: ["report_id", "user_id"]
        },
        {
            fields: ["report_id"]
        }
    ]
});

module.exports = ReportVote;