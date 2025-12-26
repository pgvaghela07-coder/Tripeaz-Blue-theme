import { NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import BLOG from "../../../models/blog";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/blogs/search?q=query - Search blogs for internal linking
export async function GET(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q') || '';
        const limit = parseInt(searchParams.get('limit')) || 10;

        if (!query || query.length < 2) {
            return NextResponse.json(
                {
                    success: true,
                    blogs: [],
                    message: "Query must be at least 2 characters",
                },
                { status: 200 }
            );
        }

        // Search blogs by title or slug
        const blogs = await BLOG.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { slug: { $regex: query, $options: 'i' } },
            ],
            status: { $in: ["published", "scheduled"] },
        })
            .select("_id title slug image status createdAt")
            .limit(limit)
            .sort({ createdAt: -1 });

        return NextResponse.json(
            {
                success: true,
                blogs,
                count: blogs.length,
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            }
        );
    } catch (error) {
        console.error("Error searching blogs:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to search blogs",
                error: error.message,
            },
            { status: 500 }
        );
    }
}









