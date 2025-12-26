"use client";

import { useEffect, useState, useMemo } from "react";
import Header_Components from "@/components/common_components/Header_components";
import Footer_Components from "@/components/common_components/Footer_components";
import Link from "next/link";
import { Search, X, MapPin } from "lucide-react";

function buildHref(url = "") {
  if (!url) return "#";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return url;
  return `/${url}`; // Direct slug access for city blogs
}

export default function CitiesPage() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch("/api/cities", { cache: "no-store" });
        const data = await res.json();
        if (data?.success && Array.isArray(data.cities)) {
          setCities(data.cities);
        } else {
          setCities([]);
        }
      } catch (error) {
        console.error("Error loading cities:", error);
        setCities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!searchQuery) return cities;
    return cities.filter((city) =>
      city.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cities, searchQuery]);

  // Sort cities alphabetically
  const sortedCities = useMemo(() => {
    return [...filteredCities].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [filteredCities]);

  // Color gradients for different cards - only blue variations
  const cardGradients = [
    "from-blue-500 to-blue-600",
    "from-blue-400 to-blue-500",
    "from-blue-600 to-blue-700",
    "from-blue-500 to-blue-700",
    "from-blue-400 to-blue-600",
  ];

  const getCardGradient = (index) => {
    return cardGradients[index % cardGradients.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Header_Components />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header Section */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
            Cities
          </p>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 bg-clip-text text-transparent">
            Browse All Cities
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Explore all the cities we serve across Gujarat
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-gradient-to-r from-white to-blue-50 rounded-2xl shadow-xl p-6 md:p-8 mb-8 border-2 border-blue-100">
          <div className="space-y-5">
          <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Search className="text-blue-500 w-5 h-5" />
              </div>
            <input
              type="text"
              placeholder="Search cities by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-white border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition-all text-gray-900 placeholder-gray-400 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
            <div className="pt-3 border-t-2 border-blue-100">
              <p className="text-sm text-gray-700 font-medium">
                Showing <span className="font-bold text-blue-600 text-base">{filteredCities.length}</span> of{" "}
                <span className="font-bold text-gray-900 text-base">{cities.length}</span> cities
            </p>
            </div>
          </div>
        </div>

        {/* Cities Display */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-6 text-gray-600 font-medium text-lg">Loading cities...</p>
          </div>
        ) : filteredCities.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-2 border-blue-100">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Search className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No cities found</h3>
              <p className="text-gray-600 mb-6 text-lg">
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : "No cities available yet."}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {sortedCities.map((city, index) => (
              <Link
                key={city._id}
                href={buildHref(city.url)}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 md:p-8 border-2 border-transparent hover:border-blue-200 relative overflow-hidden"
              >
                {/* Decorative gradient bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getCardGradient(index)}`}></div>
                
                <div className="flex items-center gap-3">
                  <div className={`p-3 bg-gradient-to-r ${getCardGradient(index)} rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors capitalize flex-1">
                    {city.name}
                  </h2>
                  <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity text-2xl font-bold">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer_Components />
    </div>
  );
}

