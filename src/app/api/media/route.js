import { NextResponse } from "next/server";
import connectDB from "../../lib/db";
import Media from "../../models/media";
import { createAuditLog, getClientIP, getUserAgent } from "../../lib/auditLog.js";
import { requirePermission } from "../../lib/auth.js";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/media - Get all media
export async function GET(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        const query = {};
        if (search) {
            query.$or = [
                { altText: { $regex: search, $options: 'i' } },
                { caption: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;

        // Try to populate uploadedBy, but don't fail if it doesn't work
        let media;
        try {
            media = await Media.find(query)
                .populate('uploadedBy', 'userName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();
        } catch (populateError) {
            // If populate fails (e.g., Admin model doesn't exist), fetch without populate
            console.warn("Populate failed, fetching without populate:", populateError.message);
            media = await Media.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();
        }

        const total = await Media.countDocuments(query);
        
        console.log(`Media query - Total: ${total}, Found: ${media.length}, Page: ${page}, Limit: ${limit}, Search: ${search}`); // Debug log

        // Ensure proper serialization of media objects
        const serializedMedia = media.map(item => {
            try {
                const serialized = {
                    ...item,
                    _id: item._id?.toString() || item._id,
                };
                
                // Ensure sizes object is preserved
                if (item.sizes) {
                    serialized.sizes = {
                        thumbnail: item.sizes.thumbnail || item.filePath,
                        medium: item.sizes.medium || item.filePath,
                        large: item.sizes.large || item.filePath,
                    };
                } else {
                    // If sizes don't exist, use filePath for all sizes
                    serialized.sizes = {
                        thumbnail: item.filePath,
                        medium: item.filePath,
                        large: item.filePath,
                    };
                }
                
                // Ensure filePath is always present
                if (!serialized.filePath && item.filePath) {
                    serialized.filePath = item.filePath;
                }
                
                // Handle dates safely
                if (item.createdAt) {
                    serialized.createdAt = item.createdAt instanceof Date 
                        ? item.createdAt.toISOString() 
                        : (typeof item.createdAt === 'string' ? item.createdAt : new Date(item.createdAt).toISOString());
                }
                
                if (item.updatedAt) {
                    serialized.updatedAt = item.updatedAt instanceof Date 
                        ? item.updatedAt.toISOString() 
                        : (typeof item.updatedAt === 'string' ? item.updatedAt : new Date(item.updatedAt).toISOString());
                }
                
                // Handle uploadedBy if it exists
                if (item.uploadedBy) {
                    if (typeof item.uploadedBy === 'object' && item.uploadedBy !== null) {
                        serialized.uploadedBy = {
                            ...item.uploadedBy,
                            _id: item.uploadedBy._id?.toString() || item.uploadedBy._id
                        };
                    } else {
                        serialized.uploadedBy = item.uploadedBy;
                    }
                }
                
                return serialized;
            } catch (serializeError) {
                console.error("Error serializing media item:", serializeError, item);
                // Return a basic version if serialization fails
                return {
                    _id: item._id?.toString() || item._id,
                    filePath: item.filePath || '',
                    sizes: {
                        thumbnail: item.filePath || '',
                        medium: item.filePath || '',
                        large: item.filePath || '',
                    },
                    altText: item.altText || '',
                    caption: item.caption || '',
                };
            }
        });

        return NextResponse.json(
            {
                success: true,
                media: serializedMedia,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            }
        );
    } catch (error) {
        console.error("Error fetching media:", error);
        console.error("Error stack:", error.stack);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch media",
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            },
            { status: 500 }
        );
    }
}

// DELETE /api/media - Delete media (bulk)
export async function DELETE(req) {
    try {
        // Require permission to manage media
        const authData = await requirePermission(req, "canManageMedia");
        if (authData instanceof NextResponse) {
            return authData; // Return error response
        }

        await connectDB();

        const body = await req.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { success: false, message: "Media IDs are required" },
                { status: 400 }
            );
        }

        // Get media to delete (for Cloudinary cleanup)
        const mediaToDelete = await Media.find({ _id: { $in: ids } });

        // Delete from database
        await Media.deleteMany({ _id: { $in: ids } });

        // TODO: Delete from Cloudinary using publicId
        // This would require cloudinary import and delete calls

        // Create audit log
        await createAuditLog({
            userId: authData.admin._id,
            action: "delete",
            resourceType: "media",
            resourceId: ids[0] || null, // Log first ID as reference
            details: `Bulk deleted ${ids.length} media file(s)`,
            ipAddress: getClientIP(req),
            userAgent: getUserAgent(req),
        });

        return NextResponse.json(
            {
                success: true,
                message: `Deleted ${ids.length} media file(s)`,
                deleted: ids.length,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting media:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete media",
                error: error.message,
            },
            { status: 500 }
        );
    }
}




