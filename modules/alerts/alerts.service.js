const { Op } = require("sequelize");
const Alert = require("./alerts.model");
const AlertSubscription = require("./alert_subscriptions.model");
const Notification = require("./notifications.model");
const Incident = require("../incidents/incidents.model");
const Checkpoint = require("../checkpoints/checkpoints.model");
const db = require("../../database/connection");

// ================= HELPERS =================
const toRad = (value) => (value * Math.PI) / 180;

const haversineKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const createError = (message, status) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

const mapIncidentSeverityToAlertSeverity = (severity) => {
    if (severity === "critical" || severity === "high") return "critical";
    if (severity === "medium") return "warning";
    return "info";
};

const isSubscriptionMuted = (subscription) => {
    if (!subscription.is_muted) return false;
    if (!subscription.mute_until) return true;
    return new Date(subscription.mute_until) > new Date();
};

const matchesSubscription = (subscription, incident, incidentRegion) => {
    const matchesType =
        !subscription.incident_type ||
        subscription.incident_type === incident.type;

    let matchesGeo = true;

    if (
        subscription.center_lat !== null &&
        subscription.center_lng !== null &&
        subscription.radius_km !== null
    ) {
        const distance = haversineKm(
            Number(subscription.center_lat),
            Number(subscription.center_lng),
            Number(incident.latitude),
            Number(incident.longitude)
        );

        matchesGeo = distance <= Number(subscription.radius_km);
    } else if (subscription.region) {
        matchesGeo =
            !!incidentRegion &&
            subscription.region.toLowerCase() === incidentRegion.toLowerCase();
    }

    return matchesType && matchesGeo;
};

// ================= SUBSCRIPTIONS =================
const createSubscription = async (data, userId) => {
    const subscription = await AlertSubscription.create({
        user_id: userId,
        region: data.region || null,
        incident_type: data.incident_type || null,
        center_lat: data.center_lat ?? null,
        center_lng: data.center_lng ?? null,
        radius_km: data.radius_km ?? null
    });

    await db.query(
        `
            INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address)
            VALUES (?, ?, ?, ?, ?)
        `,
        {
            replacements: [
                userId,
                "create_alert_subscription",
                "alert_subscription",
                subscription.id,
                null
            ]
        }
    );

    return subscription;
};

const getMySubscriptions = async (userId) => {
    return await AlertSubscription.findAll({
        where: { user_id: userId },
        order: [["created_at", "DESC"]]
    });
};

const muteSubscription = async (id, userId, muteUntil) => {
    const subscription = await AlertSubscription.findOne({
        where: { id, user_id: userId }
    });

    if (!subscription) {
        throw createError("Subscription not found", 404);
    }

    await subscription.update({
        is_muted: !!muteUntil,
        mute_until: muteUntil || null
    });

    return subscription;
};

const deleteSubscription = async (id, userId) => {
    const subscription = await AlertSubscription.findOne({
        where: { id, user_id: userId }
    });

    if (!subscription) {
        throw createError("Subscription not found", 404);
    }

    await subscription.destroy();

    return {
        message: "Subscription deleted successfully"
    };
};

// ================= NOTIFICATIONS =================
const getMyNotifications = async ({ page = 1, limit = 10, is_read }, userId) => {
    const offset = (page - 1) * limit;
    const where = { user_id: userId };

    if (typeof is_read !== "undefined") {
        where.is_read = is_read;
    }

    const { count, rows } = await Notification.findAndCountAll({
        where,
        order: [["created_at", "DESC"]],
        limit,
        offset
    });

    return {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
        results: rows
    };
};

const markNotificationRead = async (id, userId) => {
    const notification = await Notification.findOne({
        where: {
            id,
            user_id: userId
        }
    });

    if (!notification) {
        throw createError("Notification not found", 404);
    }

    await notification.update({ is_read: true });

    return notification;
};

// ================= INTERNAL TRIGGER =================
const triggerAlertsForVerifiedIncident = async (incidentId) => {
    const transaction = await db.transaction();

    try {
        const incident = await Incident.findByPk(incidentId, {
            include: [
                {
                    model: Checkpoint,
                    as: "checkpoint"
                }
            ],
            transaction
        });

        if (!incident) {
            throw createError("Incident not found", 404);
        }

        if (incident.status !== "verified") {
            await transaction.rollback();
            return {
                message: "No alerts created because incident is not verified"
            };
        }

        const existingAlert = await Alert.findOne({
            where: { incident_id: incident.id },
            transaction
        });

        if (existingAlert) {
            await transaction.rollback();
            return {
                message: "Alert already exists for this incident",
                alert: existingAlert
            };
        }

        const incidentRegion = incident.checkpoint ? incident.checkpoint.region : null;

        const subscriptions = await AlertSubscription.findAll({
            where: {
                [Op.or]: [
                    { is_muted: false },
                    {
                        is_muted: true,
                        mute_until: {
                            [Op.not]: null,
                            [Op.lte]: new Date()
                        }
                    }
                ]
            },
            transaction
        });

        const matchedUserIds = new Set();

        for (const subscription of subscriptions) {
            if (isSubscriptionMuted(subscription)) continue;

            if (matchesSubscription(subscription, incident, incidentRegion)) {
                matchedUserIds.add(subscription.user_id);
            }
        }

        const alert = await Alert.create({
            incident_id: incident.id,
            title: `Verified ${incident.type} alert`,
            message: `A verified ${incident.type} incident was reported near (${incident.latitude}, ${incident.longitude})${incidentRegion ? ` in ${incidentRegion}` : ""}.`,
            severity: mapIncidentSeverityToAlertSeverity(incident.severity),
            external_cache_id: null
        }, { transaction });

        if (matchedUserIds.size > 0) {
            await Notification.bulkCreate(
                Array.from(matchedUserIds).map((userId) => ({
                    user_id: userId,
                    alert_id: alert.id,
                    message: alert.message
                })),
                { transaction }
            );
        }

        await db.query(
            `
            INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address)
            VALUES (?, ?, ?, ?, ?)
            `,
            {
                replacements: [
                    incident.reported_by,
                    "trigger_alert_for_verified_incident",
                    "alert",
                    alert.id,
                    null
                ],
                transaction
            }
        );

        await transaction.commit();

        return {
            message: "Alert records created successfully",
            alert,
            notified_users_count: matchedUserIds.size
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    createSubscription,
    getMySubscriptions,
    muteSubscription,
    deleteSubscription,
    getMyNotifications,
    markNotificationRead,
    triggerAlertsForVerifiedIncident
};