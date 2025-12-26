import { NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import AIRPORT from "../../../../models/airport";
import BLOG from "../../../../models/blog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Slug is required" },
        { status: 400 }
      );
    }

    const airport = await AIRPORT.findOne({ url: slug }).lean();

    if (!airport) {
      return NextResponse.json(
        { success: false, message: "Airport not found" },
        { status: 404 }
      );
    }

    // Fetch related blog if blogId exists
    let blog = null;
    if (airport.blogId) {
      try {
        blog = await BLOG.findOne({ 
          _id: airport.blogId, 
          status: "published" 
        })
        .populate('categories', 'name slug')
        .populate('tags', 'name slug')
        .lean();
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    }

    // Convert to plain object
    const airportData = {
      ...airport,
      _id: airport._id.toString(),
      blogId: airport.blogId ? airport.blogId.toString() : null,
      blog: blog ? {
        ...blog,
        _id: blog._id.toString(),
        categories: Array.isArray(blog.categories) ? blog.categories.map(cat => ({
          _id: cat._id ? cat._id.toString() : null,
          name: cat.name || '',
          slug: cat.slug || ''
        })) : [],
        tags: Array.isArray(blog.tags) ? blog.tags.map(tag => ({
          _id: tag._id ? tag._id.toString() : null,
          name: tag.name || '',
          slug: tag.slug || ''
        })) : [],
        createdAt: blog.createdAt ? (blog.createdAt instanceof Date ? blog.createdAt.toISOString() : new Date(blog.createdAt).toISOString()) : null,
        updatedAt: blog.updatedAt ? (blog.updatedAt instanceof Date ? blog.updatedAt.toISOString() : new Date(blog.updatedAt).toISOString()) : null,
      } : null,
    };

    return NextResponse.json(
      { success: true, airport: airportData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching airport by slug:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch airport", error: error.message },
      { status: 500 }
    );
  }
}







