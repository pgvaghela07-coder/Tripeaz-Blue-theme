import { NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import Role from "../../../models/role";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/roles/[id] - Get role by ID
export async function GET(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;
        const role = await Role.findById(id);

        if (!role) {
            return NextResponse.json(
                { success: false, message: "Role not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, role },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            }
        );
    } catch (error) {
        console.error("Error fetching role:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch role", error: error.message },
            { status: 500 }
        );
    }
}

// PUT /api/roles/[id] - Update role
export async function PUT(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;
        const body = await req.json();
        const { name, description, permissions } = body;

        const role = await Role.findById(id);
        if (!role) {
            return NextResponse.json(
                { success: false, message: "Role not found" },
                { status: 404 }
            );
        }

        // Prevent modifying super-admin role
        if (role.slug === "super-admin") {
            return NextResponse.json(
                { success: false, message: "Cannot modify super-admin role" },
                { status: 400 }
            );
        }

        let slug = role.slug;
        if (name && name !== role.name) {
            slug = name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");

            // Check if new slug exists
            const existing = await Role.findOne({ slug, _id: { $ne: id } });
            if (existing) {
                return NextResponse.json(
                    { success: false, message: "Role with this name already exists" },
                    { status: 400 }
                );
            }
        }

        const updatedRole = await Role.findByIdAndUpdate(
            id,
            {
                name: name || role.name,
                slug,
                description: description !== undefined ? description : role.description,
                permissions: permissions || role.permissions,
            },
            { new: true, runValidators: true }
        );

        return NextResponse.json(
            {
                success: true,
                message: "Role updated successfully",
                role: updatedRole,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating role:", error);
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, message: "Role with this name already exists" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, message: "Failed to update role", error: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/roles/[id] - Delete role
export async function DELETE(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;

        const role = await Role.findById(id);
        if (!role) {
            return NextResponse.json(
                { success: false, message: "Role not found" },
                { status: 404 }
            );
        }

        // Prevent deleting super-admin and admin roles
        if (role.slug === "super-admin" || role.slug === "admin") {
            return NextResponse.json(
                { success: false, message: "Cannot delete system roles" },
                { status: 400 }
            );
        }

        await Role.findByIdAndDelete(id);

        return NextResponse.json(
            { success: true, message: "Role deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting role:", error);
        return NextResponse.json(
            { success: false, message: "Failed to delete role", error: error.message },
            { status: 500 }
        );
    }
}









