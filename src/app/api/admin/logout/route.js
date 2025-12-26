import { NextResponse } from "next/server";
import { createAuditLog, getClientIP, getUserAgent } from "../../../lib/auditLog.js";
import { getAdminFromRequest } from "../../../lib/auth.js";

export async function GET(req) {
  // Get admin before clearing cookie
  const authData = await getAdminFromRequest(req);

  const res = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  // Remove admin cookie
  res.cookies.set("adminToken", "", {
    httpOnly: true,
    expires: new Date(0), // instantly expire
  });

  // Create audit log for logout
  if (authData) {
    await createAuditLog({
      userId: authData.admin._id,
      action: "logout",
      resourceType: "system",
      resourceId: null,
      details: `User logged out: ${authData.admin.email}`,
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
    });
  }

  return res;
}
