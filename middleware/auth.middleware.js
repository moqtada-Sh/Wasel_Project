const jwt = require('jsonwebtoken');


const ACCESS_SECRET = process.env.ACCESS_SECRET || "access_secret";

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Authorization header missing"
            });
        }


        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Invalid token format"
            });
        }

        const token = authHeader.split(" ")[1];


        if (!token) {
            return res.status(401).json({
                message: "Token missing"
            });
        }


        const decoded = jwt.verify(token, ACCESS_SECRET);


        req.user = decoded;

        next();

    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};