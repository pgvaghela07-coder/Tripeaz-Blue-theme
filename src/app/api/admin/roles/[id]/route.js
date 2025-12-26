import { NextResponse } from "next/server";
import connectDB from "../../../../lib/db.js";
import Role from "../../../../models/role.js";
import { requirePermission } from "../../../../lib/auth.js";
import { createAuditLog, getClientIP, getUserAgent } from "../../../../lib/auditLog.js";

export const dynamic = 'force-dynamic';

// PUT /api/admin/roles/[id] - Update role
export async function PUT(req, { params }) {
  try {
    const authData = await requirePermission(req, "canAssignRole");
    
    if (authData instanceof NextResponse) {
      return authData;
    }

    // Only super admin can update roles
    if (!authData.role?.permissions?.isSuperAdmin) {
      return NextResponse.json(
        { success: false, message: "Only super admin can update roles" },
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = await params;
    const { name, description, permissions, isActive } = await req.json();

    const role = await Role.findById(id);
    if (!role) {
      return NextResponse.json(
        { success: false, message: "Role not found" },
        { status: 404 }
      );
    }

    // Prevent modifying super_admin role
    if (role.slug === "super_admin") {
      return NextResponse.json(
        { success: false, message: "Cannot modify super admin role" },
        { status: 400 }
      );
    }

    if (name) role.name = name;
    if (description !== undefined) role.description = description;
    if (permissions) role.permissions = { ...role.permissions, ...permissions };
    if (isActive !== undefined) role.isActive = isActive;

    await role.save();

    // Create audit log
    await createAuditLog({
      userId: authData.admin._id,
      action: "update",
      resourceType: "user", // Using "user" as resourceType for role management
      resourceId: role._id,
      details: `Updated role: ${role.name} (${role.slug})`,
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({
      success: true,
      message: "Role updated successfully",
      role,
    });
  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/roles/[id] - Delete role
export async function DELETE(req, { params }) {
  try {
    const authData = await requirePermission(req, "canAssignRole");
    
    if (authData instanceof NextResponse) {
      return authData;
    }

    // Only super admin can delete roles
    if (!authData.role?.permissions?.isSuperAdmin) {
      return NextResponse.json(
        { success: false, message: "Only super admin can delete roles" },
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = await params;

    const role = await Role.findById(id);
    if (!role) {
      return NextResponse.json(
        { success: false, message: "Role not found" },
        { status: 404 }
      );
    }

    // Prevent deleting super_admin role
    if (role.slug === "super_admin") {
      return NextResponse.json(
        { success: false, message: "Cannot delete super admin role" },
        { status: 400 }
      );
    }

    // Soft delete - set isActive to false instead of actually deleting
    role.isActive = false;
    await role.save();

    // Create audit log
    await createAuditLog({
      userId: authData.admin._id,
      action: "delete",
      resourceType: "user", // Using "user" as resourceType for role management
      resourceId: role._id,
      details: `Deleted role: ${role.name} (${role.slug})`,
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    console.error("Delete role error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
