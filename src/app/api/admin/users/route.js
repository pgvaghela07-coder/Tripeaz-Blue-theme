import { NextResponse } from "next/server";
import connectDB from "../../../lib/db.js";
import Admin from "../../../models/admin.js";
import Role from "../../../models/role.js";
import bcrypt from "bcryptjs";
import { requirePermission } from "../../../lib/auth.js";
import { createAuditLog, getClientIP, getUserAgent } from "../../../lib/auditLog.js";

export const dynamic = 'force-dynamic';

// GET /api/admin/users - Get all users
export async function GET(req) {
  try {
    const authData = await requirePermission(req, "canViewUsers");
    
    if (authData instanceof NextResponse) {
      return authData; // Return error response
    }

    await connectDB();

    const users = await Admin.find()
      .populate("role", "name slug")
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new user
export async function POST(req) {
  try {
    const authData = await requirePermission(req, "canCreateUser");
    
    if (authData instanceof NextResponse) {
      return authData; // Return error response
    }

    await connectDB();

    const { userName, email, password, roleId } = await req.json();

    // Validation
    if (!userName || !email || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 400 }
      );
    }

    // Check if user has permission to assign roles (if roleId is provided)
    if (roleId && roleId.trim() !== "") {
      const currentUserRole = authData.role;
      if (!currentUserRole?.permissions?.isSuperAdmin && !currentUserRole?.permissions?.canAssignRole) {
        return NextResponse.json(
          { success: false, message: "You don't have permission to assign roles" },
          { status: 403 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get role if provided, otherwise use default admin role
    let role = null;
    let roleSlug = "admin";
    let finalRoleId = null;
    
    if (roleId && roleId.trim() !== "") {
      role = await Role.findById(roleId);
      if (role) {
        roleSlug = role.slug;
        finalRoleId = roleId;
      } else {
        // If roleId provided but not found, use default admin role
        role = await Role.findOne({ slug: "admin" });
        if (role) {
          roleSlug = "admin";
          finalRoleId = role._id;
        }
      }
    } else {
      // No roleId provided, use default admin role
      role = await Role.findOne({ slug: "admin" });
      if (role) {
        roleSlug = "admin";
        finalRoleId = role._id;
      }
    }

    // Create user
    const newUser = await Admin.create({
      userName,
      email,
      password: hashedPassword,
      role: finalRoleId,
      roleSlug,
    });

    // Populate role for response
    await newUser.populate("role", "name slug");

    // Create audit log
    await createAuditLog({
      userId: authData.admin._id,
      action: "create",
      resourceType: "user",
      resourceId: newUser._id,
      details: `Created user: ${newUser.userName} (${newUser.email})`,
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        _id: newUser._id,
        userName: newUser.userName,
        email: newUser.email,
        role: newUser.role,
        roleSlug: newUser.roleSlug,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

