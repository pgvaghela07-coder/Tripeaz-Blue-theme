import { NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import Tag from "../../../models/tag";
import { createAuditLog, getClientIP, getUserAgent } from "../../../lib/auditLog.js";
import { requirePermission } from "../../../lib/auth.js";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/tags/[id] - Get tag by ID
export async function GET(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;
        const tag = await Tag.findById(id);

        if (!tag) {
            return NextResponse.json(
                { success: false, message: "Tag not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, tag },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            }
        );
    } catch (error) {
        console.error("Error fetching tag:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch tag", error: error.message },
            { status: 500 }
        );
    }
}

// PUT /api/tags/[id] - Update tag
export async function PUT(req, { params }) {
    try {
        // Require permission to manage tags
        const authData = await requirePermission(req, "canManageTags");
        if (authData instanceof NextResponse) {
            return authData; // Return error response
        }

        await connectDB();

        const { id } = await params;
        const body = await req.json();
        const { name, description, seoTitle, seoDescription } = body;

        const tag = await Tag.findById(id);
        if (!tag) {
            return NextResponse.json(
                { success: false, message: "Tag not found" },
                { status: 404 }
            );
        }

        // Generate slug if name changed
        let slug = tag.slug;
        if (name && name !== tag.name) {
            slug = name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");

            // Check if new slug exists
            const existing = await Tag.findOne({ slug, _id: { $ne: id } });
            if (existing) {
                return NextResponse.json(
                    { success: false, message: "Tag with this name already exists" },
                    { status: 400 }
                );
            }
        }

        const updatedTag = await Tag.findByIdAndUpdate(
            id,
            {
                name: name || tag.name,
                slug,
                description: description !== undefined ? description : tag.description,
                seoTitle: seoTitle !== undefined ? seoTitle : tag.seoTitle,
                seoDescription: seoDescription !== undefined ? seoDescription : tag.seoDescription,
            },
            { new: true, runValidators: true }
        );

        // Create audit log
        await createAuditLog({
            userId: authData.admin._id,
            action: "update",
            resourceType: "tag",
            resourceId: updatedTag._id,
            details: `Updated tag: ${updatedTag.name}`,
            ipAddress: getClientIP(req),
            userAgent: getUserAgent(req),
        });

        return NextResponse.json(
            {
                success: true,
                message: "Tag updated successfully",
                tag: updatedTag,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating tag:", error);
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, message: "Tag with this name already exists" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, message: "Failed to update tag", error: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/tags/[id] - Delete tag
export async function DELETE(req, { params }) {
    try {
        // Require permission to manage tags
        const authData = await requirePermission(req, "canManageTags");
        if (authData instanceof NextResponse) {
            return authData; // Return error response
        }

        await connectDB();

        const { id } = await params;

        const tag = await Tag.findById(id);
        if (!tag) {
            return NextResponse.json(
                { success: false, message: "Tag not found" },
                { status: 404 }
            );
        }

        await Tag.findByIdAndDelete(id);

        // Create audit log
        await createAuditLog({
            userId: authData.admin._id,
            action: "delete",
            resourceType: "tag",
            resourceId: tag._id,
            details: `Deleted tag: ${tag.name}`,
            ipAddress: getClientIP(req),
            userAgent: getUserAgent(req),
        });

        return NextResponse.json(
            { success: true, message: "Tag deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting tag:", error);
        return NextResponse.json(
            { success: false, message: "Failed to delete tag", error: error.message },
            { status: 500 }
        );
    }
}









