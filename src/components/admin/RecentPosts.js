"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Clock, CheckCircle, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function RecentPosts({ limit = 5 }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentPosts();
    }, []);

    const fetchRecentPosts = async () => {
        try {
            const res = await fetch("/api/blogs", {
                cache: "no-store",
            });
            const data = await res.json();

            if (data.success !== false && data.blogs) {
                // Get most recent posts
                const recent = data.blogs
                    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
                    .slice(0, limit);
                setPosts(recent);
            }
        } catch (error) {
            console.error("Error fetching recent posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "published":
                return <CheckCircle size={14} className="text-green-600" />;
            case "scheduled":
                return <Calendar size={14} className="text-yellow-600" />;
            default:
                return <FileText size={14} className="text-gray-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "published":
                return "bg-green-100 text-green-800";
            case "scheduled":
                return "bg-yellow-100 text-yellow-800";
            case "archived":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (loading) {
        return (
            <div className="bg-white border rounded-lg p-4">
                <p className="text-gray-500 text-sm">Loading recent posts...</p>
            </div>
        );
    }

    return (
        <div className="bg-white border rounded-lg shadow">
            <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FileText size={18} />
                    Recent Posts
                </h3>
            </div>
            <div className="divide-y">
                {posts.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                        No posts found
                    </div>
                ) : (
                    posts.map((post) => (
                        <Link
                            key={post._id}
                            href={`/admin/blog/edit/${post._id}`}
                            className="block p-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 truncate mb-1">
                                        {post.title}
                                    </h4>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {formatDistanceToNow(new Date(post.updatedAt || post.createdAt), {
                                                addSuffix: true,
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
                                            post.status
                                        )}`}
                                    >
                                        {getStatusIcon(post.status)}
                                        {post.status || "draft"}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
            {posts.length > 0 && (
                <div className="p-4 border-t">
                    <Link
                        href="/admin/blog/manage"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        View all posts →
                    </Link>
                </div>
            )}
        </div>
    );
}









