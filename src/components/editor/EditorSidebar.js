"use client";

import { useState } from "react";
import { Calendar, Image as ImageIcon, Eye, Save, MapPin, Building2, Plane, Plus, Edit2, X } from "lucide-react";
import SEOPreview from "./SEOPreview";
import CategorySelector from "./CategorySelector";
import TagSelector from "./TagSelector";

export default function EditorSidebar({
    data,
    setData,
    image,
    preview,
    existingImage,
    onImageChange,
    onSubmit,
    loading,
    isEdit = false,
    availableRoutes = [],
    availableCities = [],
    availableAirports = [],
    selectedRoutes = [],
    selectedCities = [],
    selectedAirports = [],
    onRouteChange = () => {},
    onCityChange = () => {},
    onAirportChange = () => {},
    showCreateRoute = false,
    setShowCreateRoute = () => {},
    newRoute = {},
    setNewRoute = () => {},
    fetchRoutes = () => {},
    editingRouteId = null,
    setEditingRouteId = () => {},
    editingRoute = null,
    setEditingRoute = () => {},
}) {
    const [activeTab, setActiveTab] = useState("publish");

    const tabs = [
        { id: "publish", label: "Publish", icon: Save },
        { id: "seo", label: "SEO", icon: Eye },
        { id: "categories", label: "Categories", icon: null },
    ];

    return (
        <div className="w-full md:w-80 lg:w-96 bg-white border-l border-gray-200 flex flex-col h-full">
            {/* Tabs */}
            <div className="border-b border-gray-200 flex">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                                activeTab === tab.id
                                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                        >
                            {Icon && <Icon size={16} className="inline mr-1" />}
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {/* Publish Tab */}
                {activeTab === "publish" && (
                    <div className="space-y-4">
                        <div>
                            <label className="block font-semibold text-sm text-gray-900 mb-2">
                                Status
                            </label>
                            <select
                                value={data.status}
                                onChange={(e) => setData({ ...data, status: e.target.value })}
                                className="w-full border rounded-md p-2 text-sm bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="scheduled">Scheduled</option>
                                {isEdit && <option value="archived">Archived</option>}
                            </select>
                        </div>

                        {data.status === "scheduled" && (
                            <div>
                                <label className="block font-semibold text-sm text-gray-900 mb-2 flex items-center gap-2">
                                    <Calendar size={16} />
                                    Schedule Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    value={data.scheduledAt}
                                    onChange={(e) => setData({ ...data, scheduledAt: e.target.value })}
                                    className="w-full border rounded-md p-2 text-sm bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block font-semibold text-sm text-gray-900 mb-2 flex items-center gap-2">
                                <ImageIcon size={16} />
                                Featured Image
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onImageChange}
                                className="w-full border rounded-md p-2 text-sm bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            {(preview || existingImage) && (
                                <div className="mt-2">
                                    <img
                                        src={preview || existingImage}
                                        alt="preview"
                                        className="w-full h-40 object-cover rounded-lg"
                                    />
                                    <div className="mt-2">
                                        <label className="block font-semibold text-xs text-gray-900 mb-1">
                                            Image Alt Text
                                        </label>
                                        <input
                                            type="text"
                                            value={data.featuredImageAlt}
                                            onChange={(e) => setData({ ...data, featuredImageAlt: e.target.value })}
                                            placeholder="Describe the image for SEO"
                                            className="w-full border rounded-md p-2 text-xs bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block font-semibold text-sm text-gray-900 mb-2">
                                Canonical URL
                            </label>
                            <input
                                type="url"
                                value={data.canonicalUrl}
                                onChange={(e) => setData({ ...data, canonicalUrl: e.target.value })}
                                placeholder="https://example.com/canonical-url"
                                className="w-full border rounded-md p-2 text-sm bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Leave empty to use default URL
                            </p>
                        </div>

                        <button
                            onClick={onSubmit}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Saving..." : isEdit ? "Update Blog" : "Publish Blog"}
                        </button>
                    </div>
                )}

                {/* SEO Tab */}
                {activeTab === "seo" && (
                    <div>
                        <SEOPreview
                            title={data.title}
                            description={data.description}
                            slug={data.slug}
                            canonicalUrl={data.canonicalUrl}
                            metaTitle={data.metaTitle}
                            metaDescription={data.metaDescription}
                            metaKeywords={data.metaKeywords}
                        />
                    </div>
                )}

                {/* Categories Tab */}
                {activeTab === "categories" && (
                    <div className="space-y-4">
                        <CategorySelector
                            selectedCategories={data.categories}
                            onChange={(categories) => setData({ ...data, categories })}
                        />
                        <div className="border-t pt-4">
                            <TagSelector
                                selectedTags={data.tags}
                                onChange={(tags) => setData({ ...data, tags })}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}




