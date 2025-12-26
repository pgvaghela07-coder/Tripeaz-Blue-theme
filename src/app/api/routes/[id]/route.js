import { NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import ROUTE from "../../../models/routeModel";
import { createAuditLog, getClientIP, getUserAgent } from "../../../lib/auditLog.js";
import { requirePermission } from "../../../lib/auth.js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE(req, { params }) {
  try {
    // Require permission to manage routes
    const authData = await requirePermission(req, "canManageRoutes");
    if (authData instanceof NextResponse) {
      return authData; // Return error response
    }

    await connectDB();
    const { id } = await params;
    const route = await ROUTE.findById(id);
    if (!route) {
      return NextResponse.json(
        { success: false, message: "Route not found" },
        { status: 404 }
      );
    }
    await ROUTE.findByIdAndDelete(id);

    // Create audit log
    await createAuditLog({
      userId: authData.admin._id,
      action: "delete",
      resourceType: "route",
      resourceId: route._id,
      details: `Deleted route: ${route.name} (${route.from} to ${route.to})`,
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true, message: "Route deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting route:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete route", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    // Require permission to manage routes
    const authData = await requirePermission(req, "canManageRoutes");
    if (authData instanceof NextResponse) {
      return authData; // Return error response
    }

    await connectDB();
    const { id } = await params;
    const payload = await req.json();
    const { name, from, to, url } = payload || {};

    if (!name || !from || !to || !url) {
      return NextResponse.json(
        { success: false, message: "name, from, to and url are required" },
        { status: 400 }
      );
    }

    const existingWithUrl = await ROUTE.findOne({ url, _id: { $ne: id } });
    if (existingWithUrl) {
      return NextResponse.json(
        { success: false, message: "Route URL already exists" },
        { status: 409 }
      );
    }

    const updated = await ROUTE.findByIdAndUpdate(
      id,
      { name, from, to, url },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Route not found" },
        { status: 404 }
      );
    }

    // Create audit log
    await createAuditLog({
      userId: authData.admin._id,
      action: "update",
      resourceType: "route",
      resourceId: updated._id,
      details: `Updated route: ${updated.name} (${updated.from} to ${updated.to})`,
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json(
      { success: true, route: { ...updated.toObject(), _id: updated._id.toString() } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating route:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update route", error: error.message },
      { status: 500 }
    );
  }
}

