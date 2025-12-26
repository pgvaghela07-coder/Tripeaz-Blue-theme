import { NextResponse } from "next/server";
import connectDB from "../../lib/db";
import ROUTE from "../../models/routeModel";
import { createAuditLog, getClientIP, getUserAgent } from "../../lib/auditLog.js";
import { requirePermission } from "../../lib/auth.js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req) {
  try {
    // Require permission to manage routes
    const authData = await requirePermission(req, "canManageRoutes");
    if (authData instanceof NextResponse) {
      return authData; // Return error response
    }

    await connectDB();
    const payload = await req.json();
    const { name, from, to, url, blogId } = payload || {};

    if (!name || !from || !to || !url) {
      return NextResponse.json(
        { success: false, message: "name, from, to and url are required" },
        { status: 400 }
      );
    }

    const existing = await ROUTE.findOne({ url });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Route URL already exists" },
        { status: 409 }
      );
    }

    const route = await ROUTE.create({
      name,
      from,
      to,
      url,
      blogId: blogId || null,
    });

    // Create audit log
    await createAuditLog({
      userId: authData.admin._id,
      action: "create",
      resourceType: "route",
      resourceId: route._id,
      details: `Created route: ${route.name} (${route.from} to ${route.to})`,
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json(
      { success: true, route: { ...route.toObject(), _id: route._id.toString() } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating route:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create route", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const routes = await ROUTE.find().sort({ createdAt: -1 }).lean();
    const normalized = routes.map((route) => ({
      ...route,
      _id: route._id.toString(),
      blogId: route.blogId ? route.blogId.toString() : null,
    }));

    return NextResponse.json({ success: true, routes: normalized }, { status: 200 });
  } catch (error) {
    console.error("Error fetching routes:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch routes", error: error.message },
      { status: 500 }
    );
  }
}

