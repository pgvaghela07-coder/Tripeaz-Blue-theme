import { NextResponse } from "next/server";
import connectDB from "../../lib/db";
import Tag from "../../models/tag";
import { createAuditLog, getClientIP, getUserAgent } from "../../lib/auditLog.js";
import { requirePermission } from "../../lib/auth.js";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/tags - Get all tags
export async function GET() {
    try {
        await connectDB();

        const tags = await Tag.find().sort({ createdAt: -1 });

        return NextResponse.json(
            {
                success: true,
                tags,
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            }
        );
    } catch (error) {
        console.error("Error fetching tags:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch tags",
                error: error.message,
            },
            { status: 500 }
        );
    }
}

// POST /api/tags - Create new tag
export async function POST(req) {
    try {
        // Require permission to manage tags
        const authData = await requirePermission(req, "canManageTags");
        if (authData instanceof NextResponse) {
            return authData; // Return error response
        }

        await connectDB();

        const body = await req.json();
        const { name, description, seoTitle, seoDescription } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, message: "Tag name is required" },
                { status: 400 }
            );
        }

        // Generate slug from name
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        // Check if tag already exists
        const existing = await Tag.findOne({ $or: [{ slug }, { name: name.trim() }] });
        if (existing) {
            return NextResponse.json(
                { success: false, message: "Tag with this name already exists" },
                { status: 400 }
            );
        }

        const tag = await Tag.create({
            name: name.trim(),
            slug,
            description: description || "",
            seoTitle: seoTitle || "",
            seoDescription: seoDescription || "",
        });

        // Create audit log
        await createAuditLog({
            userId: authData.admin._id,
            action: "create",
            resourceType: "tag",
            resourceId: tag._id,
            details: `Created tag: ${tag.name}`,
            ipAddress: getClientIP(req),
            userAgent: getUserAgent(req),
        });

        return NextResponse.json(
            {
                success: true,
                message: "Tag created successfully",
                tag,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating tag:", error);
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, message: "Tag with this name already exists" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            {
                success: false,
                message: "Failed to create tag",
                error: error.message,
            },
            { status: 500 }
        );
    }
}









