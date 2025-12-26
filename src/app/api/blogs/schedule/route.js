import { NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import BLOG from "../../../models/blog";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/blogs/schedule - Check and publish scheduled posts
export async function GET() {
    try {
        await connectDB();

        const now = new Date();
        
        // Find all scheduled posts that should be published
        const scheduledPosts = await BLOG.find({
            status: "scheduled",
            scheduledAt: { $lte: now }
        });

        if (scheduledPosts.length === 0) {
            return NextResponse.json(
                {
                    success: true,
                    message: "No scheduled posts to publish",
                    published: 0,
                },
                { status: 200 }
            );
        }

        // Update all scheduled posts to published
        const result = await BLOG.updateMany(
            {
                status: "scheduled",
                scheduledAt: { $lte: now }
            },
            {
                $set: { status: "published" }
            }
        );

        return NextResponse.json(
            {
                success: true,
                message: `Published ${result.modifiedCount} scheduled post(s)`,
                published: result.modifiedCount,
                posts: scheduledPosts.map(post => ({
                    id: post._id,
                    title: post.title,
                    slug: post.slug,
                })),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error processing scheduled posts:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to process scheduled posts",
                error: error.message,
            },
            { status: 500 }
        );
    }
}

// POST /api/blogs/schedule - Manually trigger scheduled posts check
export async function POST() {
    // Same logic as GET
    return GET();
}

















