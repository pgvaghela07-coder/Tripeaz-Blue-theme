"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Search, AlertTriangle, Link2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function CanonicalPage() {
    const [duplicates, setDuplicates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [blogId, setBlogId] = useState("");

    const handleScan = async () => {
        try {
            setLoading(true);
            const url = blogId 
                ? `/api/seo/canonical?blogId=${blogId}`
                : "/api/seo/canonical";
            
            const res = await fetch(url, {
                cache: "no-store",
            });
            const data = await res.json();

            if (data.success) {
                setDuplicates(data.duplicates || []);
                if (data.duplicates.length === 0) {
                    toast.success("No duplicate content found!");
                } else {
                    toast.warning(`Found ${data.duplicates.length} blog(s) with potential duplicate content`);
                }
            } else {
                toast.error(data.message || "Failed to scan for duplicates");
            }
        } catch (error) {
            console.error("Error scanning for duplicates:", error);
            toast.error("Failed to scan for duplicates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Auto-scan on mount
        handleScan();
    }, []);

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Link2 size={24} />
                        Canonical URLs & Duplicate Detection
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Find and manage duplicate content across your blog posts
                    </p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={blogId}
                        onChange={(e) => setBlogId(e.target.value)}
                        placeholder="Blog ID (optional)"
                        className="border rounded-md p-2 text-sm bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        onClick={handleScan}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
                    >
                        <Search size={18} />
                        {loading ? "Scanning..." : "Scan for Duplicates"}
                    </button>
                </div>
            </div>

            {duplicates.length === 0 && !loading ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="flex justify-center mb-2">
                        <div className="bg-green-100 rounded-full p-3">
                            <Search className="text-green-600" size={24} />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-green-900 mb-1">No Duplicates Found</h3>
                    <p className="text-sm text-green-700">
                        Great! Your content appears to be unique across all blog posts.
                    </p>
                </div>
            ) : duplicates.length > 0 ? (
                <div className="space-y-4">
                    {duplicates.map((duplicate) => (
                        <div key={duplicate.blogId} className="bg-white border border-yellow-200 rounded-lg shadow">
                            <div className="p-4 border-b bg-yellow-50">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {duplicate.title}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span>Slug: {duplicate.slug}</span>
                                            {duplicate.canonicalUrl && (
                                                <span className="text-blue-600">
                                                    Canonical: {duplicate.canonicalUrl}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Link
                                        href={`/admin/blog/edit/${duplicate.blogId}`}
                                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                    >
                                        Edit
                                        <ExternalLink size={14} />
                                    </Link>
                                </div>
                            </div>
                            <div className="p-4">
                                <h4 className="font-semibold text-sm text-gray-700 mb-3">
                                    Similar Content Found ({duplicate.similar.length}):
                                </h4>
                                <div className="space-y-3">
                                    {duplicate.similar.map((similar, index) => (
                                        <div
                                            key={index}
                                            className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h5 className="font-medium text-gray-900">
                                                        {similar.title}
                                                    </h5>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {similar.slug}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-medium">
                                                        {similar.similarityScore}% similar
                                                    </span>
                                                    <Link
                                                        href={`/admin/blog/edit/${similar.blogId}`}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="Edit"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                {similar.reasons.map((reason, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded mr-2 mb-1"
                                                    >
                                                        {reason}
                                                    </span>
                                                ))}
                                            </div>
                                            {similar.canonicalUrl && (
                                                <p className="text-xs text-blue-600 mt-2">
                                                    Canonical: {similar.canonicalUrl}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                                    <p className="text-xs text-blue-800">
                                        <strong>Recommendation:</strong> Consider setting a canonical URL for these posts
                                        to indicate which version is the primary one. This helps search engines understand
                                        which content to index.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}










