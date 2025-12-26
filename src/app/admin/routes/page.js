"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { MapPin, Trash2 } from "lucide-react";

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutes = async () => {
    try {
      const res = await fetch("/api/routes", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setRoutes(data.routes || []);
      } else {
        toast.error(data.message || "Failed to load routes");
        setRoutes([]);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
      toast.error("Something went wrong while loading routes");
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this route?")) return;
    try {
      const res = await fetch(`/api/routes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Route deleted");
        fetchRoutes();
      } else {
        toast.error(data.message || "Failed to delete route");
      }
    } catch (error) {
      console.error("Error deleting route:", error);
      toast.error("Something went wrong while deleting");
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={20} className="text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">Routes</h1>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading routes...</p>
      ) : routes.length === 0 ? (
        <p className="text-gray-500">No routes found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 bg-white rounded-lg shadow text-sm">
            <thead className="bg-gray-100">
              <tr className="text-left text-gray-700 font-semibold">
                <th className="px-4 py-3 border-b">Route Name</th>
                <th className="px-4 py-3 border-b">From</th>
                <th className="px-4 py-3 border-b">To</th>
                <th className="px-4 py-3 border-b">URL</th>
                <th className="px-4 py-3 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{route.name}</td>
                  <td className="px-4 py-3 text-gray-700">{route.from}</td>
                  <td className="px-4 py-3 text-gray-700">{route.to}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={route.url ? `/route/${route.url}` : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                    >
                      {route.url}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(route._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete route"
                    >
                      <Trash2 size={16} />
                    </button>
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

