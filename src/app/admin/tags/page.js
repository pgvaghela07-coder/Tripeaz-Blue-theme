"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus, Edit2, Trash2, X, Save } from "lucide-react";

export default function TagsPage() {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        seoTitle: "",
        seoDescription: "",
    });

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const res = await fetch("/api/tags", {
                cache: "no-store",
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            });
            const data = await res.json();

            if (data.success) {
                setTags(data.tags || []);
            }
        } catch (error) {
            console.error("Error fetching tags:", error);
            toast.error("Failed to load tags");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Tag name is required");
            return;
        }

        try {
            const url = editingId ? `/api/tags/${editingId}` : "/api/tags";
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await res.json();

            if (result.success) {
                toast.success(result.message);
                setShowAddForm(false);
                setEditingId(null);
                setFormData({
                    name: "",
                    description: "",
                    seoTitle: "",
                    seoDescription: "",
                });
                fetchTags();
            } else {
                toast.error(result.message || "Failed to save tag");
            }
        } catch (error) {
            console.error("Error saving tag:", error);
            toast.error("Something went wrong");
        }
    };

    const handleEdit = (tag) => {
        setEditingId(tag._id);
        setFormData({
            name: tag.name,
            description: tag.description || "",
            seoTitle: tag.seoTitle || "",
            seoDescription: tag.seoDescription || "",
        });
        setShowAddForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this tag?")) return;

        try {
            const res = await fetch(`/api/tags/${id}`, {
                method: "DELETE",
            });

            const result = await res.json();

            if (result.success) {
                toast.success(result.message);
                fetchTags();
            } else {
                toast.error(result.message || "Failed to delete tag");
            }
        } catch (error) {
            console.error("Error deleting tag:", error);
            toast.error("Something went wrong");
        }
    };

    if (loading) {
        return (
            <div className="p-4 md:p-6">
                <p className="text-gray-600">Loading tags...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Tags</h1>
                <button
                    onClick={() => {
                        setShowAddForm(true);
                        setEditingId(null);
                        setFormData({
                            name: "",
                            description: "",
                            seoTitle: "",
                            seoDescription: "",
                        });
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Tag
                </button>
            </div>

            {showAddForm && (
                <div className="bg-white border rounded-lg p-6 mb-6 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            {editingId ? "Edit Tag" : "Add New Tag"}
                        </h2>
                        <button
                            onClick={() => {
                                setShowAddForm(false);
                                setEditingId(null);
                                setFormData({
                                    name: "",
                                    description: "",
                                    seoTitle: "",
                                    seoDescription: "",
                                });
                            }}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block font-semibold mb-2">Tag Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border rounded-md p-2 bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-semibold mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="3"
                                className="w-full border rounded-md p-2 bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-semibold mb-2">SEO Title</label>
                                <input
                                    type="text"
                                    value={formData.seoTitle}
                                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                                    maxLength={60}
                                    className="w-full border rounded-md p-2 bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-2">SEO Description</label>
                                <textarea
                                    value={formData.seoDescription}
                                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                                    maxLength={160}
                                    rows="3"
                                    className="w-full border rounded-md p-2 bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
                            >
                                <Save size={18} />
                                {editingId ? "Update Tag" : "Create Tag"}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingId(null);
                                }}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {tags.length === 0 ? (
                <p className="text-gray-500">No tags found. Create your first tag!</p>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left border-b">Name</th>
                                <th className="px-4 py-3 text-left border-b">Slug</th>
                                <th className="px-4 py-3 text-left border-b">Description</th>
                                <th className="px-4 py-3 text-center border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tags.map((tag) => (
                                <tr key={tag._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 border-b font-medium text-gray-900">
                                        {tag.name}
                                    </td>
                                    <td className="px-4 py-3 border-b text-gray-600">
                                        /{tag.slug}
                                    </td>
                                    <td className="px-4 py-3 border-b text-gray-600">
                                        {tag.description || "-"}
                                    </td>
                                    <td className="px-4 py-3 border-b text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => handleEdit(tag)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tag._id)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
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

















