import { NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import BLOG from "../../../models/blog";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/seo/canonical - Find duplicate content
export async function GET(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const blogId = searchParams.get('blogId');

        const blogs = await BLOG.find({ status: { $in: ["published", "scheduled"] } })
            .select("_id title metaTitle metaDescription description slug canonicalUrl")
            .lean();

        // Find potential duplicates
        const duplicates = [];
        
        for (let i = 0; i < blogs.length; i++) {
            const blog = blogs[i];
            
            // Skip if checking specific blog and it's not this one
            if (blogId && blog._id.toString() !== blogId) {
                continue;
            }

            const blogTitle = (blog.metaTitle || blog.title || "").toLowerCase().trim();
            const blogDescription = (blog.metaDescription || blog.description?.replace(/<[^>]+>/g, "") || "").toLowerCase().trim();

            const similar = [];

            for (let j = 0; j < blogs.length; j++) {
                if (i === j) continue;
                if (blogId && blogs[j]._id.toString() === blogId) continue;

                const otherTitle = (blogs[j].metaTitle || blogs[j].title || "").toLowerCase().trim();
                const otherDescription = (blogs[j].metaDescription || blogs[j].description?.replace(/<[^>]+>/g, "") || "").toLowerCase().trim();

                // Calculate similarity
                let similarityScore = 0;
                let reasons = [];

                // Title similarity
                if (blogTitle && otherTitle) {
                    const titleSimilarity = calculateSimilarity(blogTitle, otherTitle);
                    if (titleSimilarity > 0.7) {
                        similarityScore += titleSimilarity * 0.5;
                        reasons.push(`Title similarity: ${Math.round(titleSimilarity * 100)}%`);
                    }
                }

                // Description similarity
                if (blogDescription && otherDescription) {
                    const descSimilarity = calculateSimilarity(blogDescription, otherDescription);
                    if (descSimilarity > 0.7) {
                        similarityScore += descSimilarity * 0.5;
                        reasons.push(`Description similarity: ${Math.round(descSimilarity * 100)}%`);
                    }
                }

                if (similarityScore > 0.5) {
                    similar.push({
                        blogId: blogs[j]._id,
                        title: blogs[j].title,
                        slug: blogs[j].slug,
                        canonicalUrl: blogs[j].canonicalUrl,
                        similarityScore: Math.round(similarityScore * 100),
                        reasons,
                    });
                }
            }

            if (similar.length > 0) {
                duplicates.push({
                    blogId: blog._id,
                    title: blog.title,
                    slug: blog.slug,
                    canonicalUrl: blog.canonicalUrl,
                    similar,
                });
            }
        }

        return NextResponse.json(
            {
                success: true,
                duplicates,
                totalChecked: blogs.length,
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            }
        );
    } catch (error) {
        console.error("Error finding duplicate content:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to find duplicate content",
                error: error.message,
            },
            { status: 500 }
        );
    }
}

// Helper function to calculate string similarity (Jaro-Winkler-like)
function calculateSimilarity(str1, str2) {
    if (str1 === str2) return 1.0;
    if (str1.length === 0 || str2.length === 0) return 0.0;

    // Simple word-based similarity
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
}

















