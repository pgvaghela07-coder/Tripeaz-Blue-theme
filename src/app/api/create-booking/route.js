import { NextResponse } from "next/server";
import Booking from "../../models/bookig";
import connectDB from "@/app/lib/db";

// Force dynamic rendering - disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req) {
  try {
    await connectDB()
    const data = await req.json();

    const newBooking = await Booking.create(data);

    return NextResponse.json({
      success: true,
      message: "Booking stored successfully",
      bookingId: newBooking._id,
    });
  } catch (error) {
    console.error("Booking Save Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to store booking" },
      { status: 500 }
    );
  }
}
