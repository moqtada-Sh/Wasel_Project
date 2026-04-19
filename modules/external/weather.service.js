const axios = require("axios");

const getWeatherByCoordinates = async (latitude, longitude) => {
    try {
        const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
            timeout: 8000,
            params: {
                latitude,
                longitude,
                current: "temperature_2m,weather_code,wind_speed_10m"
            }
        });

        return response.data;
    } catch (err) {
        if (err.code === "ECONNABORTED") {
            const error = new Error("Weather API timeout");
            error.status = 504;
            throw error;
        }

        const error = new Error("Failed to fetch weather data");
        error.status = 502;
        throw error;
    }
};

module.exports = {
    getWeatherByCoordinates
};