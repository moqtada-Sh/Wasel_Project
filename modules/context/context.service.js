const crypto = require("crypto");
const { QueryTypes } = require("sequelize");
const weatherService = require("../external/weather.service");
const geocodingService = require("../external/geocoding.service");
const osrmService = require("../external/osrm.service");
const db = require("../../database/connection");

const createError = (message, status) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

const buildRequestHash = (requestData) => {
    return crypto
        .createHash("sha256")
        .update(JSON.stringify(requestData))
        .digest("hex");
};

const getCachedExternalApiResponse = async (apiName, requestData) => {
    const requestHash = buildRequestHash(requestData);

    const rows = await db.query(
        `
        SELECT id, response_data, expires_at
        FROM external_api_cache
        WHERE api_name = :apiName
          AND request_hash = :requestHash
          AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1
        `,
        {
            replacements: { apiName, requestHash },
            type: QueryTypes.SELECT
        }
    );

    if (!rows.length) return null;

    try {
        return JSON.parse(rows[0].response_data);
    } catch (err) {
        return null;
    }
};

const saveExternalApiCache = async (apiName, requestData, responseBody) => {
    try {
        const requestHash = buildRequestHash(requestData);

        await db.query(
            `
            INSERT INTO external_api_cache
            (api_name, request_hash, response_data, expires_at)
            VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))
            `,
            {
                replacements: [
                    apiName,
                    requestHash,
                    JSON.stringify(responseBody)
                ]
            }
        );
    } catch (err) {
        console.error("Cache save error:", err.message);
    }
};

const getWeather = async (latitude, longitude) => {
    const requestData = { latitude, longitude };

    const cached = await getCachedExternalApiResponse("open-meteo", requestData);
    if (cached) {
        return {
            message: "Weather fetched successfully",
            provider: "Open-Meteo",
            source: "cache",
            data: cached
        };
    }

    try {
        const data = await weatherService.getWeatherByCoordinates(latitude, longitude);

        await saveExternalApiCache("open-meteo", requestData, data);

        return {
            message: "Weather fetched successfully",
            provider: "Open-Meteo",
            source: "live",
            data
        };
    } catch (err) {
        throw createError(err.message || "Weather service unavailable", err.status || 502);
    }
};

const getAddress = async (latitude, longitude) => {
    const requestData = { latitude, longitude };

    const cached = await getCachedExternalApiResponse("nominatim", requestData);
    if (cached) {
        return {
            message: "Address fetched successfully",
            provider: "Nominatim",
            source: "cache",
            data: cached
        };
    }

    try {
        const data = await geocodingService.reverseGeocode(latitude, longitude);

        await saveExternalApiCache("nominatim", requestData, data);

        return {
            message: "Address fetched successfully",
            provider: "Nominatim",
            source: "live",
            data
        };
    } catch (err) {
        throw createError(err.message || "Geocoding service unavailable", err.status || 502);
    }
};

const getRoute = async (startLat, startLng, endLat, endLng) => {
    const requestData = { startLat, startLng, endLat, endLng };

    const cached = await getCachedExternalApiResponse("osrm", requestData);
    if (cached) {
        return {
            message: "Route fetched successfully",
            provider: "OSRM",
            source: "cache",
            data: cached
        };
    }

    try {
        const data = await osrmService.getExternalRoute(startLat, startLng, endLat, endLng);

        await saveExternalApiCache("osrm", requestData, data);

        return {
            message: "Route fetched successfully",
            provider: "OSRM",
            source: "live",
            data
        };
    } catch (err) {
        throw createError(err.message || "Routing service unavailable", err.status || 502);
    }
};

module.exports = {
    getWeather,
    getAddress,
    getRoute
};