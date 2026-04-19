module.exports = (schema, property = "body") => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], {
            abortEarly: false
        });

        if (error) {
            return res.status(400).json({
                message: "Validation Error",
                details: error.details.map(err => err.message)
            });
        }

        next();
    };
};