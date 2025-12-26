import { NextResponse } from "next/server";
import connectDB from "../../lib/db";
import Category from "../../models/category";
import { createAuditLog, getClientIP, getUserAgent } from "../../lib/auditLog.js";
import { requirePermission } from "../../lib/auth.js";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/categories - Get all categories
export async function GET() {
    try {
        await connectDB();

        const categories = await Category.find()
            .populate('parentId', 'name slug')
            .sort({ createdAt: -1 });

        return NextResponse.json(
            {
                success: true,
                categories,
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            }
        );
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch categories",
                error: error.message,
            },
            { status: 500 }
        );
    }
}

// POST /api/categories - Create new category
export async function POST(req) {
    try {
        // Require permission to manage categories
        const authData = await requirePermission(req, "canManageCategories");
        if (authData instanceof NextResponse) {
            return authData; // Return error response
        }

        await connectDB();

        const body = await req.json();
        const { name, parentId, description, seoTitle, seoDescription, image } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, message: "Category name is required" },
                { status: 400 }
            );
        }

        // Generate slug from name
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        // Check if slug already exists
        const existing = await Category.findOne({ slug });
        if (existing) {
            return NextResponse.json(
                { success: false, message: "Category with this name already exists" },
                { status: 400 }
            );
        }

        const category = await Category.create({
            name,
            slug,
            parentId: parentId || null,
            description: description || "",
            seoTitle: seoTitle || "",
            seoDescription: seoDescription || "",
            image: image || "",
        });

        // Create audit log
        await createAuditLog({
            userId: authData.admin._id,
            action: "create",
            resourceType: "category",
            resourceId: category._id,
            details: `Created category: ${category.name}`,
            ipAddress: getClientIP(req),
            userAgent: getUserAgent(req),
        });

        return NextResponse.json(
            {
                success: true,
                message: "Category created successfully",
                category,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating category:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to create category",
                error: error.message,
            },
            { status: 500 }
        );
    }
}









