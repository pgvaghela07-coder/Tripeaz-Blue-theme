"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Save, RefreshCw, Eye, FileCode } from "lucide-react";

export default function RobotsPage() {
    const [content, setContent] = useState("");
    const [originalContent, setOriginalContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastModified, setLastModified] = useState(null);

    useEffect(() => {
        fetchRobots();
    }, []);

    const fetchRobots = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/seo/robots", {
                cache: "no-store",
            });
            const data = await res.json();

            if (data.success) {
                setContent(data.content);
                setOriginalContent(data.content);
                setLastModified(data.lastModified ? new Date(data.lastModified) : null);
            } else {
                toast.error(data.message || "Failed to load robots.txt");
            }
        } catch (error) {
            console.error("Error fetching robots.txt:", error);
            toast.error("Failed to load robots.txt");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await fetch("/api/seo/robots", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content }),
            });

            const data = await res.json();

            if (data.success) {
                setOriginalContent(content);
                setLastModified(new Date());
                toast.success("Robots.txt updated successfully");
            } else {
                toast.error(data.message || "Failed to update robots.txt");
            }
        } catch (error) {
            console.error("Error saving robots.txt:", error);
            toast.error("Failed to save robots.txt");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (confirm("Are you sure you want to reset to the last saved version?")) {
            setContent(originalContent);
        }
    };

    const hasChanges = content !== originalContent;
    const robotsUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/robots.txt`
        : "/robots.txt";

    if (loading) {
        return (
            <div className="p-4 md:p-6">
                <p className="text-gray-600">Loading robots.txt...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FileCode size={24} />
                        Robots.txt Editor
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Edit your robots.txt file to control search engine crawlers
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleReset}
                        disabled={!hasChanges}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw size={18} />
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !hasChanges}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={18} />
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            {hasChanges && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                        You have unsaved changes. Don't forget to save!
                    </p>
                </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Eye className="text-blue-600 mt-0.5" size={20} />
                    <div className="flex-1">
                        <h3 className="font-semibold text-blue-900 mb-1">Robots.txt URL</h3>
                        <p className="text-sm text-blue-700 mb-2">
                            Your robots.txt file is available at:
                        </p>
                        <code className="block bg-white border border-blue-200 rounded px-3 py-2 text-sm text-blue-900 break-all">
                            {robotsUrl}
                        </code>
                        {lastModified && (
                            <p className="text-xs text-blue-600 mt-2">
                                Last modified: {lastModified.toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white border rounded-lg shadow">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Edit Robots.txt</h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Common directives: User-agent, Allow, Disallow, Crawl-delay, Sitemap
                    </p>
                </div>
                <div className="p-4">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-96 font-mono text-sm border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="User-agent: *&#10;Allow: /&#10;Disallow: /admin&#10;&#10;Sitemap: https://gujarat.taxi/sitemap.xml"
                    />
                    <div className="mt-4 text-xs text-gray-500">
                        <p className="font-semibold mb-1">Tips:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Use "User-agent: *" to apply rules to all crawlers</li>
                            <li>Use "Allow:" and "Disallow:" to control access</li>
                            <li>Include your sitemap URL with "Sitemap:" directive</li>
                            <li>Each directive should be on a new line</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-white border rounded-lg shadow">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Preview</h2>
                </div>
                <div className="p-4">
                    <pre className="bg-gray-50 p-4 rounded border overflow-x-auto text-xs font-mono whitespace-pre-wrap">
                        {content || "(empty)"}
                    </pre>
                </div>
            </div>
        </div>
    );
}

















