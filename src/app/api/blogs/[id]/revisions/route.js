import { NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import BlogRevision from "../../../../models/blogRevision";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/blogs/[id]/revisions - Get all revisions for a blog
export async function GET(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;

        const revisions = await BlogRevision.find({ postId: id })
            .populate('editorId', 'userName email')
            .sort({ createdAt: -1 })
            .limit(10); // Limit to last 10 revisions

        return NextResponse.json(
            {
                success: true,
                revisions,
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            }
        );
    } catch (error) {
        console.error("Error fetching revisions:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch revisions",
                error: error.message,
            },
            { status: 500 }
        );
    }
}

// POST /api/blogs/[id]/revisions - Create a new revision
export async function POST(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;
        const body = await req.json();
        const { contentHtml, title, description, metaTitle, metaDescription, excerpt, editorId } = body;

        if (!contentHtml || !title) {
            return NextResponse.json(
                { success: false, message: "Content and title are required" },
                { status: 400 }
            );
        }

        // Check if we already have 10 revisions, delete oldest if needed
        const revisionCount = await BlogRevision.countDocuments({ postId: id });
        if (revisionCount >= 10) {
            const oldestRevision = await BlogRevision.findOne({ postId: id })
                .sort({ createdAt: 1 });
            if (oldestRevision) {
                await BlogRevision.findByIdAndDelete(oldestRevision._id);
            }
        }

        const revision = await BlogRevision.create({
            postId: id,
            editorId: editorId || null,
            contentHtml,
            title,
            description: description || "",
            metaTitle: metaTitle || "",
            metaDescription: metaDescription || "",
            excerpt: excerpt || "",
        });

        return NextResponse.json(
            {
                success: true,
                message: "Revision saved successfully",
                revision,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating revision:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to create revision",
                error: error.message,
            },
            { status: 500 }
        );
    }
}









