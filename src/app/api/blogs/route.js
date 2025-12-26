import { NextResponse } from "next/server";
import connectDB from "../../lib/db";
import BLOG from "../../models/blog";
import ROUTE from "../../models/routeModel";
import CITY from "../../models/city";
import AIRPORT from "../../models/airport";
import cloudinary from "../../lib/cloudinary";
import { createAuditLog, getClientIP, getUserAgent } from "../../lib/auditLog.js";
import { requirePermission } from "../../lib/auth.js";

// Force dynamic rendering - disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST /api/blogs → Create new blog
export async function POST(req) {
    try {
        // Require permission to create blogs
        const authData = await requirePermission(req, "canCreateBlog");
        if (authData instanceof NextResponse) {
            return authData; // Return error response
        }

        await connectDB()

        const formData = await req.formData();

        const title = formData.get("title")
        const slug = formData.get("slug")
        const description = formData.get("description")
        const metaTitle = formData.get("metaTitle")
        const metaDescription = formData.get("metaDescription")
        const extra_metatag = formData.get("extra_metatag")
        const metaKeywords = (formData.get("metaKeywords"))
            ?.split(",")
            .map((k) => k.trim());
        const faqsJson = formData.get("faqs");
        let faqs = [];
        if (faqsJson) {
            try {
                faqs = JSON.parse(faqsJson);
                // Filter out empty FAQs
                faqs = faqs.filter(faq => faq.question && faq.answer);
            } catch (e) {
                console.error("Error parsing FAQs:", e);
            }
        }
        const categoriesJson = formData.get("categories");
        let categories = [];
        if (categoriesJson) {
            try {
                categories = JSON.parse(categoriesJson);
            } catch (e) {
                console.error("Error parsing categories:", e);
            }
        }
        const tagsJson = formData.get("tags");
        let tags = [];
        if (tagsJson) {
            try {
                tags = JSON.parse(tagsJson);
            } catch (e) {
                console.error("Error parsing tags:", e);
            }
        }
        const scheduledAt = formData.get("scheduledAt");
        const canonicalUrl = formData.get("canonicalUrl");
        const featuredImageAlt = formData.get("featuredImageAlt");
        const status = formData.get("status") || "draft";
        const imageFile = formData.get("image")


        if (!title || !slug || !description || !imageFile) {
            return NextResponse.json(
                { message: "Title, slug, and description are required.", success: false },
                { status: 400 }
            );
        }

        const existing = await BLOG.findOne({ slug });
        if (existing) {
            return NextResponse.json(
                { message: "Slug already exists. Please change the title.", success: false },
                { status: 400 }
            );
        }

        if (imageFile) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uploadRes = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: "gujrat_taxi/blogs"
                    },
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                ).end(buffer);
            });

            const imageUrl = uploadRes.secure_url;
            const publicId = uploadRes.public_id;

            console.log(publicId)


            const blogData = {
                title,
                slug,
                image: imageUrl,
                img_publicId: publicId,
                description,
                metaTitle,
                metaDescription,
                metaKeywords,
                extra_metatag,
                faqs: faqs,
                categories: categories || [],
                tags: tags || [],
                status: status,
                featuredImageAlt: featuredImageAlt || "",
            };

            if (scheduledAt) {
                blogData.scheduledAt = new Date(scheduledAt);
                if (status === "published") {
                    blogData.status = "scheduled";
                }
            }

            if (canonicalUrl) {
                blogData.canonicalUrl = canonicalUrl;
            }

            const newBlog = await BLOG.create(blogData);

            // Create audit log
            await createAuditLog({
                userId: authData.admin._id,
                action: "create",
                resourceType: "blog",
                resourceId: newBlog._id,
                details: `Created blog: ${newBlog.title}`,
                ipAddress: getClientIP(req),
                userAgent: getUserAgent(req),
            });

            console.log(publicId)

            return NextResponse.json(
                { message: "Blog created successfully!", blog: newBlog, success: true },
                { status: 201 }
            );
        }
    } catch (error) {
        console.error("Error creating blog:", error);
        return NextResponse.json(
            { message: "Internal Server Error", error: error.message, success: false },
            { status: 500 }
        );
    }
}

export async function GET(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        const query = {};
        
        if (status) {
            query.status = status;
        }

        const blogs = await BLOG.find(query).sort({ createdAt: -1 }).lean();
        
        // Check if blogs are linked to routes/cities/airports and determine URL
        const blogsData = await Promise.all(blogs.map(async (blog) => {
            // Check if blog is linked to route/city/airport
            const route = await ROUTE.findOne({ blogId: blog._id }).lean();
            const city = await CITY.findOne({ blogId: blog._id }).lean();
            const airport = await AIRPORT.findOne({ blogId: blog._id }).lean();
            
            let blogUrl = `/blog/${blog.slug}`; // Default for regular blogs
            let isLinked = false;
            
            if (route) {
                blogUrl = `/${route.url}`; // Direct slug for route blogs
                isLinked = true;
            } else if (city) {
                blogUrl = `/${city.url}`; // Direct slug for city blogs
                isLinked = true;
            } else if (airport) {
                blogUrl = `/${airport.url}`; // Direct slug for airport blogs
                isLinked = true;
            }
            
            return {
            ...blog,
            _id: blog._id.toString(),
                blogUrl,
                isLinked,
            };
        }));

        // Get counts for admin dashboard
        const totalBlogs = await BLOG.countDocuments();
        const publishedCount = await BLOG.countDocuments({ status: "published" });
        const scheduledCount = await BLOG.countDocuments({ status: "scheduled" });
        const draftCount = await BLOG.countDocuments({ status: "draft" });

        return NextResponse.json(
            { 
                blogs: blogsData, 
                totalBlogs,
                publishedCount,
                scheduledCount,
                draftCount,
                success: true 
            }, 
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
        console.error("Error fetching blogs:", error);
        return NextResponse.json(
            { 
                message: "Failed to fetch blogs", 
                error: error.message, 
                success: false 
            },
            { status: 500 }
        );
    }
}
