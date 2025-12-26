import { NextResponse } from "next/server";
import { generateSitemap } from "@/lib/sitemap";
import { createAuditLog, getClientIP, getUserAgent } from "@/app/lib/auditLog.js";
import { requirePermission } from "@/app/lib/auth.js";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/seo/sitemap - Get sitemap preview or regenerate
export async function GET() {
    try {
        const xml = await generateSitemap();

        return NextResponse.json(
            {
                success: true,
                sitemap: xml,
                message: "Sitemap generated successfully",
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            }
        );
    } catch (error) {
        console.error("Error generating sitemap:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to generate sitemap",
                error: error.message,
            },
            { status: 500 }
        );
    }
}

// POST /api/seo/sitemap - Regenerate sitemap (same as GET, but for manual trigger)
export async function POST(req) {
    try {
        // Require permission to manage SEO
        const authData = await requirePermission(req, "canManageSEO");
        if (authData instanceof NextResponse) {
            return authData; // Return error response
        }

        const xml = await generateSitemap();

        // Create audit log for manual regeneration
        await createAuditLog({
            userId: authData.admin._id,
            action: "update",
            resourceType: "seo",
            resourceId: null,
            details: "Regenerated sitemap.xml",
            ipAddress: getClientIP(req),
            userAgent: getUserAgent(req),
        });

        return NextResponse.json(
            {
                success: true,
                sitemap: xml,
                message: "Sitemap generated successfully",
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            }
        );
    } catch (error) {
        console.error("Error generating sitemap:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to generate sitemap",
                error: error.message,
            },
            { status: 500 }
        );
    }
}









