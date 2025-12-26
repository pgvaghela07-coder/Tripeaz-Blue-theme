import { NextResponse } from "next/server";
import { getAdminFromRequest } from "../../../lib/auth.js";
import connectDB from "../../../lib/db.js";
import Role from "../../../models/role.js";

export const dynamic = 'force-dynamic';

// GET /api/admin/me - Get current admin user info
export async function GET(req) {
  try {
    const authData = await getAdminFromRequest(req);

    if (!authData) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Ensure role is populated
    let role = authData.role;
    if (!role && authData.admin.role) {
      await connectDB();
      role = await Role.findById(authData.admin.role);
    }

    // Get permissions from role
    const permissions = role?.permissions || {};

    return NextResponse.json({
      success: true,
      user: {
        _id: authData.admin._id,
        userName: authData.admin.userName,
        email: authData.admin.email,
        role: role,
        roleSlug: authData.roleSlug,
      },
      permissions: permissions,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

