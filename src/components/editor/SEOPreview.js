"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function SEOPreview({ 
    title = "", 
    description = "", 
    slug = "",
    canonicalUrl = "",
    metaTitle = "",
    metaDescription = "",
    metaKeywords = ""
}) {
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        // Generate preview URL
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const url = canonicalUrl || (slug ? `${baseUrl}/blogs/${slug}` : '');
        setPreviewUrl(url);
    }, [slug, canonicalUrl]);

    const displayTitle = metaTitle || title || "Your Blog Title";
    const displayDescription = metaDescription || description?.replace(/<[^>]+>/g, "") || "Your blog description will appear here...";
    
    const titleLength = displayTitle.length;
    const descriptionLength = displayDescription.length;
    
    const titleStatus = titleLength >= 30 && titleLength <= 60;
    const descriptionStatus = descriptionLength >= 120 && descriptionLength <= 160;

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-sm text-gray-900 mb-3">SEO Preview</h3>
                
                {/* Google Search Result Preview */}
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="text-xs text-gray-500 mb-1 truncate">
                        {previewUrl || "https://example.com/blogs/your-slug"}
                    </div>
                    <div className="text-lg text-blue-600 hover:underline cursor-pointer mb-1 line-clamp-1">
                        {displayTitle}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                        {displayDescription}
                    </div>
                </div>

                {/* Title Analysis */}
                <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-700">Title Length</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${
                                titleStatus ? 'text-green-600' : 'text-blue-600'
                            }`}>
                                {titleLength} / 60
                            </span>
                            {titleStatus ? (
                                <CheckCircle size={14} className="text-green-600" />
                            ) : titleLength < 30 ? (
                                <AlertCircle size={14} className="text-blue-600" />
                            ) : (
                                <XCircle size={14} className="text-red-600" />
                            )}
                        </div>
                    </div>
                    {!titleStatus && (
                        <p className="text-xs text-gray-500">
                            {titleLength < 30 
                                ? "Title is too short (recommended: 30-60 characters)"
                                : "Title is too long (recommended: 30-60 characters)"
                            }
                        </p>
                    )}
                </div>

                {/* Description Analysis */}
                <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-700">Description Length</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${
                                descriptionStatus ? 'text-green-600' : 'text-blue-600'
                            }`}>
                                {descriptionLength} / 160
                            </span>
                            {descriptionStatus ? (
                                <CheckCircle size={14} className="text-green-600" />
                            ) : descriptionLength < 120 ? (
                                <AlertCircle size={14} className="text-blue-600" />
                            ) : (
                                <XCircle size={14} className="text-red-600" />
                            )}
                        </div>
                    </div>
                    {!descriptionStatus && (
                        <p className="text-xs text-gray-500">
                            {descriptionLength < 120 
                                ? "Description is too short (recommended: 120-160 characters)"
                                : "Description is too long (recommended: 120-160 characters)"
                            }
                        </p>
                    )}
                </div>

                {/* URL Preview */}
                <div className="mt-3">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">URL Preview</label>
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200 break-all">
                        {previewUrl || "https://example.com/blogs/your-slug"}
                    </div>
                </div>

                {/* Keywords */}
                {metaKeywords && (
                    <div className="mt-3">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Keywords</label>
                        <div className="flex flex-wrap gap-1">
                            {metaKeywords.split(',').map((keyword, index) => (
                                <span
                                    key={index}
                                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                >
                                    {keyword.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

















