import connectDB from "../app/lib/db";
import AuditLog from "../app/models/auditLog";

/**
 * Log an audit event
 * @param {Object} params - Audit log parameters
 * @param {string} params.userId - User ID who performed the action
 * @param {string} params.action - Action type (create, update, delete, etc.)
 * @param {string} params.resourceType - Type of resource (blog, category, etc.)
 * @param {string} params.resourceId - ID of the resource (optional)
 * @param {string} params.details - Additional details
 * @param {string} params.ipAddress - IP address of the user
 * @param {string} params.userAgent - User agent string
 */
export async function logAudit({
    userId,
    action,
    resourceType,
    resourceId = null,
    details = "",
    ipAddress = "",
    userAgent = "",
}) {
    try {
        await connectDB();

        await AuditLog.create({
            userId,
            action,
            resourceType,
            resourceId,
            details,
            ipAddress,
            userAgent,
        });
    } catch (error) {
        console.error("Error logging audit:", error);
        // Don't throw - audit logging should not break the main flow
    }
}

/**
 * Get client IP address from request
 */
export function getClientIp(req) {
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    return forwarded?.split(",")[0] || realIp || "";
}

/**
 * Get user agent from request
 */
export function getUserAgent(req) {
    return req.headers.get("user-agent") || "";
}









