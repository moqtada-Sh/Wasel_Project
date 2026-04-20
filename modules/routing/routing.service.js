const { Op } = require("sequelize");
const Route = require("./routing.model");
const RouteIncidentEffect = require("./route_incident_effects.model");
const Incident = require("../incidents/incidents.model");
const Checkpoint = require("../checkpoints/checkpoints.model");
const db = require("../../database/connection");

const createError = (message, status) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

const toRad = (value) => (value * Math.PI) / 180;

const haversineKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const pointNearSegment = (pointLat, pointLng, startLat, startLng, endLat, endLng, thresholdKm = 3) => {
    const d1 = haversineKm(pointLat, pointLng, startLat, startLng);
    const d2 = haversineKm(pointLat, pointLng, endLat, endLng);
    const routeDistance = haversineKm(startLat, startLng, endLat, endLng);

    return d1 + d2 <= routeDistance + thresholdKm;
};

const estimateBaseDurationMinutes = (distanceKm) => {
    const avgSpeedKmH = 45;
    return (distanceKm / avgSpeedKmH) * 60;
};

const getDelayBySeverity = (severity) => {
    const map = {
        low: 5,
        medium: 10,
        high: 20,
        critical: 35
    };
    return map[severity] || 5;
};

const getImpactLevelBySeverity = (severity) => {
    const map = {
        low: "low",
        medium: "medium",
        high: "high",
        critical: "high"
    };
    return map[severity] || "low";
};

const generatePolyline = (startLat, startLng, endLat, endLng, steps = 5) => {
    const points = [];

    for (let i = 0; i <= steps; i++) {
        const ratio = i / steps;
        points.push({
            lat: Number((startLat + (endLat - startLat) * ratio).toFixed(6)),
            lng: Number((startLng + (endLng - startLng) * ratio).toFixed(6))
        });
    }

    return points;
};

