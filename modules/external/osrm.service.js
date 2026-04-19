const axios = require("axios");

const getExternalRoute = async (startLat, startLng, endLat, endLng) => {
    try {
        const coordinates = `${startLng},${startLat};${endLng},${endLat}`;

        const response = await axios.get(
            `https://router.project-osrm.org/route/v1/driving/${coordinates}`,
            {
                timeout: 10000,
                params: {
                    overview: "full",
                    geometries: "geojson"
                }
            }
        );

        if (!response.data || response.data.code !== "Ok") {
            const error = new Error("Routing API returned an invalid response");
            error.status = 502;
            throw error;
        }

        return response.data;
    } catch (err) {
        if (err.code === "ECONNABORTED") {
            const error = new Error("Routing API timeout");
            error.status = 504;
            throw error;
        }

        if (err.status) throw err;

        const error = new Error("Failed to fetch routing data");
        error.status = 502;
        throw error;
    }
};

module.exports = {
    getExternalRoute
};