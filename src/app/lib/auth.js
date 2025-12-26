import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import Admin from "../models/admin.js";
import Role from "../models/role.js";
import connectDB from "./db.js";

/**
 * Verify admin token and get admin data
 */
export async function verifyAdminToken(token) {
  try {
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();
    
    const admin = await Admin.findById(decoded.id)
      .populate("role")
      .select("-password");

    if (!admin) {
      return null;
    }

    return {
      admin,
      role: admin.role,
      roleSlug: admin.roleSlug || (admin.role?.slug || "admin"),
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

/**
 * Get admin from request cookies
 */
export async function getAdminFromRequest(req) {
  try {
    const token = req.cookies.get("adminToken")?.value;
    return await verifyAdminToken(token);
  } catch (error) {
    return null;
  }
}

/**
 * Middleware to check if admin is authenticated
 */
export async function requireAuth(req) {
  const authData = await getAdminFromRequest(req);
  
  if (!authData) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  return authData;
}

/**
 * Check if admin has specific permission
 */
export function hasPermission(role, permission) {
  if (!role) {
    // If no role assigned, deny all permissions except basic auth
    return false;
  }
  
  // Super admin has all permissions
  if (role.permissions?.isSuperAdmin === true) {
    return true;
  }

  // Check specific permission
  return role.permissions?.[permission] === true;
}

/**
 * Middleware to check if admin has required permission
 */
export async function requirePermission(req, permission) {
  const authData = await requireAuth(req);
  
  if (authData instanceof NextResponse) {
    return authData; // Return error response
  }

  let { role } = authData;

  // If role is not populated but roleId exists, try to fetch it
  if (!role && authData.admin.role) {
    await connectDB();
    role = await Role.findById(authData.admin.role);
    // Update authData with fetched role
    authData.role = role;
  }

  // If still no role, try to get default role by roleSlug
  if (!role && authData.roleSlug) {
    await connectDB();
    role = await Role.findOne({ slug: authData.roleSlug });
    if (role) {
      authData.role = role;
    }
  }

  if (!hasPermission(role, permission)) {
    return NextResponse.json(
      { success: false, message: "Insufficient permissions. You need the '" + permission + "' permission to perform this action." },
      { status: 403 }
    );
  }

  return authData;
}

/**
 * Check if admin is super admin
 */
export function isSuperAdmin(role) {
  return role?.permissions?.isSuperAdmin === true;
}

