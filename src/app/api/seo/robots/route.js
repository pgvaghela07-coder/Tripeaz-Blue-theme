import { NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import Robots from "../../../models/robots";
import { createAuditLog, getClientIP, getUserAgent } from "../../../lib/auditLog.js";
import { requirePermission } from "../../../lib/auth.js";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/seo/robots - Get robots.txt content
export async function GET() {
    try {
        await connectDB();
        const robots = await Robots.getRobots();

        return NextResponse.json(
            {
                success: true,
                content: robots.content,
                lastModified: robots.lastModified,
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            }
        );
    } catch (error) {
        console.error("Error fetching robots.txt:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch robots.txt",
                error: error.message,
            },
            { status: 500 }
        );
    }
}

// PUT /api/seo/robots - Update robots.txt content
export async function PUT(req) {
    try {
        // Require permission to manage SEO
        const authData = await requirePermission(req, "canManageSEO");
        if (authData instanceof NextResponse) {
            return authData; // Return error response
        }

        await connectDB();

        const body = await req.json();
        const { content } = body;

        if (!content || typeof content !== 'string') {
            return NextResponse.json(
                { success: false, message: "Content is required and must be a string" },
                { status: 400 }
            );
        }

        // Basic validation - check for common robots.txt syntax
        const lines = content.split('\n');
        let hasUserAgent = false;
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.toLowerCase().startsWith('user-agent:')) {
                hasUserAgent = true;
                break;
            }
        }

        if (!hasUserAgent && content.trim().length > 0) {
            return NextResponse.json(
                { success: false, message: "Robots.txt should contain at least one User-agent directive" },
                { status: 400 }
            );
        }

        // Get or create robots document
        let robots = await Robots.findOne();
        const isNew = !robots;
        if (!robots) {
            robots = await Robots.create({ content });
        } else {
            robots.content = content;
            robots.lastModified = new Date();
            await robots.save();
        }

        // Create audit log
        await createAuditLog({
            userId: authData.admin._id,
            action: isNew ? "create" : "update",
            resourceType: "seo",
            resourceId: robots._id,
            details: `${isNew ? "Created" : "Updated"} robots.txt file`,
            ipAddress: getClientIP(req),
            userAgent: getUserAgent(req),
        });

        return NextResponse.json(
            {
                success: true,
                message: "Robots.txt updated successfully",
                content: robots.content,
                lastModified: robots.lastModified,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating robots.txt:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update robots.txt",
                error: error.message,
            },
            { status: 500 }
        );
    }
}









