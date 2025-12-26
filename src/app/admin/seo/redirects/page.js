"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Plus, Edit2, Trash2, X, Save, Upload, Download, CheckCircle, XCircle } from "lucide-react";

export default function RedirectsPage() {
    const [redirects, setRedirects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        fromPath: "",
        toPath: "",
        type: 301,
        active: true,
        notes: "",
    });

    useEffect(() => {
        fetchRedirects();
    }, []);

    const fetchRedirects = async () => {
        try {
            const res = await fetch("/api/redirects", {
                cache: "no-store",
            });
            const data = await res.json();

            if (data.success) {
                setRedirects(data.redirects || []);
            }
        } catch (error) {
            console.error("Error fetching redirects:", error);
            toast.error("Failed to load redirects");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fromPath || !formData.toPath) {
            toast.error("From path and To path are required");
            return;
        }

        try {
            const url = editingId ? `/api/redirects/${editingId}` : "/api/redirects";
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
                    fromPath: "",
                    toPath: "",
                    type: 301,
                    active: true,
                    notes: "",
                });
                fetchRedirects();
            } else {
                toast.error(result.message || "Failed to save redirect");
            }
        } catch (error) {
            console.error("Error saving redirect:", error);
            toast.error("Something went wrong");
        }
    };

    const handleEdit = (redirect) => {
        setEditingId(redirect._id);
        setFormData({
            fromPath: redirect.fromPath,
            toPath: redirect.toPath,
            type: redirect.type,
            active: redirect.active,
            notes: redirect.notes || "",
        });
        setShowAddForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this redirect?")) return;

        try {
            const res = await fetch(`/api/redirects/${id}`, {
                method: "DELETE",
            });

            const result = await res.json();

            if (result.success) {
                toast.success(result.message);
                fetchRedirects();
            } else {
                toast.error(result.message || "Failed to delete redirect");
            }
        } catch (error) {
            console.error("Error deleting redirect:", error);
            toast.error("Something went wrong");
        }
    };

    const handleToggleActive = async (id, currentActive) => {
        try {
            const res = await fetch(`/api/redirects/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ active: !currentActive }),
            });

            const result = await res.json();

            if (result.success) {
                toast.success("Redirect status updated");
                fetchRedirects();
            } else {
                toast.error(result.message || "Failed to update redirect");
            }
        } catch (error) {
            console.error("Error updating redirect:", error);
            toast.error("Something went wrong");
        }
    };

    const handleExport = () => {
        const csv = [
            ["From Path", "To Path", "Type", "Active", "Notes"],
            ...redirects.map(r => [
                r.fromPath,
                r.toPath,
                r.type,
                r.active ? "Yes" : "No",
                r.notes || ""
            ])
        ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "redirects.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target.result;
                const lines = text.split("\n").filter(line => line.trim());
                const headers = lines[0].split(",").map(h => h.replace(/"/g, "").trim());

                const importedRedirects = [];
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(",").map(v => v.replace(/"/g, "").trim());
                    if (values.length >= 2) {
                        importedRedirects.push({
                            fromPath: values[0],
                            toPath: values[1],
                            type: parseInt(values[2]) || 301,
                            active: values[3]?.toLowerCase() === "yes" || values[3]?.toLowerCase() === "true",
                            notes: values[4] || "",
                        });
                    }
                }

                // Import redirects one by one
                let successCount = 0;
                let errorCount = 0;

                for (const redirect of importedRedirects) {
                    try {
                        const res = await fetch("/api/redirects", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(redirect),
                        });

                        const result = await res.json();
                        if (result.success) {
                            successCount++;
                        } else {
                            errorCount++;
                        }
                    } catch (error) {
                        errorCount++;
                    }
                }

                toast.success(`Imported ${successCount} redirects${errorCount > 0 ? `, ${errorCount} failed` : ""}`);
                fetchRedirects();
            } catch (error) {
                console.error("Error importing redirects:", error);
                toast.error("Failed to import redirects");
            }
        };
        reader.readAsText(file);
    };

    if (loading) {
        return (
            <div className="p-4 md:p-6">
                <p className="text-gray-600">Loading redirects...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Redirect Manager</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage URL redirects (301 Permanent, 302 Temporary)
                    </p>
                </div>
                <div className="flex gap-2">
                    <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 cursor-pointer">
                        <Upload size={18} />
                        Import CSV
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleImport}
                            className="hidden"
                        />
                    </label>
                    <button
                        onClick={handleExport}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                    >
                        <Download size={18} />
                        Export CSV
                    </button>
                    <button
                        onClick={() => {
                            setShowAddForm(true);
                            setEditingId(null);
                            setFormData({
                                fromPath: "",
                                toPath: "",
                                type: 301,
                                active: true,
                                notes: "",
                            });
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Redirect
                    </button>
                </div>
            </div>

            {showAddForm && (
                <div className="bg-white border rounded-lg p-6 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            {editingId ? "Edit Redirect" : "Add New Redirect"}
                        </h2>
                        <button
                            onClick={() => {
                                setShowAddForm(false);
                                setEditingId(null);
                            }}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-semibold mb-2">From Path *</label>
                                <input
                                    type="text"
                                    value={formData.fromPath}
                                    onChange={(e) => setFormData({ ...formData, fromPath: e.target.value })}
                                    placeholder="/old-url"
                                    className="w-full border rounded-md p-2 bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-2">To Path *</label>
                                <input
                                    type="text"
                                    value={formData.toPath}
                                    onChange={(e) => setFormData({ ...formData, toPath: e.target.value })}
                                    placeholder="/new-url or https://example.com"
                                    className="w-full border rounded-md p-2 bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-semibold mb-2">Redirect Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: parseInt(e.target.value) })}
                                    className="w-full border rounded-md p-2 bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value={301}>301 - Permanent Redirect</option>
                                    <option value={302}>302 - Temporary Redirect</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold mb-2">Status</label>
                                <select
                                    value={formData.active ? "active" : "inactive"}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.value === "active" })}
                                    className="w-full border rounded-md p-2 bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block font-semibold mb-2">Notes (Optional)</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows="2"
                                className="w-full border rounded-md p-2 bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Add any notes about this redirect..."
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
                            >
                                <Save size={18} />
                                {editingId ? "Update Redirect" : "Create Redirect"}
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

            {redirects.length === 0 ? (
                <p className="text-gray-500">No redirects found. Create your first redirect!</p>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left border-b text-sm font-semibold">From Path</th>
                                <th className="px-4 py-3 text-left border-b text-sm font-semibold">To Path</th>
                                <th className="px-4 py-3 text-center border-b text-sm font-semibold">Type</th>
                                <th className="px-4 py-3 text-center border-b text-sm font-semibold">Status</th>
                                <th className="px-4 py-3 text-left border-b text-sm font-semibold">Notes</th>
                                <th className="px-4 py-3 text-center border-b text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {redirects.map((redirect) => (
                                <tr key={redirect._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 border-b font-mono text-sm text-gray-900">
                                        {redirect.fromPath}
                                    </td>
                                    <td className="px-4 py-3 border-b font-mono text-sm text-gray-900">
                                        {redirect.toPath}
                                    </td>
                                    <td className="px-4 py-3 border-b text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            redirect.type === 301 
                                                ? "bg-blue-100 text-blue-800" 
                                                : "bg-yellow-100 text-yellow-800"
                                        }`}>
                                            {redirect.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 border-b text-center">
                                        <button
                                            onClick={() => handleToggleActive(redirect._id, redirect.active)}
                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                                redirect.active
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {redirect.active ? (
                                                <>
                                                    <CheckCircle size={12} />
                                                    Active
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle size={12} />
                                                    Inactive
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 border-b text-sm text-gray-600">
                                        {redirect.notes || "-"}
                                    </td>
                                    <td className="px-4 py-3 border-b text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(redirect)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(redirect._id)}
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

















