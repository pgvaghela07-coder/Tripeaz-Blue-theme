"use client";

import { useState, useEffect } from "react";
import { Clock, User, RotateCcw, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";

export default function RevisionViewer({ blogId, currentContent, onRestore }) {
    const [revisions, setRevisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRevision, setSelectedRevision] = useState(null);
    const [showDiff, setShowDiff] = useState(false);

    useEffect(() => {
        if (blogId) {
            fetchRevisions();
        }
    }, [blogId]);

    const fetchRevisions = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/blogs/${blogId}/revisions`, {
                cache: "no-store",
            });
            const data = await res.json();

            if (data.success) {
                setRevisions(data.revisions || []);
            }
        } catch (error) {
            console.error("Error fetching revisions:", error);
            toast.error("Failed to load revisions");
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (revisionId) => {
        if (!confirm("Are you sure you want to restore this revision? Current content will be replaced.")) {
            return;
        }

        try {
            const res = await fetch(`/api/blogs/${blogId}/revisions/${revisionId}`, {
                method: "POST",
            });

            const result = await res.json();

            if (result.success) {
                toast.success("Revision restored successfully");
                if (onRestore) {
                    onRestore(result.blog);
                }
                fetchRevisions();
            } else {
                toast.error(result.message || "Failed to restore revision");
            }
        } catch (error) {
            console.error("Error restoring revision:", error);
            toast.error("Failed to restore revision");
        }
    };

    const getDiff = (oldText, newText) => {
        // Simple diff implementation - highlight differences
        const oldWords = oldText.split(/\s+/);
        const newWords = newText.split(/\s+/);
        const diff = [];
        let i = 0;
        let j = 0;

        while (i < oldWords.length || j < newWords.length) {
            if (i < oldWords.length && j < newWords.length && oldWords[i] === newWords[j]) {
                diff.push({ type: "same", text: oldWords[i] });
                i++;
                j++;
            } else if (j < newWords.length && (i >= oldWords.length || oldWords[i] !== newWords[j])) {
                diff.push({ type: "added", text: newWords[j] });
                j++;
            } else {
                diff.push({ type: "removed", text: oldWords[i] });
                i++;
            }
        }

        return diff;
    };

    if (loading) {
        return (
            <div className="bg-white border rounded-lg p-4">
                <p className="text-gray-500 text-sm">Loading revisions...</p>
            </div>
        );
    }

    if (revisions.length === 0) {
        return (
            <div className="bg-white border rounded-lg p-4">
                <p className="text-gray-500 text-sm">No revisions found</p>
            </div>
        );
    }

    return (
        <div className="bg-white border rounded-lg shadow">
            <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Revision History</h3>
                <p className="text-xs text-gray-500 mt-1">Last 10 revisions are saved</p>
            </div>

            <div className="divide-y max-h-96 overflow-y-auto">
                {revisions.map((revision, index) => {
                    const isSelected = selectedRevision?._id === revision._id;
                    const revisionDate = new Date(revision.createdAt);

                    return (
                        <div
                            key={revision._id}
                            className={`p-4 hover:bg-gray-50 transition-colors ${
                                isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-semibold text-gray-900">
                                            Revision {revisions.length - index}
                                        </span>
                                        {index === 0 && (
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                Latest
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {formatDistanceToNow(revisionDate, { addSuffix: true })}
                                        </span>
                                        {revision.editorId && (
                                            <span className="flex items-center gap-1">
                                                <User size={12} />
                                                {typeof revision.editorId === 'object'
                                                    ? revision.editorId.userName
                                                    : 'Unknown'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-sm text-gray-700 mb-2">
                                        <strong>Title:</strong> {revision.title}
                                    </div>

                                    {isSelected && showDiff && currentContent && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded border">
                                            <h4 className="text-xs font-semibold mb-2">Content Diff:</h4>
                                            <div className="text-xs space-y-1 max-h-40 overflow-y-auto">
                                                {getDiff(
                                                    currentContent.replace(/<[^>]+>/g, ""),
                                                    revision.contentHtml.replace(/<[^>]+>/g, "")
                                                ).map((item, idx) => (
                                                    <span
                                                        key={idx}
                                                        className={
                                                            item.type === "added"
                                                                ? "bg-green-200"
                                                                : item.type === "removed"
                                                                ? "bg-red-200 line-through"
                                                                : ""
                                                        }
                                                    >
                                                        {item.text}{" "}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            if (isSelected && showDiff) {
                                                setShowDiff(false);
                                                setSelectedRevision(null);
                                            } else {
                                                setSelectedRevision(revision);
                                                setShowDiff(true);
                                            }
                                        }}
                                        className="text-blue-600 hover:text-blue-800 p-2"
                                        title="View diff"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleRestore(revision._id)}
                                        className="text-blue-600 hover:text-blue-800 p-2"
                                        title="Restore this revision"
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}









