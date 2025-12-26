import { NextResponse } from "next/server";
import connectDB from "../../../lib/db.js";
import Admin from "../../../models/admin.js";
import Role from "../../../models/role.js";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

// POST /api/admin/init - Initialize super admin and roles
export async function POST(req) {
  try {
    await connectDB();

    // Create roles if they don't exist
    const roles = [
      {
        name: "Super Admin",
        slug: "super_admin",
        description: "Full access to all features",
        permissions: {
          isSuperAdmin: true,
          canViewBlog: true,
          canCreateBlog: true,
          canEditBlog: true,
          canDeleteBlog: true,
          canPublishBlog: true,
          canViewUsers: true,
          canCreateUser: true,
          canEditUser: true,
          canDeleteUser: true,
          canAssignRole: true,
          canManageCategories: true,
          canManageTags: true,
          canManageMedia: true,
          canManageRoutes: true,
          canManageCities: true,
          canManageAirports: true,
          canManageSEO: true,
          canViewBookings: true,
          canManageBookings: true,
          canManageSettings: true,
          canViewAuditLogs: true,
        },
      },
      {
        name: "Admin",
        slug: "admin",
        description: "Administrative access",
        permissions: {
          canViewBlog: true,
          canCreateBlog: true,
          canEditBlog: true,
          canDeleteBlog: true,
          canPublishBlog: true,
          canViewUsers: true,
          canCreateUser: true,
          canEditUser: true,
          canDeleteUser: false,
          canAssignRole: false,
          canManageCategories: true,
          canManageTags: true,
          canManageMedia: true,
          canManageRoutes: true,
          canManageCities: true,
          canManageAirports: true,
          canManageSEO: true,
          canViewBookings: true,
          canManageBookings: true,
          canManageSettings: false,
          canViewAuditLogs: true,
        },
      },
      {
        name: "Editor",
        slug: "editor",
        description: "Content editing access - can create, edit, publish blogs and manage content",
        permissions: {
          canViewBlog: true,
          canCreateBlog: true,
          canEditBlog: true,
          canDeleteBlog: false,
          canPublishBlog: true,
          canViewUsers: false,
          canCreateUser: false,
          canEditUser: false,
          canDeleteUser: false,
          canAssignRole: false,
          canManageCategories: true,
          canManageTags: true,
          canManageMedia: true,
          canManageRoutes: true,
          canManageCities: true,
          canManageAirports: true,
          canManageSEO: false,
          canViewBookings: true,
          canManageBookings: false,
          canManageSettings: false,
          canViewAuditLogs: false,
        },
      },
      {
        name: "Author",
        slug: "author",
        description: "Basic content creation - can create and edit own content only",
        permissions: {
          canViewBlog: true,
          canCreateBlog: true,
          canEditBlog: true,
          canDeleteBlog: false,
          canPublishBlog: false,
          canViewUsers: false,
          canCreateUser: false,
          canEditUser: false,
          canDeleteUser: false,
          canAssignRole: false,
          canManageCategories: false,
          canManageTags: false,
          canManageMedia: true,
          canManageRoutes: false,
          canManageCities: false,
          canManageAirports: false,
          canManageSEO: false,
          canViewBookings: false,
          canManageBookings: false,
          canManageSettings: false,
          canViewAuditLogs: false,
        },
      },
      {
        name: "Viewer",
        slug: "viewer",
        description: "Read-only access - can only view content, no editing permissions",
        permissions: {
          canViewBlog: true,
          canCreateBlog: false,
          canEditBlog: false,
          canDeleteBlog: false,
          canPublishBlog: false,
          canViewUsers: true,
          canCreateUser: false,
          canEditUser: false,
          canDeleteUser: false,
          canAssignRole: false,
          canManageCategories: false,
          canManageTags: false,
          canManageMedia: false,
          canManageRoutes: false,
          canManageCities: false,
          canManageAirports: false,
          canManageSEO: false,
          canViewBookings: true,
          canManageBookings: false,
          canManageSettings: false,
          canViewAuditLogs: false,
        },
      },
    ];

    // Create or update roles
    for (const roleData of roles) {
      // First check if role exists by slug or name
      let role = await Role.findOne({ 
        $or: [
          { slug: roleData.slug },
          { name: roleData.name }
        ]
      });
      
      if (role) {
        // Update existing role
        role.name = roleData.name;
        role.slug = roleData.slug;
        role.description = roleData.description;
        role.permissions = roleData.permissions;
        role.isActive = true;
        await role.save();
      } else {
        // Create new role
        try {
          role = await Role.create(roleData);
        } catch (error) {
          if (error.code === 11000) {
            // Duplicate key error - role exists with different field
            role = await Role.findOne({ name: roleData.name });
          } else {
            throw error;
          }
        }
      }
    }

    // Get super admin role
    const superAdminRole = await Role.findOne({ slug: "super_admin" });

    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ roleSlug: "super_admin" });

    if (existingSuperAdmin) {
      return NextResponse.json({
        success: true,
        message: "Super admin already exists",
        superAdmin: {
          email: existingSuperAdmin.email,
          userName: existingSuperAdmin.userName,
        },
      });
    }

    // Create super admin
    const { email, password, userName } = await req.json();

    if (!email || !password || !userName) {
      return NextResponse.json(
        { success: false, message: "Email, password, and userName are required" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = await Admin.create({
      userName,
      email,
      password: hashedPassword,
      role: superAdminRole._id,
      roleSlug: "super_admin",
    });

    return NextResponse.json({
      success: true,
      message: "Super admin created successfully",
      superAdmin: {
        _id: superAdmin._id,
        email: superAdmin.email,
        userName: superAdmin.userName,
        role: "super_admin",
      },
    });
  } catch (error) {
    console.error("Init error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

