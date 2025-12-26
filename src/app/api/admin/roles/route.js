import { NextResponse } from "next/server";
import connectDB from "../../../lib/db.js";
import Role from "../../../models/role.js";
import { requirePermission } from "../../../lib/auth.js";
import { createAuditLog, getClientIP, getUserAgent } from "../../../lib/auditLog.js";

export const dynamic = 'force-dynamic';

// GET /api/admin/roles - Get all roles
export async function GET(req) {
  try {
    const authData = await requirePermission(req, "canAssignRole");
    
    if (authData instanceof NextResponse) {
      return authData;
    }

    await connectDB();

    const roles = await Role.find({ isActive: true }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      roles,
    });
  } catch (error) {
    console.error("Get roles error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/roles - Create new role
export async function POST(req) {
  try {
    const authData = await requirePermission(req, "canAssignRole");
    
    if (authData instanceof NextResponse) {
      return authData;
    }

    // Only super admin can create roles
    if (!authData.role?.permissions?.isSuperAdmin) {
      return NextResponse.json(
        { success: false, message: "Only super admin can create roles" },
        { status: 403 }
      );
    }

    await connectDB();

    const { name, slug, description, permissions } = await req.json();

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, message: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if role with same slug already exists
    const existingRole = await Role.findOne({ slug: slug.toLowerCase() });
    if (existingRole) {
      return NextResponse.json(
        { success: false, message: "Role with this slug already exists" },
        { status: 400 }
      );
    }

    const newRole = await Role.create({
      name,
      slug: slug.toLowerCase(),
      description: description || "",
      permissions: permissions || {},
    });

    // Create audit log
    await createAuditLog({
      userId: authData.admin._id,
      action: "create",
      resourceType: "user", // Using "user" as resourceType for role management
      resourceId: newRole._id,
      details: `Created role: ${newRole.name} (${newRole.slug})`,
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({
      success: true,
      message: "Role created successfully",
      role: newRole,
    });
  } catch (error) {
    console.error("Create role error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}


