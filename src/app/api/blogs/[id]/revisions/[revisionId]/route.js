import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import BlogRevision from "@/app/models/blogRevision";
import BLOG from "@/app/models/blog";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/blogs/[id]/revisions/[revisionId] - Get specific revision
export async function GET(req, { params }) {
    try {
        await connectDB();

        const { revisionId } = await params;

        const revision = await BlogRevision.findById(revisionId)
            .populate('editorId', 'userName email')
            .populate('postId', 'title slug');

        if (!revision) {
            return NextResponse.json(
                { success: false, message: "Revision not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, revision },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            }
        );
    } catch (error) {
        console.error("Error fetching revision:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch revision", error: error.message },
            { status: 500 }
        );
    }
}

// POST /api/blogs/[id]/revisions/[revisionId]/restore - Restore a revision
export async function POST(req, { params }) {
    try {
        await connectDB();

        const { id, revisionId } = await params;

        const revision = await BlogRevision.findById(revisionId);
        if (!revision) {
            return NextResponse.json(
                { success: false, message: "Revision not found" },
                { status: 404 }
            );
        }

        // Verify revision belongs to this blog
        if (revision.postId.toString() !== id) {
            return NextResponse.json(
                { success: false, message: "Revision does not belong to this blog" },
                { status: 400 }
            );
        }

        // Update blog with revision data
        const updatedBlog = await BLOG.findByIdAndUpdate(
            id,
            {
                title: revision.title,
                description: revision.contentHtml,
                metaTitle: revision.metaTitle,
                metaDescription: revision.metaDescription,
            },
            { new: true, runValidators: true }
        );

        // Create a new revision from the restored content
        await BlogRevision.create({
            postId: id,
            editorId: revision.editorId,
            contentHtml: revision.contentHtml,
            title: revision.title,
            description: revision.description,
            metaTitle: revision.metaTitle,
            metaDescription: revision.metaDescription,
            excerpt: revision.excerpt,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Revision restored successfully",
                blog: updatedBlog,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error restoring revision:", error);
        return NextResponse.json(
            { success: false, message: "Failed to restore revision", error: error.message },
            { status: 500 }
        );
    }
}






