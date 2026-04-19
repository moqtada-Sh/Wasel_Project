const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const repo = require("./auth.repository");

const ACCESS_SECRET = process.env.ACCESS_SECRET || "access_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secret";

exports.register = async (data) => {
    const { name, email, password } = data;

    const existing = await repo.findUserByEmail(email);
    if (existing) {
        const err = new Error("Email already exists");
        err.status = 409;
        throw err;
    }

    const hash = await bcrypt.hash(password, 10);

    try {
        const userId = await repo.createUser({
            name,
            email,
            password_hash: hash
        });

        return {
            success: true,
            message: "User registered successfully",
            userId
        };
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError" || error.original?.code === "ER_DUP_ENTRY") {
            const err = new Error("Email already exists");
            err.status = 409;
            throw err;
        }

        throw error;
    }
};

exports.login = async (data) => {
    const { email, password } = data;

    const user = await repo.findUserByEmail(email);
    if (!user) {
        const err = new Error("Invalid credentials");
        err.status = 401;
        throw err;
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
        const err = new Error("Invalid credentials");
        err.status = 401;
        throw err;
    }

    const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        ACCESS_SECRET,
        { expiresIn: "2h" }
    );

    const refreshToken = jwt.sign(
        { id: user.id, role: user.role },
        REFRESH_SECRET,
        { expiresIn: "14d" }
    );

    return {
        success: true,
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
};

exports.refresh = async (token) => {
    try {
        const decoded = jwt.verify(token, REFRESH_SECRET);

        const accessToken = jwt.sign(
            { id: decoded.id, role: decoded.role },
            ACCESS_SECRET,
            { expiresIn: "2h" }
        );

        return {
            success: true,
            accessToken
        };
    } catch (error) {
        const err = new Error("Invalid refresh token");
        err.status = 401;
        throw err;
    }
};