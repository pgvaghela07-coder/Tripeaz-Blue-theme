  import { NextResponse } from "next/server";
  import jwt from "jsonwebtoken";
  import bcrypt from "bcryptjs";
  import Admin from "../../../models/admin.js";
  import connectDB from "../../../lib/db.js";
  import { createAuditLog, getClientIP, getUserAgent } from "../../../lib/auditLog.js";

  export async function POST(req) {
    try {
      await connectDB();

      const { email, password } = await req.json();

      const admin = await Admin.findOne({ email });
      console.log(admin)

      if (!admin) {
        return NextResponse.json(
          { success: false, message: "Email not found" },
          { status: 401 }
        );
      }

      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: "Invalid password" },
          { status: 401 }
        );
      }

      // Populate role to get full role information
      await admin.populate("role");

      const token = jwt.sign(
        { 
          id: admin._id, 
          role: admin.roleSlug || (admin.role?.slug || "admin"),
          roleId: admin.role?._id || null
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const res = NextResponse.json({
        success: true,
        message: "Login successful",
      });

      res.cookies.set("adminToken", token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days

      });

      // Create audit log for login
      await createAuditLog({
        userId: admin._id,
        action: "login",
        resourceType: "system",
        resourceId: null,
        details: `User logged in: ${admin.email}`,
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
      });

      return res;

    } catch (error) {
      console.error("Admin Login Error:", error);
      return NextResponse.json(
        { success: false, message: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
