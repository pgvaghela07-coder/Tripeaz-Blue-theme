"use client";

import { useState, useEffect } from "react";
import { Download, Filter, Clock, User, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        userId: "",
        action: "",
        resourceType: "",
        startDate: "",
        endDate: "",
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchLogs();
    }, [page, filters]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "50",
            });

            if (filters.userId) params.append("userId", filters.userId);
            if (filters.action) params.append("action", filters.action);
            if (filters.resourceType) params.append("resourceType", filters.resourceType);
            if (filters.startDate) params.append("startDate", filters.startDate);
            if (filters.endDate) params.append("endDate", filters.endDate);

            const res = await fetch(`/api/audit-logs?${params.toString()}`, {
                cache: "no-store",
            });
            const data = await res.json();

            if (data.success) {
                setLogs(data.logs || []);
                setTotalPages(data.pagination?.pages || 1);
            } else {
                console.error("Failed to fetch audit logs:", data.message);
                setLogs([]);
            }
        } catch (error) {
            console.error("Error fetching audit logs:", error);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const csv = [
            ["Date", "User", "Action", "Resource Type", "Resource ID", "Details", "IP Address"],
            ...logs.map(log => [
                new Date(log.createdAt).toLocaleString(),
                (log.userId && typeof log.userId === 'object' && log.userId !== null) 
                    ? (log.userId.userName || log.userId.email || 'Unknown User') 
                    : 'Unknown',
                log.action,
                log.resourceType,
                log.resourceId || "",
                log.details || "",
                log.ipAddress || "",
            ])
        ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const getActionColor = (action) => {
        const colors = {
            create: "bg-green-100 text-green-800",
            update: "bg-blue-100 text-blue-800",
            delete: "bg-red-100 text-red-800",
            publish: "bg-purple-100 text-purple-800",
            unpublish: "bg-yellow-100 text-yellow-800",
            schedule: "bg-indigo-100 text-indigo-800",
            restore: "bg-teal-100 text-teal-800",
            login: "bg-gray-100 text-gray-800",
            logout: "bg-gray-100 text-gray-800",
        };
        return colors[action] || "bg-gray-100 text-gray-800";
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Activity size={24} />
                        Audit Logs
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Track all admin actions and changes
                    </p>
                </div>
                <button
                    onClick={handleExport}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                >
                    <Download size={18} />
                    Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Filter size={18} />
                    <h3 className="font-semibold text-gray-800">Filters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-xs font-semibold mb-1">Action</label>
                        <select
                            value={filters.action}
                            onChange={(e) => {
                                setFilters({ ...filters, action: e.target.value });
                                setPage(1);
                            }}
                            className="w-full border rounded-md p-2 text-sm"
                        >
                            <option value="">All Actions</option>
                            <option value="create">Create</option>
                            <option value="update">Update</option>
                            <option value="delete">Delete</option>
                            <option value="publish">Publish</option>
                            <option value="unpublish">Unpublish</option>
                            <option value="schedule">Schedule</option>
                            <option value="restore">Restore</option>
                            <option value="login">Login</option>
                            <option value="logout">Logout</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold mb-1">Resource Type</label>
                        <select
                            value={filters.resourceType}
                            onChange={(e) => {
                                setFilters({ ...filters, resourceType: e.target.value });
                                setPage(1);
                            }}
                            className="w-full border rounded-md p-2 text-sm"
                        >
                            <option value="">All Types</option>
                            <option value="blog">Blog</option>
                            <option value="category">Category</option>
                            <option value="tag">Tag</option>
                            <option value="media">Media</option>
                            <option value="user">User</option>
                            <option value="system">System</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold mb-1">Start Date</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => {
                                setFilters({ ...filters, startDate: e.target.value });
                                setPage(1);
                            }}
                            className="w-full border rounded-md p-2 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold mb-1">End Date</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => {
                                setFilters({ ...filters, endDate: e.target.value });
                                setPage(1);
                            }}
                            className="w-full border rounded-md p-2 text-sm"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setFilters({
                                    userId: "",
                                    action: "",
                                    resourceType: "",
                                    startDate: "",
                                    endDate: "",
                                });
                                setPage(1);
                            }}
                            className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading audit logs...</p>
                    </div>
                </div>
            ) : logs.length === 0 ? (
                <div className="bg-white border rounded-lg p-12 text-center">
                    <Activity size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Audit Logs Found</h3>
                    <p className="text-gray-500">
                        {Object.values(filters).some(f => f) 
                            ? "Try adjusting your filters to see more results."
                            : "Audit logs will appear here as actions are performed in the admin panel."}
                    </p>
                </div>
            ) : (
                <>
                    <div className="bg-white border rounded-lg shadow overflow-x-auto">
                        <table className="min-w-full border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left border-b text-sm font-semibold">Date</th>
                                    <th className="px-4 py-3 text-left border-b text-sm font-semibold">User</th>
                                    <th className="px-4 py-3 text-left border-b text-sm font-semibold">Action</th>
                                    <th className="px-4 py-3 text-left border-b text-sm font-semibold">Resource</th>
                                    <th className="px-4 py-3 text-left border-b text-sm font-semibold">Details</th>
                                    <th className="px-4 py-3 text-left border-b text-sm font-semibold">IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 border-b text-sm">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Clock size={14} />
                                                {formatDistanceToNow(new Date(log.createdAt), {
                                                    addSuffix: true,
                                                })}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 border-b text-sm">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-gray-400" />
                                                <span className="text-gray-900">
                                                    {log.userId && typeof log.userId === 'object' && log.userId !== null
                                                        ? (log.userId.userName || log.userId.email || 'Unknown User')
                                                        : 'Unknown'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 border-b">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(
                                                    log.action
                                                )}`}
                                            >
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 border-b text-sm text-gray-600">
                                            {log.resourceType}
                                            {log.resourceId && (
                                                <span className="text-gray-400 ml-1">
                                                    ({log.resourceId.toString().substring(0, 8)}...)
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 border-b text-sm text-gray-600">
                                            {log.details || "-"}
                                        </td>
                                        <td className="px-4 py-3 border-b text-sm text-gray-500 font-mono">
                                            {log.ipAddress || "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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







