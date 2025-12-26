"use client"

import Header_Components from "@/components/common_components/Header_components"
import Footer_Components from "@/components/common_components/Footer_components"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

export default function BlogPage() {
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
                // Filter only published blogs that are NOT linked to routes/cities/airports
                const publishedBlogs = data.blogs.filter(blog => 
                    blog.status === "published" && !blog.isLinked
                );
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
            <Header_Components />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
                        <span className="text-white font-bold text-2xl">B</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 bg-clip-text text-transparent mb-4">Our Blog</h1>
                    <p className="text-lg text-gray-600">Discover travel tips, guides, and stories about Gujarat</p>
                </div>

                {loading ? (
                    <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
                        <p className="text-gray-600 font-medium text-lg">Loading blogs...</p>
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="text-center py-16 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-2 border-blue-100">
                        <p className="text-gray-600 font-medium text-lg">No blogs available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blogs.map((blog) => (
                            <Link
                                key={blog._id}
                                href={`/blog/${blog.slug}`}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group border-2 border-transparent hover:border-blue-200"
                            >
                                <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                                    {blog.image ? (
                                        <img
                                            src={blog.image}
                                            alt={blog.title}
                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                            No Image
                                        </div>
                                    )}
                                </div>

                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {blog.title}
                                    </h2>
                                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                        {blog.description?.replace(/<[^>]+>/g, "").substring(0, 150)}...
                                    </p>
                                    <div className="flex items-center text-blue-600 text-sm font-semibold">
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

