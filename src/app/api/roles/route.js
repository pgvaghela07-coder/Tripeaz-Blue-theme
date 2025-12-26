import { NextResponse } from "next/server";
import connectDB from "../../lib/db";
import Role from "../../models/role";
import { initializeDefaultRoles } from "../../../lib/permissions";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/roles - Get all roles
export async function GET() {
    try {
        await connectDB();

        // Initialize default roles if they don't exist
        await initializeDefaultRoles();

        const roles = await Role.find().sort({ createdAt: -1 });

        return NextResponse.json(
            {
                success: true,
                roles,
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            }
        );
    } catch (error) {
        console.error("Error fetching roles:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch roles",
                error: error.message,
            },
            { status: 500 }
        );
    }
}

// POST /api/roles - Create new role
export async function POST(req) {
    try {
        await connectDB();

        const body = await req.json();
        const { name, description, permissions } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, message: "Role name is required" },
                { status: 400 }
            );
        }

        // Generate slug from name
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        // Check if role already exists
        const existing = await Role.findOne({ slug });
        if (existing) {
            return NextResponse.json(
                { success: false, message: "Role with this name already exists" },
                { status: 400 }
            );
        }

        const role = await Role.create({
            name,
            slug,
            description: description || "",
            permissions: permissions || {},
        });

        return NextResponse.json(
            {
                success: true,
                message: "Role created successfully",
                role,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating role:", error);
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, message: "Role with this name already exists" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            {
                success: false,
                message: "Failed to create role",
                error: error.message,
            },
            { status: 500 }
        );
    }
}









