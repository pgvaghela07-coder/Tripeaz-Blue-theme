import { NextResponse } from "next/server";
import connectDB from "../../../lib/db"
import BLOG from "../../../models/blog"
import cloudinary from "@/app/lib/cloudinary";
import { createAuditLog, getClientIP, getUserAgent } from "../../../lib/auditLog.js";
import { requirePermission, hasPermission } from "../../../lib/auth.js";

// Force dynamic rendering - disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/blogs/[id] → Get blog by ID
export async function GET(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;
        
        console.log("Fetching blog with ID:", id);

        if (!id) {
            return NextResponse.json({ success: false, message: "Blog ID is required" }, { status: 400 });
        }

        let blog;
        try {
            // Try to populate, but handle errors gracefully
            blog = await BLOG.findById(id)
                .populate({
                    path: 'categories',
                    select: 'name slug',
                    strictPopulate: false
                })
                .populate({
                    path: 'tags',
                    select: 'name slug',
                    strictPopulate: false
                })
                .populate({
                    path: 'authorId',
                    select: 'userName email',
                    strictPopulate: false
                })
                .lean();
        } catch (populateError) {
            console.error("Error populating blog:", populateError);
            // If populate fails, try without populate
            try {
                blog = await BLOG.findById(id).lean();
            } catch (findError) {
                console.error("Error finding blog:", findError);
                return NextResponse.json({ 
                    success: false, 
                    message: "Error fetching blog",
                    error: findError.message 
                }, { status: 500 });
            }
        }

        if (!blog) {
            console.log("Blog not found for ID:", id);
            return NextResponse.json({ success: false, message: "Blog not found" }, { status: 404 });
        }

        console.log("Blog found:", blog.title);

        // Convert to plain object and ensure proper serialization
        // Filter out null/undefined populated fields
        const safeCategories = Array.isArray(blog.categories) 
            ? blog.categories
                .filter(cat => {
                    // Handle both populated objects and ObjectIds
                    if (!cat) return false;
                    if (typeof cat === 'object' && cat._id) {
                        return cat._id && typeof cat._id !== 'undefined' && cat._id !== null;
                    }
                    // If it's just an ObjectId string, include it
                    return typeof cat === 'string' || (cat && cat.toString);
                })
                .map(cat => {
                    // If it's already an ObjectId string, return minimal object
                    if (typeof cat === 'string') {
                        return { _id: cat, name: '', slug: '' };
                    }
                    // If it's a populated object
                    if (cat && cat._id) {
                        return {
                            _id: cat._id.toString(),
                            name: cat.name || '',
                            slug: cat.slug || ''
                        };
                    }
                    // Fallback
                    return { _id: cat.toString(), name: '', slug: '' };
                })
            : [];
        
        const safeTags = Array.isArray(blog.tags)
            ? blog.tags
                .filter(tag => {
                    // Handle both populated objects and ObjectIds
                    if (!tag) return false;
                    if (typeof tag === 'object' && tag._id) {
                        return tag._id && typeof tag._id !== 'undefined' && tag._id !== null;
                    }
                    // If it's just an ObjectId string, include it
                    return typeof tag === 'string' || (tag && tag.toString);
                })
                .map(tag => {
                    // If it's already an ObjectId string, return minimal object
                    if (typeof tag === 'string') {
                        return { _id: tag, name: '', slug: '' };
                    }
                    // If it's a populated object
                    if (tag && tag._id) {
                        return {
                            _id: tag._id.toString(),
                            name: tag.name || '',
                            slug: tag.slug || ''
                        };
                    }
                    // Fallback
                    return { _id: tag.toString(), name: '', slug: '' };
                })
            : [];

        // Safely handle authorId
        let safeAuthorId = null;
        if (blog.authorId && blog.authorId._id) {
            try {
                safeAuthorId = {
                    _id: blog.authorId._id.toString(),
                    userName: blog.authorId.userName || '',
                    email: blog.authorId.email || ''
                };
            } catch (e) {
                console.error("Error processing authorId:", e);
            }
        }

        // Build blogData safely, avoiding circular references and Mongoose internals
        const blogData = {
            _id: blog._id ? blog._id.toString() : id,
            title: blog.title || '',
            slug: blog.slug || '',
            description: blog.description || '',
            image: blog.image || null,
            img_publicId: blog.img_publicId || null,
            metaTitle: blog.metaTitle || '',
            metaDescription: blog.metaDescription || '',
            metaKeywords: Array.isArray(blog.metaKeywords) ? blog.metaKeywords : [],
            extra_metatag: blog.extra_metatag || '',
            faqs: Array.isArray(blog.faqs) ? blog.faqs : [],
            categories: safeCategories,
            tags: safeTags,
            authorId: safeAuthorId,
            status: blog.status || 'draft',
            featuredImageAlt: blog.featuredImageAlt || '',
            canonicalUrl: blog.canonicalUrl || null,
            createdAt: blog.createdAt ? new Date(blog.createdAt).toISOString() : null,
            updatedAt: blog.updatedAt ? new Date(blog.updatedAt).toISOString() : null,
            scheduledAt: blog.scheduledAt ? new Date(blog.scheduledAt).toISOString() : null,
        };

        // Test serialization before sending
        try {
            JSON.stringify(blogData);
        } catch (serializeError) {
            console.error("Serialization error:", serializeError);
            // Remove any problematic fields
            const cleanBlogData = {
                ...blogData,
                description: typeof blogData.description === 'string' ? blogData.description : '',
            };
            return NextResponse.json(
                { blog: cleanBlogData, success: true }, 
                { 
                    status: 200,
                    headers: {
                        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                    }
                }
            );
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
        console.error("Get blog error:", error);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        
        // Return more detailed error in development
        const errorMessage = process.env.NODE_ENV === 'development' 
            ? error.message 
            : "Internal Server Error";
            
        return NextResponse.json({ 
            message: "Internal Server Error", 
            error: errorMessage, 
            success: false,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

// PUT /api/blogs/[id] → Update blog
export async function PUT(req, { params }) {
    try {
        // Require permission to edit blogs
        const authData = await requirePermission(req, "canEditBlog");
        if (authData instanceof NextResponse) {
            return authData; // Return error response
        }

        await connectDB();

        const { id } = await params;
        const formData = await req.formData();

        const blog = await BLOG.findById(id);
        if (!blog) {
            return NextResponse.json({ success: false, message: "Blog not found" }, { status: 404 });
        }

        const status = formData.get("status") || blog.status;
        
        // Check if trying to publish - requires canPublishBlog permission
        if (status === "published" && blog.status !== "published") {
            if (!hasPermission(authData.role, "canPublishBlog")) {
                return NextResponse.json(
                    { success: false, message: "You don't have permission to publish blogs" },
                    { status: 403 }
                );
            }
        }
        
        // Check if trying to schedule - requires canPublishBlog permission
        if (status === "scheduled") {
            if (!hasPermission(authData.role, "canPublishBlog")) {
                return NextResponse.json(
                    { success: false, message: "You don't have permission to schedule blogs" },
                    { status: 403 }
                );
            }
        }

        const title = formData.get("title");
        const slug = formData.get("slug");
        const description = formData.get("description");
        const metaTitle = formData.get("metaTitle");
        const metaDescription = formData.get("metaDescription");
        const extra_metatag = formData.get("extra_metatag");
        const metaKeywords = formData.get("metaKeywords")
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
                faqs = blog.faqs || [];
            }
        } else {
            faqs = blog.faqs || [];
        }
        const categoriesJson = formData.get("categories");
        let categories = [];
        if (categoriesJson) {
            try {
                categories = JSON.parse(categoriesJson);
            } catch (e) {
                console.error("Error parsing categories:", e);
                categories = blog.categories || [];
            }
        } else {
            categories = blog.categories || [];
        }
        const tagsJson = formData.get("tags");
        let tags = [];
        if (tagsJson) {
            try {
                tags = JSON.parse(tagsJson);
            } catch (e) {
                console.error("Error parsing tags:", e);
                tags = blog.tags || [];
            }
        } else {
            tags = blog.tags || [];
        }
        const scheduledAt = formData.get("scheduledAt");
        const featuredImageAlt = formData.get("featuredImageAlt");
        const imageFile = formData.get("image");

        // Check if slug is being changed and if it already exists
        if (slug && slug !== blog.slug) {
            const existing = await BLOG.findOne({ slug, _id: { $ne: id } });
            if (existing) {
                return NextResponse.json(
                    { message: "Slug already exists. Please change the title.", success: false },
                    { status: 400 }
                );
            }
        }

        let imageUrl = blog.image;
        let publicId = blog.img_publicId;

        // If new image is uploaded, delete old one and upload new
        if (imageFile && imageFile.size > 0) {
            // Delete old image from Cloudinary if exists
            if (blog.img_publicId) {
                try {
                    await cloudinary.uploader.destroy(blog.img_publicId);
                    console.log("✅ Old Cloudinary image deleted:", blog.img_publicId);
                } catch (err) {
                    console.error("❌ Error deleting old image from Cloudinary:", err);
                }
            }

            // Upload new image
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

            imageUrl = uploadRes.secure_url;
            publicId = uploadRes.public_id;
        }

        // Prepare update data
        const updateData = {
            title: title || blog.title,
            slug: slug || blog.slug,
            description: description || blog.description,
            image: imageUrl,
            img_publicId: publicId,
            metaTitle: metaTitle !== null ? metaTitle : blog.metaTitle,
            metaDescription: metaDescription !== null ? metaDescription : blog.metaDescription,
            metaKeywords: metaKeywords || blog.metaKeywords,
            extra_metatag: extra_metatag !== null ? extra_metatag : blog.extra_metatag,
            faqs: faqs,
            categories: categories,
            tags: tags,
            status: status,
        };

        if (scheduledAt) {
            updateData.scheduledAt = new Date(scheduledAt);
            if (status === "published") {
                updateData.status = "scheduled";
            }
        } else if (scheduledAt === "") {
            updateData.scheduledAt = null;
        }

        if (featuredImageAlt !== null) {
            updateData.featuredImageAlt = featuredImageAlt || "";
        }

        // Update blog
        const updatedBlog = await BLOG.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        // Create audit log
        const action = status === "published" && blog.status !== "published" ? "publish" : 
                      status === "scheduled" ? "schedule" : "update";
        
        await createAuditLog({
            userId: authData.admin._id,
            action: action,
            resourceType: "blog",
            resourceId: updatedBlog._id,
            details: `${action === "publish" ? "Published" : action === "schedule" ? "Scheduled" : "Updated"} blog: ${updatedBlog.title}`,
            ipAddress: getClientIP(req),
            userAgent: getUserAgent(req),
        });

        return NextResponse.json(
            { message: "Blog updated successfully!", blog: updatedBlog, success: true },
            { status: 200 }
        );
    } catch (error) {
        console.error("Update blog error:", error);
        return NextResponse.json(
            { message: "Internal Server Error", error: error.message, success: false },
            { status: 500 }
        );
    }
}

export async function DELETE(req, { params }) {
    try {
        // Require permission to delete blogs
        const authData = await requirePermission(req, "canDeleteBlog");
        if (authData instanceof NextResponse) {
            return authData; // Return error response
        }

        await connectDB();

        const {id}= await params

        const blog = await BLOG.findById(id);
        if (!blog) {
            return Response.json({ success: false, message: "Prompt not found" }, { status: 404 });
        }

        if (blog.img_publicId) {
            try {
                await cloudinary.uploader.destroy(blog.img_publicId);
                console.log("✅ Cloudinary image deleted:", blog.img_publicId);
            } catch (err) {
                console.error("❌ Error deleting image from Cloudinary:", err);
            }
        }

        const res = await BLOG.findByIdAndDelete(id);

        // Create audit log
        await createAuditLog({
            userId: authData.admin._id,
            action: "delete",
            resourceType: "blog",
            resourceId: id,
            details: `Deleted blog: ${blog.title}`,
            ipAddress: getClientIP(req),
            userAgent: getUserAgent(req),
        });

        return NextResponse.json({ message: "Blog deleted successfully", success: true }, { status: 200 });
        
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 });
    }
}
