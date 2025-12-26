import { NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import BLOG from "../../../../models/blog";

// Force dynamic rendering - disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/blogs/slug/[slug] → Get blog by slug
export async function GET(req, { params }) {
    try {
        await connectDB();

        const { slug } = await params;

        console.log("Fetching blog with slug:", slug);

        if (!slug) {
            return NextResponse.json(
                { message: "Slug is required", success: false },
                { status: 400 }
            );
        }

        let blog;
        try {
            blog = await BLOG.findOne({ slug, status: "published" })
                .populate('categories', 'name slug')
                .populate('tags', 'name slug')
                .populate({
                    path: 'authorId',
                    select: 'userName email',
                    options: { strictPopulate: false }
                })
                .lean();
            
            console.log("Blog found:", blog ? blog.title : "Not found");
        } catch (populateError) {
            console.error("Error populating blog:", populateError);
            console.error("Error stack:", populateError.stack);
            // Try without populate if it fails
            try {
                blog = await BLOG.findOne({ slug, status: "published" }).lean();
            } catch (findError) {
                console.error("Error finding blog:", findError);
                throw findError;
            }
        }

        if (!blog) {
            return NextResponse.json(
                { message: "Blog not found", success: false },
                { status: 404 }
            );
        }

        // Helper function to safely convert to string
        const safeToString = (value) => {
            if (!value) return null;
            if (typeof value === 'string') return value;
            if (value && value.toString) return value.toString();
            return String(value);
        };

        // Convert to plain object and ensure proper serialization
        const blogData = {
            ...blog,
            _id: blog._id ? blog._id.toString() : null,
            categories: Array.isArray(blog.categories) && blog.categories.length > 0
                ? blog.categories
                    .filter(cat => cat && cat._id)
                    .map(cat => ({
                        _id: cat._id ? cat._id.toString() : null,
                        name: cat.name || '',
                        slug: cat.slug || ''
                    }))
                : [],
            tags: Array.isArray(blog.tags) && blog.tags.length > 0
                ? blog.tags
                    .filter(tag => tag && tag._id)
                    .map(tag => ({
                        _id: tag._id ? tag._id.toString() : null,
                        name: tag.name || '',
                        slug: tag.slug || ''
                    }))
                : [],
            createdAt: blog.createdAt ? (blog.createdAt instanceof Date ? blog.createdAt.toISOString() : new Date(blog.createdAt).toISOString()) : null,
            updatedAt: blog.updatedAt ? (blog.updatedAt instanceof Date ? blog.updatedAt.toISOString() : new Date(blog.updatedAt).toISOString()) : null,
            scheduledAt: blog.scheduledAt ? (blog.scheduledAt instanceof Date ? blog.scheduledAt.toISOString() : new Date(blog.scheduledAt).toISOString()) : null,
        };

        // Handle authorId separately
        if (blog.authorId) {
            if (typeof blog.authorId === 'object' && blog.authorId._id) {
                blogData.authorId = {
                    _id: blog.authorId._id.toString(),
                    userName: blog.authorId.userName || '',
                    email: blog.authorId.email || ''
                };
            } else {
                blogData.authorId = blog.authorId.toString();
            }
        } else {
            blogData.authorId = null;
        }

        return NextResponse.json(
            { blog: blogData, success: true }, 
            { 
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            }
        );
    } catch (error) {
        console.error("Error fetching blog by slug:", error);
        return NextResponse.json(
            { message: "Internal Server Error", error: error.message, success: false },
            { status: 500 }
        );
    }
}

















