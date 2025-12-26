import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    description: {
        type: String,
        default: "",
    },
    permissions: {
        // Blog management
        canViewBlog: { type: Boolean, default: false },
        canCreateBlog: { type: Boolean, default: false },
        canEditBlog: { type: Boolean, default: false },
        canDeleteBlog: { type: Boolean, default: false },
        canPublishBlog: { type: Boolean, default: false },
        
        // User management
        canViewUsers: { type: Boolean, default: false },
        canCreateUser: { type: Boolean, default: false },
        canEditUser: { type: Boolean, default: false },
        canDeleteUser: { type: Boolean, default: false },
        canAssignRole: { type: Boolean, default: false },
        
        // Content management
        canManageCategories: { type: Boolean, default: false },
        canManageTags: { type: Boolean, default: false },
        canManageMedia: { type: Boolean, default: false },
        
        // Routes, Cities, Airports management
        canManageRoutes: { type: Boolean, default: false },
        canManageCities: { type: Boolean, default: false },
        canManageAirports: { type: Boolean, default: false },
        
        // SEO management
        canManageSEO: { type: Boolean, default: false },
        
        // Booking management
        canViewBookings: { type: Boolean, default: false },
        canManageBookings: { type: Boolean, default: false },
        
        // System settings
        canManageSettings: { type: Boolean, default: false },
        canViewAuditLogs: { type: Boolean, default: false },
        
        // Super admin - has all permissions
        isSuperAdmin: { type: Boolean, default: false },
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);

export default Role;
