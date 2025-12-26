"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { RefreshCw, Download, Eye, CheckCircle } from "lucide-react";

export default function SitemapPage() {
    const [sitemap, setSitemap] = useState("");
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);
    const [lastGenerated, setLastGenerated] = useState(null);

    useEffect(() => {
        fetchSitemap();
    }, []);

    const fetchSitemap = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/seo/sitemap", {
                cache: "no-store",
            });
            const data = await res.json();

            if (data.success) {
                setSitemap(data.sitemap);
                setLastGenerated(new Date());
            } else {
                toast.error(data.message || "Failed to load sitemap");
            }
        } catch (error) {
            console.error("Error fetching sitemap:", error);
            toast.error("Failed to load sitemap");
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async () => {
        try {
            setRegenerating(true);
            const res = await fetch("/api/seo/sitemap", {
                method: "POST",
                cache: "no-store",
            });
            const data = await res.json();

            if (data.success) {
                setSitemap(data.sitemap);
                setLastGenerated(new Date());
                toast.success("Sitemap regenerated successfully");
            } else {
                toast.error(data.message || "Failed to regenerate sitemap");
            }
        } catch (error) {
            console.error("Error regenerating sitemap:", error);
            toast.error("Failed to regenerate sitemap");
        } finally {
            setRegenerating(false);
        }
    };

    const handleDownload = () => {
        const blob = new Blob([sitemap], { type: "application/xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sitemap.xml";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const sitemapUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/sitemap.xml`
        : "/sitemap.xml";

    if (loading) {
        return (
            <div className="p-4 md:p-6">
                <p className="text-gray-600">Loading sitemap...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Sitemap Management</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Your sitemap is automatically generated from published blog posts
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleRegenerate}
                        disabled={regenerating}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={regenerating ? "animate-spin" : ""} />
                        {regenerating ? "Regenerating..." : "Regenerate"}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                    >
                        <Download size={18} />
                        Download
                    </button>
                </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <CheckCircle className="text-green-600 mt-0.5" size={20} />
                    <div className="flex-1">
                        <h3 className="font-semibold text-green-900 mb-1">Sitemap URL</h3>
                        <p className="text-sm text-green-700 mb-2">
                            Your sitemap is available at:
                        </p>
                        <code className="block bg-white border border-green-200 rounded px-3 py-2 text-sm text-green-900 break-all">
                            {sitemapUrl}
                        </code>
                        <p className="text-xs text-green-600 mt-2">
                            Add this URL to your robots.txt file and submit it to Google Search Console
                        </p>
                        {lastGenerated && (
                            <p className="text-xs text-green-600 mt-1">
                                Last generated: {lastGenerated.toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white border rounded-lg shadow">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Eye size={18} />
                        Sitemap Preview
                    </h2>
                    <span className="text-xs text-gray-500">
                        {sitemap.split("<url>").length - 1} URLs
                    </span>
                </div>
                <div className="p-4">
                    <pre className="bg-gray-50 p-4 rounded border overflow-x-auto text-xs">
                        <code>{sitemap}</code>
                    </pre>
                </div>
            </div>
        </div>
    );
}

