const estimateRoute = async (data, userId) => {
    const {
        start_lat,
        start_lng,
        end_lat,
        end_lng,
        avoid_checkpoint_ids = [],
        avoid_areas = []
    } = data;

    const baseDistanceKm = haversineKm(start_lat, start_lng, end_lat, end_lng);
    let adjustedDistanceKm = baseDistanceKm;
    let adjustedDurationMinutes = estimateBaseDurationMinutes(baseDistanceKm);

    const metadata = {
        base_distance_km: Number(baseDistanceKm.toFixed(2)),
        base_duration_minutes: Number(adjustedDurationMinutes.toFixed(2)),
        delays: [],
        avoided_checkpoints: [],
        ignored_checkpoint_ids: [],
        avoided_areas: [],
        affecting_incidents: [],
        nearby_checkpoints: []
    };

    const allCheckpoints = await Checkpoint.findAll({
        where: {
            is_deleted: false
        }
    });

    allCheckpoints.forEach((checkpoint) => {
        const nearRoute = pointNearSegment(
            Number(checkpoint.latitude),
            Number(checkpoint.longitude),
            start_lat,
            start_lng,
            end_lat,
            end_lng,
            3
        );

        if (nearRoute) {
            metadata.nearby_checkpoints.push({
                id: checkpoint.id,
                name: checkpoint.name,
                region: checkpoint.region,
                status: checkpoint.status
            });
        }
    });

    if (avoid_checkpoint_ids.length > 0) {
        const checkpoints = await Checkpoint.findAll({
            where: {
                id: avoid_checkpoint_ids,
                is_deleted: false
            }
        });

        const foundIds = new Set(checkpoints.map((checkpoint) => checkpoint.id));

        avoid_checkpoint_ids.forEach((id) => {
            if (!foundIds.has(id)) {
                metadata.ignored_checkpoint_ids.push(id);
            }
        });

        checkpoints.forEach((checkpoint) => {
            metadata.avoided_checkpoints.push({
                id: checkpoint.id,
                name: checkpoint.name,
                region: checkpoint.region
            });
        });

        adjustedDistanceKm += checkpoints.length * 2;
        adjustedDurationMinutes += checkpoints.length * 6;
    }

    if (avoid_areas.length > 0) {
        avoid_areas.forEach((area) => {
            const nearArea = pointNearSegment(
                area.center_lat,
                area.center_lng,
                start_lat,
                start_lng,
                end_lat,
                end_lng,
                area.radius_km
            );

            if (nearArea) {
                metadata.avoided_areas.push({
                    name: area.name || "Unnamed area",
                    radius_km: area.radius_km
                });

                adjustedDistanceKm += 3;
                adjustedDurationMinutes += 8;
            }
        });
    }

    const incidents = await Incident.findAll({
        where: {
            is_deleted: false,
            status: {
                [Op.in]: ["reported", "verified"]
            }
        }
    });

    const affectingIncidents = [];

    for (const incident of incidents) {
        const nearRoute = pointNearSegment(
            Number(incident.latitude),
            Number(incident.longitude),
            start_lat,
            start_lng,
            end_lat,
            end_lng,
            3
        );

        if (!nearRoute) continue;

        const delay = getDelayBySeverity(incident.severity);
        const impactLevel = getImpactLevelBySeverity(incident.severity);

        affectingIncidents.push({
            incident_id: incident.id,
            impact_level: impactLevel,
            delay_minutes: delay
        });

        metadata.affecting_incidents.push({
            id: incident.id,
            type: incident.type,
            severity: incident.severity,
            status: incident.status,
            delay_minutes: delay
        });

        metadata.delays.push(
            `${incident.type} (${incident.severity}) added ${delay} minutes`
        );

        adjustedDurationMinutes += delay;
    }

    const polylinePoints = generatePolyline(start_lat, start_lng, end_lat, end_lng, 5);

    const route = await Route.create({
        user_id: userId,
        start_lat,
        start_lng,
        end_lat,
        end_lng,
        distance_km: Number(adjustedDistanceKm.toFixed(2)),
        duration_minutes: Number(adjustedDurationMinutes.toFixed(2)),
        route_polyline: JSON.stringify(polylinePoints)
    });

    for (const effect of affectingIncidents) {
        await RouteIncidentEffect.create({
            route_id: route.id,
            incident_id: effect.incident_id,
            impact_level: effect.impact_level,
            delay_minutes: effect.delay_minutes
        });
    }

    await db.query(
        `
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address)
        VALUES (?, ?, ?, ?, ?)
        `,
        {
            replacements: [userId, "estimate_route", "route", route.id, null]
        }
    );

    return {
        message: "Route estimated successfully",
        route: {
            id: route.id,
            start_lat: route.start_lat,
            start_lng: route.start_lng,
            end_lat: route.end_lat,
            end_lng: route.end_lng,
            estimated_distance_km: Number(route.distance_km),
            estimated_duration_minutes: Number(route.duration_minutes),
            route_polyline: JSON.parse(route.route_polyline)
        },
        metadata
    };
};

const getUserRoutes = async ({ page, limit, sortBy = "created_at", order = "DESC" }, userId) => {
    const offset = (page - 1) * limit;

    const allowedSortFields = ["created_at", "distance_km", "duration_minutes"];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "created_at";
    const safeOrder = String(order).toUpperCase() === "ASC" ? "ASC" : "DESC";

    const { count, rows } = await Route.findAndCountAll({
        where: { user_id: userId },
        order: [[safeSortBy, safeOrder]],
        limit,
        offset
    });

    return {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
        sortBy: safeSortBy,
        order: safeOrder,
        results: rows
    };
};

const getRouteById = async (id, userId) => {
    const route = await Route.findOne({
        where: {
            id,
            user_id: userId
        }
    });

    if (!route) {
        throw createError("Route not found", 404);
    }

    const effects = await RouteIncidentEffect.findAll({
        where: { route_id: id }
    });

    return {
        route,
        effects
    };
};

module.exports = {
    estimateRoute,
    getUserRoutes,
    getRouteById
};