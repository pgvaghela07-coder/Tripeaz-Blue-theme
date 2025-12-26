import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: true,
        },
        action: {
            type: String,
            required: true,
            enum: [
                "create",
                "update",
                "delete",
                "publish",
                "unpublish",
                "schedule",
                "restore",
                "login",
                "logout",
            ],
        },
        resourceType: {
            type: String,
            required: true,
            enum: [
                "blog", 
                "category", 
                "tag", 
                "media", 
                "redirect", 
                "user", 
                "system",
                "booking",
                "route",
                "city",
                "airport",
                "seo"
            ],
        },
        resourceId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
        details: {
            type: String,
            default: "",
        },
        ipAddress: {
            type: String,
            default: "",
        },
        userAgent: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// Indexes for fast queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;









