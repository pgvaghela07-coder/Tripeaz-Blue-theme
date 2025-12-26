"use client";

import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";

export default function CategorySelector({ selectedCategories = [], onChange }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories", {
                cache: "no-store",
            });
            const data = await res.json();
            if (data.success) {
                setCategories(data.categories || []);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryToggle = (categoryId) => {
        const isSelected = selectedCategories.includes(categoryId);
        if (isSelected) {
            onChange(selectedCategories.filter((id) => id !== categoryId));
        } else {
            onChange([...selectedCategories, categoryId]);
        }
    };

    const handleAddNewCategory = async () => {
        if (!newCategoryName.trim()) return;

        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newCategoryName.trim(),
                }),
            });

            const result = await res.json();
            if (result.success) {
                setCategories([...categories, result.category]);
                onChange([...selectedCategories, result.category._id]);
                setNewCategoryName("");
                setShowAddForm(false);
            }
        } catch (error) {
            console.error("Error creating category:", error);
        }
    };

    const buildCategoryTree = (categories, parentId = null) => {
        return categories
            .filter((cat) => {
                if (parentId === null) {
                    return !cat.parentId;
                }
                return cat.parentId?._id?.toString() === parentId.toString();
            })
            .map((cat) => ({
                ...cat,
                children: buildCategoryTree(categories, cat._id),
            }));
    };

    const renderCategoryCheckbox = (category, level = 0) => {
        const isSelected = selectedCategories.includes(category._id);
        return (
            <div key={category._id} className="mb-2">
                <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCategoryToggle(category._id)}
                        className="mr-2"
                    />
                    <span className="text-sm text-gray-900">
                        {level > 0 && "└─ "}
                        {category.name}
                    </span>
                </label>
                {category.children &&
                    category.children.length > 0 &&
                    category.children.map((child) => renderCategoryCheckbox(child, level + 1))}
            </div>
        );
    };

    if (loading) {
        return <div className="text-sm text-gray-500">Loading categories...</div>;
    }

    const categoryTree = buildCategoryTree(categories);

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="block font-semibold text-sm text-gray-900">Categories</label>
                <button
                    type="button"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                    <Plus size={14} />
                    New
                </button>
            </div>

            {showAddForm && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Category name"
                            className="flex-1 border rounded-md p-2 text-sm bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddNewCategory();
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={handleAddNewCategory}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm"
                        >
                            Add
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowAddForm(false);
                                setNewCategoryName("");
                            }}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white">
                {categoryTree.length === 0 ? (
                    <p className="text-sm text-gray-500">No categories available</p>
                ) : (
                    categoryTree.map((category) => renderCategoryCheckbox(category))
                )}
            </div>

            {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCategories.map((catId) => {
                        const cat = categories.find((c) => c._id === catId);
                        return cat ? (
                            <span
                                key={catId}
                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"
                            >
                                {cat.name}
                                <button
                                    type="button"
                                    onClick={() => handleCategoryToggle(catId)}
                                    className="hover:text-blue-900"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ) : null;
                    })}
                </div>
            )}
        </div>
    );
}

















