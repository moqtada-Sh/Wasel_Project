const db = require('../../database/connection');
const { QueryTypes } = require('sequelize');

exports.findUserByEmail = async (email) => {
    const rows = await db.query(
        "SELECT * FROM users WHERE email = :email",
        {
            replacements: { email },
            type: QueryTypes.SELECT
        }
    );

    return rows[0];
};

exports.createUser = async (user) => {
    const { name, email, password_hash } = user;

    const result = await db.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES (:name, :email, :password_hash, :role)`,
        {
            replacements: {
                name,
                email,
                password_hash,
                role: "citizen"
            },
            type: QueryTypes.INSERT
        }
    );

    return result[0];
};