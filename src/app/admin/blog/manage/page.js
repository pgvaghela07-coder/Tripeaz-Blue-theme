"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import Link from "next/link";
import { Pencil, Trash2, Clock, CheckCircle, FileText, Archive } from "lucide-react";

export default function AllBlogsPage() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState({});
    const [permissionsLoading, setPermissionsLoading] = useState(true);

    // Fetch user permissions
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const res = await fetch("/api/admin/me", { cache: "no-store" });
                const data = await res.json();
                if (data.success) {
                    // Check both possible locations for permissions
                    const userPermissions = data.permissions || (data.user && data.user.permissions) || {};
                    setPermissions(userPermissions);
                }
            } catch (error) {
                console.error("Error fetching permissions:", error);
            } finally {
                setPermissionsLoading(false);
            }
        };
        fetchPermissions();
    }, []);

    // Helper function to check permissions
    const hasPermission = (permission) => {
        if (!permissions || Object.keys(permissions).length === 0) {
            return false;
        }
        // Super admin has all permissions
        if (permissions.isSuperAdmin === true) {
            return true;
        }
        // Check specific permission
        return permissions[permission] === true;
    };

    const fetchBlogs = async () => {
        try {
            const res = await fetch("/api/blogs", {
                cache: "no-store",
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            });
            const data = await res.json();

            if (data.success !== false && data.blogs) {
                setBlogs(data.blogs);
            } else {
                setBlogs([]);
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
            toast.error("Something went wrong");
            setBlogs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this blog?")) return;

        try {
            const res = await fetch(`/api/blogs/${id}`, {
                method: "DELETE",
            });

            const result = await res.json();

            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }

            fetchBlogs()

        } catch (error) {
            console.error("Delete Error:", error);
            toast.error("Something went wrong");
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    return (
        <div className="p-2 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 md:mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">All Blogs</h1>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            try {
                                const res = await fetch("/api/blogs/schedule", { method: "POST" });
                                const result = await res.json();
                                if (result.success) {
                                    toast.success(result.message || `Published ${result.published} scheduled post(s)`);
                                    fetchBlogs();
                                } else {
                                    toast.error(result.message || "Failed to process scheduled posts");
                                }
                            } catch (error) {
                                console.error("Error processing scheduled posts:", error);
                                toast.error("Failed to process scheduled posts");
                            }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm md:text-base flex items-center gap-2"
                        title="Check and publish scheduled posts"
                    >
                        <Clock size={16} />
                        Check Scheduled
                    </button>
                    <Link
                        href="/admin/blog/add"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm md:text-base"
                    >
                        + Add New Blog
                    </Link>
                </div>
            </div>

            {loading ? (
                <p className="text-gray-600">Loading blogs...</p>
            ) : blogs.length === 0 ? (
                <p className="text-gray-500">No blogs found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 bg-white rounded-lg shadow text-xs md:text-sm">
                        <thead className="bg-gray-100">
                            <tr className="text-left text-gray-700 font-semibold">
                                <th className="px-2 md:px-4 py-2 md:py-3 border-b">Image</th>
                                <th className="px-2 md:px-4 py-2 md:py-3 border-b">Title</th>
                                <th className="px-2 md:px-4 py-2 md:py-3 border-b hidden md:table-cell">Description</th>
                                <th className="px-2 md:px-4 py-2 md:py-3 border-b">Status</th>
                                <th className="px-2 md:px-4 py-2 md:py-3 border-b">URI/Slug</th>
                                <th className="px-2 md:px-4 py-2 md:py-3 border-b text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {blogs.map((blog) => (
                                <tr key={blog._id} className="border-b hover:bg-gray-50">
                                    <td className="px-2 md:px-4 py-2 md:py-3">
                                        <div className="w-16 h-12 md:w-24 md:h-20 rounded-md overflow-hidden bg-gray-100">
                                            {blog.image ? (
                                                <img
                                                    src={blog.image}
                                                    alt={blog.title}
                                                    width={64}
                                                    height={64}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-2 md:px-4 py-2 md:py-3 font-medium text-gray-800">
                                        <div className="max-w-[150px] md:max-w-none">
                                            <p className="truncate md:whitespace-normal text-xs md:text-sm">{blog.title}</p>
                                        </div>
                                    </td>

                                    <td className="px-2 md:px-4 py-2 md:py-3 text-gray-600 max-w-xs hidden md:table-cell">
                                        <p className="line-clamp-2 text-sm">
                                            {blog.description?.replace(/<[^>]+>/g, "")}
                                        </p>
                                    </td>

                                    <td className="px-2 md:px-4 py-2 md:py-3">
                                        <div className="flex flex-col gap-1">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                blog.status === "published" 
                                                    ? "bg-green-100 text-green-800" 
                                                    : blog.status === "scheduled"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : blog.status === "archived"
                                                    ? "bg-gray-100 text-gray-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}>
                                                {blog.status === "published" && <CheckCircle size={12} />}
                                                {blog.status === "scheduled" && <Clock size={12} />}
                                                {blog.status === "archived" && <Archive size={12} />}
                                                {blog.status === "draft" && <FileText size={12} />}
                                                {blog.status || "draft"}
                                            </span>
                                            {blog.status === "scheduled" && blog.scheduledAt && (
                                                <span className="text-xs text-gray-500">
                                                    {new Date(blog.scheduledAt).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-2 md:px-4 py-2 md:py-3">
                                        <Link
                                            href={blog.blogUrl || `/blog/${blog.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 hover:underline text-xs font-medium break-all"
                                            title="Open blog in new tab"
                                        >
                                            {blog.slug}
                                        </Link>
                                    </td>

                                    <td className="px-2 md:px-4 py-2 md:py-3 text-center">
                                        {permissionsLoading ? (
                                            <span className="text-gray-400 text-xs">Loading...</span>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2 md:gap-3">
                                                {hasPermission("canEditBlog") && (
                                                    <Link
                                                        href={`/admin/blog/edit/${blog._id}`}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} className="md:w-[18px] md:h-[18px]" />
                                                    </Link>
                                                )}

                                                {hasPermission("canDeleteBlog") && (
                                                    <button
                                                        onClick={() => handleDelete(blog._id)}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
                                                    </button>
                                                )}
                                                
                                                {!hasPermission("canEditBlog") && !hasPermission("canDeleteBlog") && (
                                                    <span className="text-gray-400 text-xs">No actions available</span>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
