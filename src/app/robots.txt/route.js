import { NextResponse } from "next/server";
import connectDB from "../lib/db";
import Robots from "../models/robots";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        await connectDB();
        const robots = await Robots.getRobots();

        // Ensure sitemap is included
        let content = robots.content;
        const sitemapUrl = process.env.NEXT_PUBLIC_BASE_URL 
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`
            : "https://gujarat.taxi/sitemap.xml";

        if (!content.includes("Sitemap:")) {
            content += `\n\nSitemap: ${sitemapUrl}`;
        }

        return new NextResponse(content, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        console.error("Error fetching robots.txt:", error);
        // Return default robots.txt on error
        const defaultRobots = `User-agent: *
Allow: /

Sitemap: ${process.env.NEXT_PUBLIC_BASE_URL || "https://gujarat.taxi"}/sitemap.xml`;

        return new NextResponse(defaultRobots, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    }
}

















