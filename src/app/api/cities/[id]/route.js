import { NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import CITY from "../../../models/city";
import { createAuditLog, getClientIP, getUserAgent } from "../../../lib/auditLog.js";
import { requirePermission } from "../../../lib/auth.js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE(req, { params }) {
  try {
    // Require permission to manage cities
    const authData = await requirePermission(req, "canManageCities");
    if (authData instanceof NextResponse) {
      return authData; // Return error response
    }

    await connectDB();
    const { id } = await params;

    const city = await CITY.findById(id);
    if (!city) {
      return NextResponse.json(
        { success: false, message: "City not found" },
        { status: 404 }
      );
    }

    await CITY.findByIdAndDelete(id);

    // Create audit log
    await createAuditLog({
      userId: authData.admin._id,
      action: "delete",
      resourceType: "city",
      resourceId: city._id,
      details: `Deleted city: ${city.name}`,
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json(
      { success: true, message: "City deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting city:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete city", error: error.message },
      { status: 500 }
    );
  }
}

