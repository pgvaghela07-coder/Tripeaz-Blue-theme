"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { Plane, Trash2 } from "lucide-react";

export default function AirportsPage() {
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAirports = async () => {
    try {
      const res = await fetch("/api/airports", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setAirports(data.airports || []);
      } else {
        toast.error(data.message || "Failed to load airports");
        setAirports([]);
      }
    } catch (error) {
      console.error("Error fetching airports:", error);
      toast.error("Something went wrong while loading airports");
      setAirports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAirports();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this airport?")) return;
    try {
      const res = await fetch(`/api/airports/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Airport deleted");
        fetchAirports();
      } else {
        toast.error(data.message || "Failed to delete airport");
      }
    } catch (error) {
      console.error("Error deleting airport:", error);
      toast.error("Something went wrong while deleting");
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Plane size={20} className="text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">Airports</h1>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading airports...</p>
      ) : airports.length === 0 ? (
        <p className="text-gray-500">No airports found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 bg-white rounded-lg shadow text-sm">
            <thead className="bg-gray-100">
              <tr className="text-left text-gray-700 font-semibold">
                <th className="px-4 py-3 border-b">Airport Name</th>
                <th className="px-4 py-3 border-b">From</th>
                <th className="px-4 py-3 border-b">To</th>
                <th className="px-4 py-3 border-b">URL</th>
                <th className="px-4 py-3 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {airports.map((airport) => (
                <tr key={airport._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{airport.name}</td>
                  <td className="px-4 py-3 text-gray-700">{airport.from}</td>
                  <td className="px-4 py-3 text-gray-700">{airport.to}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={airport.url ? `/airport/${airport.url}` : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                    >
                      {airport.url}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(airport._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete airport"
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

