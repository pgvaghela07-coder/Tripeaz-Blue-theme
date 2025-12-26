import { NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import CITY from "../../../../models/city";
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

    const city = await CITY.findOne({ url: slug }).lean();

    if (!city) {
      return NextResponse.json(
        { success: false, message: "City not found" },
        { status: 404 }
      );
    }

    // Fetch related blog if blogId exists
    let blog = null;
    if (city.blogId) {
      try {
        blog = await BLOG.findOne({ 
          _id: city.blogId, 
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
    const cityData = {
      ...city,
      _id: city._id.toString(),
      blogId: city.blogId ? city.blogId.toString() : null,
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
      { success: true, city: cityData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching city by slug:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch city", error: error.message },
      { status: 500 }
    );
  }
}







