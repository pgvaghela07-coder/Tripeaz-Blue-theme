import connectDB from "@/app/lib/db";
import Booking from "@/app/models/bookig";
import { NextResponse } from "next/server";
import { createAuditLog, getClientIP, getUserAgent } from "@/app/lib/auditLog.js";
import { requirePermission } from "@/app/lib/auth.js";

// Force dynamic rendering - disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// PUT /api/Bookings/[id] → Update booking
export async function PUT(req, { params }) {
  try {
    // Require permission to manage bookings
    const authData = await requirePermission(req, "canManageBookings");
    if (authData instanceof NextResponse) {
      return authData; // Return error response
    }

    await connectDB();

    const { id } = await params;
    const body = await req.json();

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    // Track what changed for audit log
    const changes = [];
    if (body.assignedTo !== undefined && body.assignedTo !== booking.assignedTo) {
      if (body.assignedTo) {
        changes.push(`Assigned to: "${body.assignedTo}"`);
      } else {
        changes.push("Removed assignment");
      }
    }
    if (body.tripType !== undefined && body.tripType !== booking.tripType) {
      changes.push(`Trip type: ${booking.tripType} → ${body.tripType}`);
    }
    if (body.from !== undefined && body.from !== booking.from) {
      changes.push(`From: ${booking.from} → ${body.from}`);
    }
    if (body.to !== undefined && body.to !== booking.to) {
      changes.push(`To: ${booking.to} → ${body.to}`);
    }
    if (body.phone !== undefined && body.phone !== booking.phone) {
      changes.push(`Phone: ${booking.phone} → ${body.phone}`);
    }
    if (body.carType !== undefined && body.carType !== booking.carType) {
      changes.push(`Car type: ${booking.carType} → ${body.carType}`);
    }
    if (body.passengers !== undefined && body.passengers !== booking.passengers) {
      changes.push(`Passengers: ${booking.passengers} → ${body.passengers}`);
    }
    if (body.date !== undefined && body.date !== booking.date) {
      changes.push(`Trip start date updated`);
    }
    if (body.tripEndDate !== undefined && body.tripEndDate !== booking.tripEndDate) {
      changes.push(`Trip end date updated`);
    }

    // Update booking fields
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    // Create audit log with detailed changes
    const details = changes.length > 0 
      ? `Updated booking (${updatedBooking.phone || 'N/A'}): ${changes.join(', ')}`
      : `Updated booking: ${updatedBooking.phone || 'N/A'} (${updatedBooking.from || 'N/A'} to ${updatedBooking.to || 'N/A'})`;

    try {
      await createAuditLog({
        userId: authData.admin._id,
        action: "update",
        resourceType: "booking",
        resourceId: updatedBooking._id,
        details: details,
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
      });
      console.log("✅ Audit log created for booking update:", updatedBooking._id);
    } catch (auditError) {
      console.error("❌ Failed to create audit log for booking update:", auditError);
      // Don't fail the request if audit log fails, but log the error
    }

    return NextResponse.json(
      {
        success: true,
        message: "Booking updated successfully",
        booking: updatedBooking,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        }
      }
    );
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update booking",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

