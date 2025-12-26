import { NextResponse } from "next/server";
import connectDB from "../../../../lib/db.js";
import Admin from "../../../../models/admin.js";
import Role from "../../../../models/role.js";
import bcrypt from "bcryptjs";
import { requirePermission } from "../../../../lib/auth.js";
import { createAuditLog, getClientIP, getUserAgent } from "../../../../lib/auditLog.js";

export const dynamic = 'force-dynamic';

// GET /api/admin/users/[id] - Get user by ID
export async function GET(req, { params }) {
  try {
    const authData = await requirePermission(req, "canViewUsers");
    
    if (authData instanceof NextResponse) {
      return authData;
    }

    await connectDB();
    const { id } = await params;

    const user = await Admin.findById(id)
      .populate("role", "name slug permissions")
      .select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(req, { params }) {
  try {
    const authData = await requirePermission(req, "canEditUser");
    
    if (authData instanceof NextResponse) {
      return authData;
    }

    await connectDB();
    const { id } = await params;
    const { userName, email, password, roleId } = await req.json();

    const user = await Admin.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Update fields
    if (userName) user.userName = userName;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await Admin.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "Email already exists" },
          { status: 400 }
        );
      }
      user.email = email;
    }
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    
    // Handle role assignment - check if user has permission to assign roles
    if (roleId !== undefined && roleId !== null) {
      // Check if role is actually changing
      const currentRoleId = user.role?.toString() || user.role?._id?.toString() || "";
      const newRoleId = roleId.toString();
      const isRoleChanging = newRoleId !== currentRoleId && newRoleId !== "";
      
      // Check if current user can assign roles (only if changing role)
      if (isRoleChanging) {
        const currentUserRole = authData.role;
        if (!currentUserRole?.permissions?.isSuperAdmin && !currentUserRole?.permissions?.canAssignRole) {
          return NextResponse.json(
            { success: false, message: "You don't have permission to assign roles" },
            { status: 403 }
          );
        }
      }

      if (roleId && roleId.trim() !== "") {
        const role = await Role.findById(roleId);
        if (role) {
          user.role = roleId;
          user.roleSlug = role.slug;
        } else {
          return NextResponse.json(
            { success: false, message: "Invalid role ID" },
            { status: 400 }
          );
        }
      } else {
        // Empty roleId means set to default admin role
        const defaultRole = await Role.findOne({ slug: "admin" });
        if (defaultRole) {
          user.role = defaultRole._id;
          user.roleSlug = "admin";
        }
      }
    }

    await user.save();
    await user.populate("role", "name slug");

    // Create audit log
    await createAuditLog({
      userId: authData.admin._id,
      action: "update",
      resourceType: "user",
      resourceId: user._id,
      details: `Updated user: ${user.userName} (${user.email})`,
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        roleSlug: user.roleSlug,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(req, { params }) {
  try {
    const authData = await requirePermission(req, "canDeleteUser");
    
    if (authData instanceof NextResponse) {
      return authData;
    }

    await connectDB();
    const { id } = await params;

    // Prevent deleting yourself
    if (authData.admin._id.toString() === id) {
      return NextResponse.json(
        { success: false, message: "You cannot delete yourself" },
        { status: 400 }
      );
    }

    const user = await Admin.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Create audit log
    await createAuditLog({
      userId: authData.admin._id,
      action: "delete",
      resourceType: "user",
      resourceId: id,
      details: `Deleted user: ${user.userName} (${user.email})`,
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

