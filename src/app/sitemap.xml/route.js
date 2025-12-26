import { generateSitemap } from "@/lib/sitemap";
import { NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const xml = await generateSitemap();

        return new NextResponse(xml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        console.error("Error generating sitemap:", error);
        return NextResponse.json(
            { error: "Failed to generate sitemap" },
            { status: 500 }
        );
    }
}

















