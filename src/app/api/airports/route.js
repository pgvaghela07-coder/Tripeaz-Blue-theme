import { NextResponse } from "next/server";
import connectDB from "../../lib/db";
import AIRPORT from "../../models/airport";
import { createAuditLog, getClientIP, getUserAgent } from "../../lib/auditLog.js";
import { requirePermission } from "../../lib/auth.js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req) {
  try {
    // Require permission to manage airports
    const authData = await requirePermission(req, "canManageAirports");
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

    const existing = await AIRPORT.findOne({ url });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Airport URL already exists" },
        { status: 409 }
      );
    }

    const airport = await AIRPORT.create({
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
      resourceType: "airport",
      resourceId: airport._id,
      details: `Created airport: ${airport.name} (${airport.from} to ${airport.to})`,
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json(
      { success: true, airport: { ...airport.toObject(), _id: airport._id.toString() } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating airport:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create airport", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const airports = await AIRPORT.find().sort({ createdAt: -1 }).lean();
    const normalized = airports.map((airport) => ({
      ...airport,
      _id: airport._id.toString(),
      blogId: airport.blogId ? airport.blogId.toString() : null,
    }));

    return NextResponse.json({ success: true, airports: normalized }, { status: 200 });
  } catch (error) {
    console.error("Error fetching airports:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch airports", error: error.message },
      { status: 500 }
    );
  }
}

