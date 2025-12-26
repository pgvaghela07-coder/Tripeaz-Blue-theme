import { NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import Media from "../../../models/media";
import cloudinary from "../../../lib/cloudinary";
import { createAuditLog, getClientIP, getUserAgent } from "../../../lib/auditLog.js";
import { requirePermission } from "../../../lib/auth.js";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST /api/media/upload - Upload media file
export async function POST(req) {
    try {
        // Require permission to manage media
        const authData = await requirePermission(req, "canManageMedia");
        if (authData instanceof NextResponse) {
            return authData; // Return error response
        }

        await connectDB();

        const formData = await req.formData();
        const file = formData.get("file");
        const altText = formData.get("altText") || "";
        const caption = formData.get("caption") || "";

        if (!file) {
            return NextResponse.json(
                { success: false, message: "File is required" },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, message: "Invalid file type. Only images are allowed." },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, message: "File size exceeds 10MB limit" },
                { status: 400 }
            );
        }

        // Upload to Cloudinary
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadRes = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: "gujrat_taxi/media",
                    transformation: [
                        { width: 150, height: 150, crop: "fill", quality: "auto", format: "auto" }, // thumbnail
                    ],
                },
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            ).end(buffer);
        });

        // Generate multiple sizes
        const basePublicId = uploadRes.public_id;
        const sizes = {
            thumbnail: cloudinary.url(basePublicId, {
                width: 150,
                height: 150,
                crop: "fill",
                quality: "auto",
                format: "auto",
            }),
            medium: cloudinary.url(basePublicId, {
                width: 500,
                height: 500,
                crop: "limit",
                quality: "auto",
                format: "auto",
            }),
            large: cloudinary.url(basePublicId, {
                width: 1200,
                height: 1200,
                crop: "limit",
                quality: "auto",
                format: "auto",
            }),
        };

        // Save to database
        const media = await Media.create({
            filePath: uploadRes.secure_url,
            publicId: uploadRes.public_id,
            mimeType: file.type,
            width: uploadRes.width,
            height: uploadRes.height,
            size: uploadRes.bytes,
            sizes,
            altText,
            caption,
            usageCount: 0,
        });

        console.log("Media saved to database:", media._id, media.filePath); // Debug log

        // Create audit log
        await createAuditLog({
            userId: authData.admin._id,
            action: "create",
            resourceType: "media",
            resourceId: media._id,
            details: `Uploaded media: ${file.name || 'media file'} (${(file.size / 1024).toFixed(2)} KB)`,
            ipAddress: getClientIP(req),
            userAgent: getUserAgent(req),
        });

        // Convert Mongoose document to plain object for proper serialization
        const mediaObject = media.toObject ? media.toObject() : media;

        return NextResponse.json(
            {
                success: true,
                message: "Media uploaded successfully",
                media: mediaObject,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error uploading media:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to upload media",
                error: error.message,
            },
            { status: 500 }
        );
    }
}




