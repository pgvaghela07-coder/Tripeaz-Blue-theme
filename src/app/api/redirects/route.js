import { NextResponse } from "next/server";
import connectDB from "../../lib/db";
import Redirect from "../../models/redirect";
import { createAuditLog, getClientIP, getUserAgent } from "../../lib/auditLog.js";
import { requirePermission } from "../../lib/auth.js";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/redirects - Get all redirects
export async function GET() {
    try {
        await connectDB();

        const redirects = await Redirect.find()
            .populate('createdBy', 'userName email')
            .sort({ createdAt: -1 });

        return NextResponse.json(
            {
                success: true,
                redirects,
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            }
        );
    } catch (error) {
        console.error("Error fetching redirects:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch redirects",
                error: error.message,
            },
            { status: 500 }
        );
    }
}

// POST /api/redirects - Create new redirect
export async function POST(req) {
    try {
        // Require permission to manage SEO (redirects are part of SEO)
        const authData = await requirePermission(req, "canManageSEO");
        if (authData instanceof NextResponse) {
            return authData; // Return error response
        }

        await connectDB();

        const body = await req.json();
        const { fromPath, toPath, type, active, notes } = body;

        if (!fromPath || !toPath) {
            return NextResponse.json(
                { success: false, message: "From path and To path are required" },
                { status: 400 }
            );
        }

        // Normalize paths
        const normalizedFrom = fromPath.startsWith('/') ? fromPath : `/${fromPath}`;
        const normalizedTo = toPath.startsWith('/') || toPath.startsWith('http') ? toPath : `/${toPath}`;

        // Check for circular redirects
        if (normalizedFrom === normalizedTo) {
            return NextResponse.json(
                { success: false, message: "Cannot redirect to the same path" },
                { status: 400 }
            );
        }

        // Check if fromPath already exists
        const existing = await Redirect.findOne({ fromPath: normalizedFrom });
        if (existing) {
            return NextResponse.json(
                { success: false, message: "A redirect from this path already exists" },
                { status: 400 }
            );
        }

        // Check for circular redirect chain
        const potentialChain = await Redirect.findOne({ fromPath: normalizedTo });
        if (potentialChain) {
            // Check if potentialChain.toPath would create a loop
            const chainRedirect = await Redirect.findOne({ fromPath: potentialChain.toPath });
            if (chainRedirect && chainRedirect.fromPath === normalizedFrom) {
                return NextResponse.json(
                    { success: false, message: "This redirect would create a circular redirect chain" },
                    { status: 400 }
                );
            }
        }

        const redirect = await Redirect.create({
            fromPath: normalizedFrom,
            toPath: normalizedTo,
            type: type || 301,
            active: active !== undefined ? active : true,
            notes: notes || "",
        });

        // Create audit log
        await createAuditLog({
            userId: authData.admin._id,
            action: "create",
            resourceType: "redirect",
            resourceId: redirect._id,
            details: `Created redirect: ${normalizedFrom} → ${normalizedTo} (${type || 301})`,
            ipAddress: getClientIP(req),
            userAgent: getUserAgent(req),
        });

        return NextResponse.json(
            {
                success: true,
                message: "Redirect created successfully",
                redirect,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating redirect:", error);
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, message: "A redirect from this path already exists" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            {
                success: false,
                message: "Failed to create redirect",
                error: error.message,
            },
            { status: 500 }
        );
    }
}









