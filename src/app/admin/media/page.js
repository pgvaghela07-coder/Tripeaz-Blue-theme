"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { Upload, Search, Edit2, Trash2, X, Save, Image as ImageIcon } from "lucide-react";

export default function MediaPage() {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showUpload, setShowUpload] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadAltText, setUploadAltText] = useState("");
    const [uploadCaption, setUploadCaption] = useState("");
    const [uploading, setUploading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editAltText, setEditAltText] = useState("");
    const [editCaption, setEditCaption] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchMedia = useCallback(async (currentPage = page, currentSearch = searchTerm) => {
        try {
            setLoading(true);
            const res = await fetch(
                `/api/media?page=${currentPage}&limit=20&search=${encodeURIComponent(currentSearch)}`,
                { 
                    cache: "no-store",
                    headers: {
                        'Cache-Control': 'no-store, no-cache, must-revalidate',
                    }
                }
            );
            const data = await res.json();
            console.log("Media API Response:", data); // Debug log

            if (data.success) {
                console.log("Media items received:", data.media?.length || 0); // Debug log
                // Log first item to debug image URLs
                if (data.media && data.media.length > 0) {
                    console.log("First media item:", {
                        _id: data.media[0]._id,
                        filePath: data.media[0].filePath,
                        sizes: data.media[0].sizes,
                        thumbnail: data.media[0].sizes?.thumbnail,
                    });
                }
                setMedia(data.media || []);
                setTotalPages(data.pagination?.pages || 1);
            } else {
                console.error("Failed to fetch media:", data.message);
                setMedia([]);
            }
        } catch (error) {
            console.error("Error fetching media:", error);
            toast.error("Failed to load media");
            setMedia([]);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm]);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia, refreshKey]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile) {
            toast.error("Please select a file");
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("file", uploadFile);
            formData.append("altText", uploadAltText);
            formData.append("caption", uploadCaption);

            const res = await fetch("/api/media/upload", {
                method: "POST",
                body: formData,
            });

            const result = await res.json();
            console.log("Upload API Response:", result); // Debug log

            if (result.success) {
                toast.success("Media uploaded successfully");
                console.log("Uploaded media:", result.media); // Debug log
                setShowUpload(false);
                setUploadFile(null);
                setUploadAltText("");
                setUploadCaption("");
                // Reset to first page and clear search
                setPage(1);
                setSearchTerm("");
                // Force refresh by updating refreshKey and fetch with explicit values
                setRefreshKey(prev => prev + 1);
                // Small delay to ensure database write is complete, then fetch with page 1 and empty search
                setTimeout(() => {
                    fetchMedia(1, "");
                }, 200);
            } else {
                toast.error(result.message || "Failed to upload media");
            }
        } catch (error) {
            console.error("Error uploading media:", error);
            toast.error("Failed to upload media");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this media?")) return;

        try {
            const res = await fetch(`/api/media/${id}`, {
                method: "DELETE",
            });

            const result = await res.json();

            if (result.success) {
                toast.success(result.message);
                fetchMedia();
            } else {
                toast.error(result.message || "Failed to delete media");
            }
        } catch (error) {
            console.error("Error deleting media:", error);
            toast.error("Failed to delete media");
        }
    };

    const handleEdit = (mediaItem) => {
        setEditingId(mediaItem._id);
        setEditAltText(mediaItem.altText || "");
        setEditCaption(mediaItem.caption || "");
    };

    const handleSaveEdit = async () => {
        if (!editingId) {
            toast.error("No media selected for editing");
            return;
        }

        try {
            const res = await fetch(`/api/media/${editingId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    altText: editAltText,
                    caption: editCaption,
                }),
            });

            const result = await res.json();
            console.log("Edit API Response:", result); // Debug log

            if (result.success) {
                toast.success("Media updated successfully");
                setEditingId(null);
                setEditAltText("");
                setEditCaption("");
                // Force refresh
                setRefreshKey(prev => prev + 1);
                setTimeout(() => {
                    fetchMedia();
                }, 100);
            } else {
                toast.error(result.message || "Failed to update media");
            }
        } catch (error) {
            console.error("Error updating media:", error);
            toast.error("Failed to update media");
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Media Library</h1>
                    <p className="text-sm text-gray-600 mt-1">Manage your media files</p>
                </div>
                <button
                    onClick={() => setShowUpload(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                >
                    <Upload size={18} />
                    Upload Media
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(1);
                    }}
                    placeholder="Search by alt text or caption..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            {/* Upload Modal */}
            {showUpload && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Upload Media</h2>
                            <button
                                onClick={() => {
                                    setShowUpload(false);
                                    setUploadFile(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block font-semibold mb-2">File *</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setUploadFile(e.target.files[0])}
                                    className="w-full border rounded-md p-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-2">Alt Text</label>
                                <input
                                    type="text"
                                    value={uploadAltText}
                                    onChange={(e) => setUploadAltText(e.target.value)}
                                    placeholder="Describe the image for SEO"
                                    className="w-full border rounded-md p-2"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-2">Caption</label>
                                <textarea
                                    value={uploadCaption}
                                    onChange={(e) => setUploadCaption(e.target.value)}
                                    rows="3"
                                    className="w-full border rounded-md p-2"
                                    placeholder="Optional caption"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                                >
                                    {uploading ? "Uploading..." : "Upload"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUpload(false);
                                        setUploadFile(null);
                                    }}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Media Grid */}
            {loading ? (
                <p className="text-gray-600">Loading media...</p>
            ) : media.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <ImageIcon className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500">No media found</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {media.map((item) => (
                            <div
                                key={item._id}
                                className="bg-white border rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
                            >
                                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                    {(() => {
                                        const imageUrl = item.sizes?.thumbnail || item.filePath || '';
                                        console.log(`Rendering image for ${item._id}:`, { imageUrl, hasSizes: !!item.sizes, filePath: item.filePath });
                                        return (
                                            <>
                                                <img
                                                    src={imageUrl}
                                                    alt={item.altText || "Media"}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        console.error(`Image load error for ${item._id}:`, e.target.src);
                                                        // Fallback to filePath if thumbnail fails
                                                        if (e.target.src !== item.filePath && item.filePath) {
                                                            console.log(`Trying fallback to filePath:`, item.filePath);
                                                            e.target.src = item.filePath;
                                                        } else {
                                                            // If both fail, show placeholder
                                                            console.log(`Both image URLs failed, showing placeholder`);
                                                            e.target.style.display = 'none';
                                                            const placeholder = document.getElementById(`placeholder-${item._id}`);
                                                            if (placeholder) {
                                                                placeholder.classList.remove('hidden');
                                                                placeholder.classList.add('flex');
                                                            }
                                                        }
                                                    }}
                                                    onLoad={() => {
                                                        console.log(`Image loaded successfully for ${item._id}`);
                                                    }}
                                                />
                                                <div className="absolute inset-0 hidden items-center justify-center bg-gray-200" id={`placeholder-${item._id}`}>
                                                    <ImageIcon className="text-gray-400" size={48} />
                                                </div>
                                            </>
                                        );
                                    })()}
                                    {editingId === item._id ? (
                                        <div className="absolute inset-0 bg-black bg-opacity-75 p-2 flex flex-col">
                                            <input
                                                type="text"
                                                value={editAltText}
                                                onChange={(e) => setEditAltText(e.target.value)}
                                                placeholder="Alt text"
                                                className="mb-2 p-1 text-xs rounded"
                                            />
                                            <textarea
                                                value={editCaption}
                                                onChange={(e) => setEditCaption(e.target.value)}
                                                placeholder="Caption"
                                                rows="2"
                                                className="mb-2 p-1 text-xs rounded resize-none"
                                            />
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={handleSaveEdit}
                                                    className="flex-1 bg-green-600 text-white text-xs py-1 rounded"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="flex-1 bg-gray-600 text-white text-xs py-1 rounded"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="text-white p-2 bg-blue-600 rounded"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="text-white p-2 bg-red-600 rounded"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="p-2">
                                    <p className="text-xs text-gray-600 truncate" title={item.altText}>
                                        {item.altText || "No alt text"}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {item.usageCount || 0} uses
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 border rounded-lg disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-600">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 border rounded-lg disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}




