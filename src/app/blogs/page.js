"use client"

import Header_Components from "@/components/common_components/Header_components"
import Footer_Components from "@/components/common_components/Footer_components"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

export default function BlogsPage() {
    const [blogs, setBlogs] = useState([])
    const [loading, setLoading] = useState(true)

    const getBlogs = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/blogs", {
                cache: "no-store"
            });

            const data = await res.json();
            if (data.blogs) {
                // Filter only published blogs
                const publishedBlogs = data.blogs.filter(blog => blog.status === "published");
                setBlogs(publishedBlogs);
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getBlogs();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header_Components />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Blog</h1>
                    <p className="text-lg text-gray-600">Discover travel tips, guides, and stories about Gujarat</p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">Loading blogs...</p>
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No blogs available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map((blog) => (
                            <Link
                                key={blog._id}
                                href={`/blog/${blog.slug}`}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
                            >
                                <div className="relative pl-6 w-full overflow-hidden">
                                    {blog.image ? (
                                        <img
                                            src={blog.image}
                                            alt={blog.title}
                                            width={64}
                                            height={64}
                                            className="object-contain size-44 "
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                            No Image
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 pt-3">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                        {blog.title}
                                    </h2>
                                    <p className="text-gray-600 text-sm line-clamp-3">
                                        {blog.description?.replace(/<[^>]+>/g, "").substring(0, 150)}...
                                    </p>
                                    <div className="mt-4 flex items-center text-blue-600 text-sm font-semibold">
                                        Read More →
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <Footer_Components />
        </div>
    )
}