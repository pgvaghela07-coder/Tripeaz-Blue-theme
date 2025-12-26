"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, ExternalLink, Link2 } from "lucide-react";
// Simple debounce implementation
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export default function InternalLinkModal({ isOpen, onClose, onInsert }) {
    const [query, setQuery] = useState("");
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const searchBlogs = async (searchQuery) => {
        if (!searchQuery || searchQuery.length < 2) {
            setBlogs([]);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/blogs/search?q=${encodeURIComponent(searchQuery)}&limit=10`, {
                cache: "no-store",
            });
            const data = await res.json();

            if (data.success) {
                setBlogs(data.blogs || []);
            }
        } catch (error) {
            console.error("Error searching blogs:", error);
        } finally {
            setLoading(false);
        }
    };

    const debouncedSearch = useRef(
        debounce((q) => {
            searchBlogs(q);
        }, 300)
    );

    useEffect(() => {
        if (query) {
            debouncedSearch.current(query);
        } else {
            setBlogs([]);
        }
    }, [query]);

    const handleInsert = () => {
        if (selectedBlog) {
            const linkText = selectedBlog.title;
            const linkUrl = `/blogs/${selectedBlog.slug}`;
            const linkHtml = `<a href="${linkUrl}" title="${linkText}">${linkText}</a>`;
            onInsert(linkHtml);
            onClose();
            setQuery("");
            setSelectedBlog(null);
            setBlogs([]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Link2 size={20} />
                        Insert Internal Link
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search for a blog post to link to..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    </div>

                    {loading && (
                        <div className="text-center py-8 text-gray-500">
                            Searching...
                        </div>
                    )}

                    {!loading && query.length >= 2 && blogs.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No posts found matching "{query}"
                        </div>
                    )}

                    {!loading && blogs.length > 0 && (
                        <div className="space-y-2">
                            {blogs.map((blog) => (
                                <div
                                    key={blog._id}
                                    onClick={() => setSelectedBlog(blog)}
                                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                        selectedBlog?._id === blog._id
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {blog.image && (
                                            <img
                                                src={blog.image}
                                                alt={blog.title}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 mb-1 truncate">
                                                {blog.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                /blogs/{blog.slug}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`text-xs px-2 py-1 rounded ${
                                                        blog.status === "published"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                                >
                                                    {blog.status}
                                                </span>
                                                <a
                                                    href={`/blogs/${blog.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                >
                                                    Preview
                                                    <ExternalLink size={12} />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!query && (
                        <div className="text-center py-8 text-gray-500">
                            Start typing to search for blog posts...
                        </div>
                    )}
                </div>

                <div className="p-6 border-t flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleInsert}
                        disabled={!selectedBlog}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Insert Link
                    </button>
                </div>
            </div>
        </div>
    );
}

