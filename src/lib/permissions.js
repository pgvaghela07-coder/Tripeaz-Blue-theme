import connectDB from "../app/lib/db";
import Role from "../app/models/role";

/**
 * Check if user has a specific permission
 * @param {Object} user - User object with role or roleSlug
 * @param {string} permission - Permission name (e.g., 'blogCreate', 'blogEdit')
 * @returns {Promise<boolean>}
 */
export async function hasPermission(user, permission) {
    try {
        await connectDB();

        // If no user, deny access
        if (!user) {
            return false;
        }

        // Super admin has all permissions
        if (user.roleSlug === "super-admin" || user.role === "super-admin") {
            return true;
        }

        // Get role from database
        let role;
        if (user.role && typeof user.role === 'object') {
            role = user.role;
        } else if (user.role) {
            role = await Role.findById(user.role);
        } else if (user.roleSlug) {
            role = await Role.findOne({ slug: user.roleSlug });
        }

        if (!role) {
            // Default to admin role if role not found
            role = await Role.findOne({ slug: "admin" });
        }

        if (!role) {
            return false;
        }

        // Check permission
        return role.permissions[permission] === true;
    } catch (error) {
        console.error("Error checking permission:", error);
        return false;
    }
}

/**
 * Get all permissions for a user
 * @param {Object} user - User object
 * @returns {Promise<Object>}
 */
export async function getUserPermissions(user) {
    try {
        await connectDB();

        if (!user) {
            return {};
        }

        // Super admin has all permissions
        if (user.roleSlug === "super-admin" || user.role === "super-admin") {
            return {
                blogCreate: true,
                blogEdit: true,
                blogDelete: true,
                blogPublish: true,
                blogView: true,
                categoryManage: true,
                tagManage: true,
                mediaUpload: true,
                mediaDelete: true,
                mediaView: true,
                seoManage: true,
                redirectManage: true,
                userManage: true,
                roleManage: true,
                auditView: true,
                settingsManage: true,
            };
        }

        // Get role from database
        let role;
        if (user.role && typeof user.role === 'object') {
            role = user.role;
        } else if (user.role) {
            role = await Role.findById(user.role);
        } else if (user.roleSlug) {
            role = await Role.findOne({ slug: user.roleSlug });
        }

        if (!role) {
            role = await Role.findOne({ slug: "admin" });
        }

        return role ? role.permissions : {};
    } catch (error) {
        console.error("Error getting user permissions:", error);
        return {};
    }
}

/**
 * Initialize default roles
 */
export async function initializeDefaultRoles() {
    try {
        await connectDB();

        const defaultRoles = [
            {
                name: "Super Admin",
                slug: "super-admin",
                description: "Full system access",
                permissions: {
                    blogCreate: true,
                    blogEdit: true,
                    blogDelete: true,
                    blogPublish: true,
                    blogView: true,
                    categoryManage: true,
                    tagManage: true,
                    mediaUpload: true,
                    mediaDelete: true,
                    mediaView: true,
                    seoManage: true,
                    redirectManage: true,
                    userManage: true,
                    roleManage: true,
                    auditView: true,
                    settingsManage: true,
                },
            },
            {
                name: "Admin",
                slug: "admin",
                description: "Administrative access",
                permissions: {
                    blogCreate: true,
                    blogEdit: true,
                    blogDelete: true,
                    blogPublish: true,
                    blogView: true,
                    categoryManage: true,
                    tagManage: true,
                    mediaUpload: true,
                    mediaDelete: true,
                    mediaView: true,
                    seoManage: true,
                    redirectManage: true,
                    userManage: false,
                    roleManage: false,
                    auditView: true,
                    settingsManage: false,
                },
            },
            {
                name: "Editor",
                slug: "editor",
                description: "Can create and edit posts",
                permissions: {
                    blogCreate: true,
                    blogEdit: true,
                    blogDelete: false,
                    blogPublish: true,
                    blogView: true,
                    categoryManage: true,
                    tagManage: true,
                    mediaUpload: true,
                    mediaDelete: false,
                    mediaView: true,
                    seoManage: false,
                    redirectManage: false,
                    userManage: false,
                    roleManage: false,
                    auditView: false,
                    settingsManage: false,
                },
            },
            {
                name: "Author",
                slug: "author",
                description: "Can create and edit own posts",
                permissions: {
                    blogCreate: true,
                    blogEdit: true,
                    blogDelete: false,
                    blogPublish: false,
                    blogView: true,
                    categoryManage: false,
                    tagManage: false,
                    mediaUpload: true,
                    mediaDelete: false,
                    mediaView: true,
                    seoManage: false,
                    redirectManage: false,
                    userManage: false,
                    roleManage: false,
                    auditView: false,
                    settingsManage: false,
                },
            },
            {
                name: "Viewer",
                slug: "viewer",
                description: "Read-only access",
                permissions: {
                    blogCreate: false,
                    blogEdit: false,
                    blogDelete: false,
                    blogPublish: false,
                    blogView: true,
                    categoryManage: false,
                    tagManage: false,
                    mediaUpload: false,
                    mediaDelete: false,
                    mediaView: true,
                    seoManage: false,
                    redirectManage: false,
                    userManage: false,
                    roleManage: false,
                    auditView: false,
                    settingsManage: false,
                },
            },
        ];

        for (const roleData of defaultRoles) {
            await Role.findOneAndUpdate(
                { slug: roleData.slug },
                roleData,
                { upsert: true, new: true }
            );
        }

        console.log("Default roles initialized");
    } catch (error) {
        console.error("Error initializing default roles:", error);
    }
}









