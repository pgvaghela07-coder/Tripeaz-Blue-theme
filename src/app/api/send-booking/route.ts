import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import connectDB from "@/app/lib/db";
import BookingCounter from "@/app/models/BookingCounter";



async function generateBookingId(): Promise<string> {
  // Connect to database
  await connectDB();

  // Get current date
  const now = new Date();
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const monthName = monthNames[now.getMonth()];
  const year = now.getFullYear();
  const monthKey = `${monthName}-${year}`;

  // Use findOneAndUpdate for atomic increment (prevents race conditions)
  // If document doesn't exist, create it with sequence = 0, then increment to 1
  // If it exists, increment the sequence
  const counter = await BookingCounter.findOneAndUpdate(
    { month: monthKey },
    {
      $inc: { sequence: 1 },
      $setOnInsert: { 
        month: monthKey,
        year: year 
      },
    },
    {
      upsert: true, // Create if doesn't exist
      new: true, // Return updated document
      setDefaultsOnInsert: true,
    }
  );

  // Generate booking ID with 6-digit padded sequence
  const sequenceStr = counter.sequence.toString().padStart(6, "0");
  const bookingId = `${monthName}-${sequenceStr}`;

  return bookingId;
}

export async function POST(request: NextRequest) {
  try {
    const {
      tripType,
      from,
      to,
      date,
      time,
      tripEndDate,
      passengers,
      carType,
      phone,
    } = await request.json();

    // Generate sequential month-based booking ID
    const bookingId = await generateBookingId();

    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      auth: {
        user: "988651001@smtp-brevo.com",
        pass: "OkNKMU06w7Zrj9Eh",
      }
    })

    // Email content
    const emailSubject = `New Booking - ${bookingId} - Tripeaz`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Booking - Tripeaz</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; background: #f3f4f6; border-radius: 5px; }
            .label { font-weight: bold; color: #374151; }
            .value { color: #6b7280; }
            .booking-id { background: #f97316; color: white; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚖 New Booking - Tripeaz</h1>
              <p>Khushboo Gujarat Ki</p>
            </div>

            <div class="content">
              <div class="booking-id">
                Booking ID: ${bookingId}
              </div>

              <div class="booking-details">
                <h2>Customer Information</h2>
                <div class="detail-row">
                  <span class="label">Number is :</span>
                  <span class="value">${phone}</span>
                </div>

              </div>

              <div class="booking-details">
                <h2>Trip Details</h2>
                <div class="detail-row">
                  <span class="label">Trip Type:</span>
                  <span class="value">${tripType.charAt(0).toUpperCase() +
      tripType.slice(1).replace("-", " ")
      }</span>
                </div>
                <div class="detail-row">
                  <span class="label">From:</span>
                  <span class="value">${from}</span>
                </div>
                <div class="detail-row">
                  <span class="label">To:</span>
                  <span class="value">${to}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Trip Start Date:</span>
                  <span class="value">${new Date(date).toLocaleDateString(
        "en-IN",
        { year: "numeric", month: "long", day: "numeric" }
      )}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Trip Start Time:</span>
                  <span class="value">${new Date(date).toLocaleTimeString(
        "en-IN",
        { hour: "2-digit", minute: "2-digit", hour12: true }
      )}</span>
                </div>
                ${tripType === "round-trip" && tripEndDate ? `
                <div class="detail-row">
                  <span class="label">Trip End Date:</span>
                  <span class="value">${new Date(tripEndDate).toLocaleDateString(
        "en-IN",
        { year: "numeric", month: "long", day: "numeric" }
      )}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Trip End Time:</span>
                  <span class="value">${new Date(tripEndDate).toLocaleTimeString(
        "en-IN",
        { hour: "2-digit", minute: "2-digit", hour12: true }
      )}</span>
                </div>
                ` : ""}
                <div class="detail-row">
                  <span class="label">Passengers:</span>
                  <span class="value">${passengers}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Car Type:</span>
                  <span class="value">${carType.charAt(0).toUpperCase() + carType.slice(1)
      }</span>
                </div>
              </div>

              <div class="footer">
                <p>This booking was submitted through the Tripeaz website.</p>
                <p>Please contact the customer to confirm the booking details.</p>
                <p><strong>Tripeaz</strong> - Owned & managed by Wolfron Technologies LLP</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `
New Booking - ${bookingId} - Tripeaz

Customer Information:
- Number is: ${phone}

Trip Details:
- Trip Type: ${tripType}
- From: ${from}
- To: ${to}
- Trip Start Date: ${new Date(date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
- Trip Start Time: ${new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
${tripType === "round-trip" && tripEndDate ? `- Trip End Date: ${new Date(tripEndDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}\n- Trip End Time: ${new Date(tripEndDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}\n` : ""}- Passengers: ${passengers}
- Car Type: ${carType}

Please contact the customer to confirm the booking details.

Tripeaz - Owned & managed by Wolfron Technologies LLP
    `;



    // Send email
    await transporter.sendMail({
      from: `"${bookingId}" <pgvaghela07@gmail.com>`, 
      to: "tripeaz25@gmail.com",
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    });


    return NextResponse.json({
      success: true,
      bookingId: bookingId,
      message: "Booking submitted successfully",
    });
  } catch (error) {
    console.error("Error sending booking email:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit booking" },
      { status: 500 }
    );
  }
}










