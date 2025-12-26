import { NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import Redirect from "../../../models/redirect";
import { createAuditLog, getClientIP, getUserAgent } from "../../../lib/auditLog.js";
import { requirePermission } from "../../../lib/auth.js";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/redirects/[id] - Get redirect by ID
export async function GET(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;
        const redirect = await Redirect.findById(id).populate('createdBy', 'userName email');

        if (!redirect) {
            return NextResponse.json(
                { success: false, message: "Redirect not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, redirect },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            }
        );
    } catch (error) {
        console.error("Error fetching redirect:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch redirect", error: error.message },
            { status: 500 }
        );
    }
}

// PUT /api/redirects/[id] - Update redirect
export async function PUT(req, { params }) {
    try {
        // Require permission to manage SEO (redirects are part of SEO)
        const authData = await requirePermission(req, "canManageSEO");
        if (authData instanceof NextResponse) {
            return authData; // Return error response
        }

        await connectDB();

        const { id } = await params;
        const body = await req.json();
        const { fromPath, toPath, type, active, notes } = body;

        const redirect = await Redirect.findById(id);
        if (!redirect) {
            return NextResponse.json(
                { success: false, message: "Redirect not found" },
                { status: 404 }
            );
        }

        // Normalize paths
        const normalizedFrom = fromPath 
            ? (fromPath.startsWith('/') ? fromPath : `/${fromPath}`)
            : redirect.fromPath;
        const normalizedTo = toPath 
            ? (toPath.startsWith('/') || toPath.startsWith('http') ? toPath : `/${toPath}`)
            : redirect.toPath;

        // Check for circular redirects
        if (normalizedFrom === normalizedTo) {
            return NextResponse.json(
                { success: false, message: "Cannot redirect to the same path" },
                { status: 400 }
            );
        }

        // Check if fromPath already exists (excluding current redirect)
        if (fromPath && normalizedFrom !== redirect.fromPath) {
            const existing = await Redirect.findOne({ 
                fromPath: normalizedFrom,
                _id: { $ne: id }
            });
            if (existing) {
                return NextResponse.json(
                    { success: false, message: "A redirect from this path already exists" },
                    { status: 400 }
                );
            }
        }

        const updatedRedirect = await Redirect.findByIdAndUpdate(
            id,
            {
                fromPath: normalizedFrom,
                toPath: normalizedTo,
                type: type !== undefined ? type : redirect.type,
                active: active !== undefined ? active : redirect.active,
                notes: notes !== undefined ? notes : redirect.notes,
            },
            { new: true, runValidators: true }
        ).populate('createdBy', 'userName email');

        // Create audit log
        const changes = [];
        if (fromPath && normalizedFrom !== redirect.fromPath) {
            changes.push(`From: ${redirect.fromPath} → ${normalizedFrom}`);
        }
        if (toPath && normalizedTo !== redirect.toPath) {
            changes.push(`To: ${redirect.toPath} → ${normalizedTo}`);
        }
        if (type !== undefined && type !== redirect.type) {
            changes.push(`Type: ${redirect.type} → ${type}`);
        }
        if (active !== undefined && active !== redirect.active) {
            changes.push(`Active: ${redirect.active} → ${active}`);
        }

        const details = changes.length > 0
            ? `Updated redirect: ${changes.join(', ')}`
            : `Updated redirect: ${normalizedFrom} → ${normalizedTo}`;

        await createAuditLog({
            userId: authData.admin._id,
            action: "update",
            resourceType: "redirect",
            resourceId: updatedRedirect._id,
            details: details,
            ipAddress: getClientIP(req),
            userAgent: getUserAgent(req),
        });

        return NextResponse.json(
            {
                success: true,
                message: "Redirect updated successfully",
                redirect: updatedRedirect,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating redirect:", error);
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, message: "A redirect from this path already exists" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, message: "Failed to update redirect", error: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/redirects/[id] - Delete redirect
export async function DELETE(req, { params }) {
    try {
        // Require permission to manage SEO (redirects are part of SEO)
        const authData = await requirePermission(req, "canManageSEO");
        if (authData instanceof NextResponse) {
            return authData; // Return error response
        }

        await connectDB();

        const { id } = await params;

        const redirect = await Redirect.findById(id);
        if (!redirect) {
            return NextResponse.json(
                { success: false, message: "Redirect not found" },
                { status: 404 }
            );
        }

        await Redirect.findByIdAndDelete(id);

        // Create audit log
        await createAuditLog({
            userId: authData.admin._id,
            action: "delete",
            resourceType: "redirect",
            resourceId: redirect._id,
            details: `Deleted redirect: ${redirect.fromPath} → ${redirect.toPath}`,
            ipAddress: getClientIP(req),
            userAgent: getUserAgent(req),
        });

        return NextResponse.json(
            { success: true, message: "Redirect deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting redirect:", error);
        return NextResponse.json(
            { success: false, message: "Failed to delete redirect", error: error.message },
            { status: 500 }
        );
    }
}









