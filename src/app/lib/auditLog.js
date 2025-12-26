import AuditLog from "../models/auditLog.js";
import connectDB from "./db.js";

/**
 * Create an audit log entry
 * @param {Object} options - Audit log options
 * @param {string} options.userId - ID of the user performing the action
 * @param {string} options.action - Action type (create, update, delete, etc.)
 * @param {string} options.resourceType - Type of resource (blog, user, etc.)
 * @param {string} options.resourceId - ID of the resource (optional)
 * @param {string} options.details - Additional details (optional)
 * @param {string} options.ipAddress - IP address of the user (optional)
 * @param {string} options.userAgent - User agent string (optional)
 */
export async function createAuditLog({
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
    
    // Validate required fields
    if (!userId) {
      console.error("❌ Audit log: userId is required but was not provided");
      return;
    }
    
    if (!action) {
      console.error("❌ Audit log: action is required but was not provided");
      return;
    }
    
    if (!resourceType) {
      console.error("❌ Audit log: resourceType is required but was not provided");
      return;
    }
    
    const auditLogData = {
      userId,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress,
      userAgent,
    };
    
    console.log("📝 Creating audit log:", {
      userId: userId.toString(),
      action,
      resourceType,
      resourceId: resourceId ? resourceId.toString() : null,
      details: details.substring(0, 100), // Log first 100 chars
    });
    
    const result = await AuditLog.create(auditLogData);
    console.log("✅ Audit log created successfully:", result._id.toString());
    
    return result;
  } catch (error) {
    // Don't throw error - audit logging should not break the main functionality
    console.error("❌ Error creating audit log:", error);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error name:", error.name);
    if (error.errors) {
      console.error("❌ Validation errors:", JSON.stringify(error.errors, null, 2));
    }
    console.error("❌ Audit log data that failed:", {
      userId: userId?.toString(),
      action,
      resourceType,
      resourceId: resourceId?.toString(),
      details: details.substring(0, 100),
    });
    
    // If it's a validation error, log the specific field that failed
    if (error.name === 'ValidationError') {
      Object.keys(error.errors || {}).forEach(key => {
        console.error(`❌ Validation error for field "${key}":`, error.errors[key].message);
      });
    }
  }
}

/**
 * Get client IP address from request
 */
export function getClientIP(req) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const realIP = req.headers.get("x-real-ip");
    return forwarded?.split(",")[0]?.trim() || realIP || "unknown";
  } catch (error) {
    return "unknown";
  }
}

/**
 * Get user agent from request
 */
export function getUserAgent(req) {
  try {
    return req.headers.get("user-agent") || "unknown";
  } catch (error) {
    return "unknown";
  }
}

