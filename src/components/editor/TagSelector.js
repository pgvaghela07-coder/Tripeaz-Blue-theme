"use client";

import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";

export default function TagSelector({ selectedTags = [], onChange }) {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [newTagName, setNewTagName] = useState("");

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const res = await fetch("/api/tags", {
                cache: "no-store",
            });
            const data = await res.json();
            if (data.success) {
                setTags(data.tags || []);
            }
        } catch (error) {
            console.error("Error fetching tags:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTagToggle = (tagId) => {
        const isSelected = selectedTags.includes(tagId);
        if (isSelected) {
            onChange(selectedTags.filter((id) => id !== tagId));
        } else {
            onChange([...selectedTags, tagId]);
        }
    };

    const handleAddNewTag = async () => {
        if (!newTagName.trim()) return;

        // Check if tag already exists
        const existingTag = tags.find(
            (t) => t.name.toLowerCase() === newTagName.trim().toLowerCase()
        );
        if (existingTag) {
            if (!selectedTags.includes(existingTag._id)) {
                onChange([...selectedTags, existingTag._id]);
            }
            setNewTagName("");
            setShowAddForm(false);
            return;
        }

        try {
            const res = await fetch("/api/tags", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newTagName.trim(),
                }),
            });

            const result = await res.json();
            if (result.success) {
                setTags([...tags, result.tag]);
                onChange([...selectedTags, result.tag._id]);
                setNewTagName("");
                setShowAddForm(false);
            }
        } catch (error) {
            console.error("Error creating tag:", error);
        }
    };

    const filteredTags = tags.filter((tag) =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="text-sm text-gray-500">Loading tags...</div>;
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="block font-semibold text-sm text-gray-900">Tags</label>
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
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            placeholder="Tag name"
                            className="flex-1 border rounded-md p-2 text-sm bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddNewTag();
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={handleAddNewTag}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm"
                        >
                            Add
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowAddForm(false);
                                setNewTagName("");
                            }}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            <div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search tags..."
                    className="w-full border rounded-md p-2 text-sm bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white">
                {filteredTags.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        {searchTerm ? "No tags found" : "No tags available"}
                    </p>
                ) : (
                    <div className="space-y-1">
                        {filteredTags.map((tag) => {
                            const isSelected = selectedTags.includes(tag._id);
                            return (
                                <label
                                    key={tag._id}
                                    className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleTagToggle(tag._id)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-900">{tag.name}</span>
                                </label>
                            );
                        })}
                    </div>
                )}
            </div>

            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTags.map((tagId) => {
                        const tag = tags.find((t) => t._id === tagId);
                        return tag ? (
                            <span
                                key={tagId}
                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"
                            >
                                {tag.name}
                                <button
                                    type="button"
                                    onClick={() => handleTagToggle(tagId)}
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

















