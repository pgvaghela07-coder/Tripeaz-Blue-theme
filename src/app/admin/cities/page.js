"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { Building2, Trash2 } from "lucide-react";

export default function CitiesPage() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCities = async () => {
    try {
      const res = await fetch("/api/cities", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setCities(data.cities || []);
      } else {
        toast.error(data.message || "Failed to load cities");
        setCities([]);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      toast.error("Something went wrong while loading cities");
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this city?")) return;
    try {
      const res = await fetch(`/api/cities/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("City deleted");
        fetchCities();
      } else {
        toast.error(data.message || "Failed to delete city");
      }
    } catch (error) {
      console.error("Error deleting city:", error);
      toast.error("Something went wrong while deleting");
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Building2 size={20} className="text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">Cities</h1>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading cities...</p>
      ) : cities.length === 0 ? (
        <p className="text-gray-500">No cities found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 bg-white rounded-lg shadow text-sm">
            <thead className="bg-gray-100">
              <tr className="text-left text-gray-700 font-semibold">
                <th className="px-4 py-3 border-b">City Name</th>
                <th className="px-4 py-3 border-b">URL</th>
                <th className="px-4 py-3 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((city) => (
                <tr key={city._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{city.name}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={city.url ? `/city/${city.url}` : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                    >
                      {city.url}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(city._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete city"
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

