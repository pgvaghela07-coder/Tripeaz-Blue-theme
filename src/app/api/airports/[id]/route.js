import { NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import AIRPORT from "../../../models/airport";
import { createAuditLog, getClientIP, getUserAgent } from "../../../lib/auditLog.js";
import { requirePermission } from "../../../lib/auth.js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE(req, { params }) {
  try {
    // Require permission to manage airports
    const authData = await requirePermission(req, "canManageAirports");
    if (authData instanceof NextResponse) {
      return authData; // Return error response
    }

    await connectDB();
    const { id } = await params;

    const airport = await AIRPORT.findById(id);
    if (!airport) {
      return NextResponse.json(
        { success: false, message: "Airport not found" },
        { status: 404 }
      );
    }

    await AIRPORT.findByIdAndDelete(id);

    // Create audit log
    await createAuditLog({
      userId: authData.admin._id,
      action: "delete",
      resourceType: "airport",
      resourceId: airport._id,
      details: `Deleted airport: ${airport.name} (${airport.from} to ${airport.to})`,
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json(
      { success: true, message: "Airport deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting airport:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete airport", error: error.message },
      { status: 500 }
    );
  }
}

