const axios = require("axios");

const reverseGeocode = async (latitude, longitude) => {
    try {
        const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
            timeout: 8000,
            params: {
                lat: latitude,
                lon: longitude,
                format: "jsonv2"
            },
            headers: {
                "User-Agent": "Wasel-Mobility-API/1.0"
            }
        });

        return response.data;
    } catch (err) {
        if (err.code === "ECONNABORTED") {
            const error = new Error("Geocoding API timeout");
            error.status = 504;
            throw error;
        }

        const error = new Error("Failed to fetch geocoding data");
        error.status = 502;
        throw error;
    }
};

module.exports = {
    reverseGeocode
};