import { NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import Category from "../../../models/category";
import { createAuditLog, getClientIP, getUserAgent } from "../../../lib/auditLog.js";
import { requirePermission } from "../../../lib/auth.js";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/categories/[id] - Get category by ID
export async function GET(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;
        const category = await Category.findById(id).populate('parentId', 'name slug');

        if (!category) {
            return NextResponse.json(
                { success: false, message: "Category not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, category },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            }
        );
    } catch (error) {
        console.error("Error fetching category:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch category", error: error.message },
            { status: 500 }
        );
    }
}

// PUT /api/categories/[id] - Update category
export async function PUT(req, { params }) {
    try {
        // Require permission to manage categories
        const authData = await requirePermission(req, "canManageCategories");
        if (authData instanceof NextResponse) {
            return authData; // Return error response
        }

        await connectDB();

        const { id } = await params;
        const body = await req.json();
        const { name, parentId, description, seoTitle, seoDescription, image } = body;

        const category = await Category.findById(id);
        if (!category) {
            return NextResponse.json(
                { success: false, message: "Category not found" },
                { status: 404 }
            );
        }

        // Generate slug if name changed
        let slug = category.slug;
        if (name && name !== category.name) {
            slug = name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");

            // Check if new slug exists
            const existing = await Category.findOne({ slug, _id: { $ne: id } });
            if (existing) {
                return NextResponse.json(
                    { success: false, message: "Category with this name already exists" },
                    { status: 400 }
                );
            }
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            {
                name: name || category.name,
                slug,
                parentId: parentId !== undefined ? parentId : category.parentId,
                description: description !== undefined ? description : category.description,
                seoTitle: seoTitle !== undefined ? seoTitle : category.seoTitle,
                seoDescription: seoDescription !== undefined ? seoDescription : category.seoDescription,
                image: image !== undefined ? image : category.image,
            },
            { new: true, runValidators: true }
        ).populate('parentId', 'name slug');

        // Create audit log
        await createAuditLog({
            userId: authData.admin._id,
            action: "update",
            resourceType: "category",
            resourceId: updatedCategory._id,
            details: `Updated category: ${updatedCategory.name}`,
            ipAddress: getClientIP(req),
            userAgent: getUserAgent(req),
        });

        return NextResponse.json(
            {
                success: true,
                message: "Category updated successfully",
                category: updatedCategory,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating category:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update category", error: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(req, { params }) {
    try {
        // Require permission to manage categories
        const authData = await requirePermission(req, "canManageCategories");
        if (authData instanceof NextResponse) {
            return authData; // Return error response
        }

        await connectDB();

        const { id } = await params;

        const category = await Category.findById(id);
        if (!category) {
            return NextResponse.json(
                { success: false, message: "Category not found" },
                { status: 404 }
            );
        }

        // Check if category has children
        const children = await Category.find({ parentId: id });
        if (children.length > 0) {
            return NextResponse.json(
                { success: false, message: "Cannot delete category with subcategories. Please delete subcategories first." },
                { status: 400 }
            );
        }

        await Category.findByIdAndDelete(id);

        // Create audit log
        await createAuditLog({
            userId: authData.admin._id,
            action: "delete",
            resourceType: "category",
            resourceId: category._id,
            details: `Deleted category: ${category.name}`,
            ipAddress: getClientIP(req),
            userAgent: getUserAgent(req),
        });

        return NextResponse.json(
            { success: true, message: "Category deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting category:", error);
        return NextResponse.json(
            { success: false, message: "Failed to delete category", error: error.message },
            { status: 500 }
        );
    }
}









