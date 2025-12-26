"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus, Edit2, Trash2, X, Save } from "lucide-react";
import Link from "next/link";

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        parentId: "",
        description: "",
        seoTitle: "",
        seoDescription: "",
        image: "",
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories", {
                cache: "no-store",
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            });
            const data = await res.json();

            if (data.success) {
                setCategories(data.categories || []);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Category name is required");
            return;
        }

        try {
            const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
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
                    parentId: "",
                    description: "",
                    seoTitle: "",
                    seoDescription: "",
                    image: "",
                });
                fetchCategories();
            } else {
                toast.error(result.message || "Failed to save category");
            }
        } catch (error) {
            console.error("Error saving category:", error);
            toast.error("Something went wrong");
        }
    };

    const handleEdit = (category) => {
        setEditingId(category._id);
        setFormData({
            name: category.name,
            parentId: category.parentId?._id || "",
            description: category.description || "",
            seoTitle: category.seoTitle || "",
            seoDescription: category.seoDescription || "",
            image: category.image || "",
        });
        setShowAddForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this category?")) return;

        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: "DELETE",
            });

            const result = await res.json();

            if (result.success) {
                toast.success(result.message);
                fetchCategories();
            } else {
                toast.error(result.message || "Failed to delete category");
            }
        } catch (error) {
            console.error("Error deleting category:", error);
            toast.error("Something went wrong");
        }
    };

    const buildCategoryTree = (categories, parentId = null) => {
        return categories
            .filter(cat => {
                if (parentId === null) {
                    return !cat.parentId;
                }
                return cat.parentId?._id?.toString() === parentId.toString();
            })
            .map(cat => ({
                ...cat,
                children: buildCategoryTree(categories, cat._id),
            }));
    };

    const renderCategoryTree = (tree, level = 0) => {
        return tree.map((category) => (
            <div key={category._id} className="mb-2">
                <div
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                        level > 0 ? "ml-6 bg-gray-50" : "bg-white"
                    }`}
                >
                    <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                            {level > 0 && "└─ "}
                            {category.name}
                        </div>
                        {category.description && (
                            <div className="text-sm text-gray-600 mt-1">
                                {category.description}
                            </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                            Slug: /{category.slug}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleEdit(category)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                        >
                            <Edit2 size={18} />
                        </button>
                        <button
                            onClick={() => handleDelete(category._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
                {category.children && category.children.length > 0 && (
                    <div className="mt-2">
                        {renderCategoryTree(category.children, level + 1)}
                    </div>
                )}
            </div>
        ));
    };

    if (loading) {
        return (
            <div className="p-4 md:p-6">
                <p className="text-gray-600">Loading categories...</p>
            </div>
        );
    }

    const categoryTree = buildCategoryTree(categories);

    return (
        <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
                <button
                    onClick={() => {
                        setShowAddForm(true);
                        setEditingId(null);
                        setFormData({
                            name: "",
                            parentId: "",
                            description: "",
                            seoTitle: "",
                            seoDescription: "",
                            image: "",
                        });
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Category
                </button>
            </div>

            {showAddForm && (
                <div className="bg-white border rounded-lg p-6 mb-6 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            {editingId ? "Edit Category" : "Add New Category"}
                        </h2>
                        <button
                            onClick={() => {
                                setShowAddForm(false);
                                setEditingId(null);
                                setFormData({
                                    name: "",
                                    parentId: "",
                                    description: "",
                                    seoTitle: "",
                                    seoDescription: "",
                                    image: "",
                                });
                            }}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block font-semibold mb-2">Category Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border rounded-md p-2 bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-semibold mb-2">Parent Category</label>
                            <select
                                value={formData.parentId}
                                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                className="w-full border rounded-md p-2 bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="">None (Top Level)</option>
                                {categories
                                    .filter(cat => !editingId || cat._id !== editingId)
                                    .map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                            </select>
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
                                {editingId ? "Update Category" : "Create Category"}
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

            {categories.length === 0 ? (
                <p className="text-gray-500">No categories found. Create your first category!</p>
            ) : (
                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold text-gray-800">All Categories</h2>
                    </div>
                    <div className="p-4">
                        {renderCategoryTree(categoryTree)}
                    </div>
                </div>
            )}
        </div>
    );
}








