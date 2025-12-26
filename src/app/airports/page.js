"use client";

import { useEffect, useMemo, useState } from "react";
import Header_Components from "@/components/common_components/Header_components";
import Footer_Components from "@/components/common_components/Footer_components";
import Link from "next/link";
import { Search, X, Filter, Plane, MapPin } from "lucide-react";

function buildHref(url = "") {
  if (!url) return "#";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return url;
  return `/${url}`; // Direct slug access for airport blogs
}

export default function AirportsPage() {
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFrom, setSelectedFrom] = useState("");

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const res = await fetch("/api/airports", { cache: "no-store" });
        const data = await res.json();
        if (data?.success && Array.isArray(data.airports)) {
          setAirports(data.airports);
        } else {
          setAirports([]);
        }
      } catch (error) {
        console.error("Error loading airports:", error);
        setAirports([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAirports();
  }, []);

  // Get unique "from" cities for filter
  const uniqueFromCities = useMemo(() => {
    const cities = new Set();
    airports.forEach((airport) => {
      if (airport.from) cities.add(airport.from);
    });
    return Array.from(cities).sort((a, b) => a.localeCompare(b));
  }, [airports]);

  // Filter airports based on search and filter
  const filteredAirports = useMemo(() => {
    return airports.filter((airport) => {
      const matchesSearch = 
        !searchQuery ||
        airport.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        airport.from?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        airport.to?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = !selectedFrom || airport.from === selectedFrom;
      
      return matchesSearch && matchesFilter;
    });
  }, [airports, searchQuery, selectedFrom]);

  const grouped = useMemo(() => {
    const map = {};
    filteredAirports.forEach((airport) => {
      const key = airport.from || "Other";
      if (!map[key]) map[key] = [];
      map[key].push(airport);
    });
    return map;
  }, [filteredAirports]);

  const sortedFromKeys = useMemo(
    () => Object.keys(grouped).sort((a, b) => a.localeCompare(b)),
    [grouped]
  );

  const hasActiveFilters = searchQuery || selectedFrom;

  // Color gradients for different cards - only blue variations
  const cardGradients = [
    "from-blue-500 to-blue-600",
    "from-blue-400 to-blue-500",
    "from-blue-600 to-blue-700",
    "from-blue-500 to-blue-700",
    "from-blue-400 to-blue-600",
    "from-blue-600 to-blue-800",
    "from-blue-500 to-blue-600",
    "from-blue-400 to-blue-500",
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
            <Plane className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
            Airports
          </p>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 bg-clip-text text-transparent">
            Browse Airport Routes
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Find airport pickup and drop services across Gujarat
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-gradient-to-r from-white to-blue-50 rounded-2xl shadow-xl p-6 md:p-8 mb-8 border-2 border-blue-100">
          <div className="space-y-5">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Search className="text-blue-500 w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search airports by name, from, or to..."
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

            {/* Filter Section */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700 font-semibold">
                <div className="p-2 bg-blue-100 rounded-lg">
                <Filter className="w-5 h-5 text-blue-600" />
                </div>
                <span>Filter by Origin:</span>
              </div>
              <select
                value={selectedFrom}
                onChange={(e) => setSelectedFrom(e.target.value)}
                className="flex-1 min-w-[200px] px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition-all text-gray-900 cursor-pointer shadow-sm font-medium"
              >
                <option value="">All Origins</option>
                {uniqueFromCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedFrom("");
                  }}
                  className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>

            {/* Results Count */}
            <div className="pt-3 border-t-2 border-blue-100">
              <p className="text-sm text-gray-700 font-medium">
                Showing <span className="font-bold text-blue-600 text-base">{filteredAirports.length}</span> of{" "}
                <span className="font-bold text-gray-900 text-base">{airports.length}</span> airport routes
              </p>
            </div>
          </div>
        </div>

        {/* Airports Display */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-6 text-gray-600 font-medium text-lg">Loading airports...</p>
          </div>
        ) : filteredAirports.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-2 border-blue-100">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Search className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No airport routes found</h3>
              <p className="text-gray-600 mb-6 text-lg">
                {hasActiveFilters
                  ? "Try adjusting your search or filter criteria"
                  : "No airport routes available yet."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedFrom("");
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6  grid grid-cols-1 lg:grid-cols-3 gap-6">
            {sortedFromKeys.map((fromKey, index) => (
              <div
                key={fromKey}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 md:p-8 border-2 border-transparent hover:border-blue-200 relative overflow-hidden group"
              >
                {/* Decorative gradient bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getCardGradient(index)}`}></div>
                
                <div className="flex items-center justify-between mb-6 ">
                  <div className="flex  items-center gap-3">
                    <div className={`p-3 bg-gradient-to-r ${getCardGradient(index)} rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 capitalize">{fromKey}</h2>
                  </div>
                  <span className={`px-4 py-2 bg-gradient-to-r ${getCardGradient(index)} text-white rounded-full text-xs font-bold shadow-md`}>
                    {grouped[fromKey].length} {grouped[fromKey].length === 1 ? "route" : "routes"}
                  </span>
                </div>
                <div className="space-y-3">
                  {grouped[fromKey].map((airport, routeIndex) => (
                    <Link
                      key={airport._id}
                      href={buildHref(airport.url)}
                      className="block bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg rounded-xl px-5 py-4 text-gray-800 hover:text-blue-700 transition-all duration-200 group/item relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-base relative z-10">{airport.name}</span>
                        <span className="text-blue-600 opacity-0 group-hover/item:opacity-100 transition-opacity ml-2 text-xl font-bold">→</span>
                      </div>
                      <div className={`absolute inset-0 bg-gradient-to-r ${getCardGradient(index)} opacity-0 group-hover/item:opacity-5 transition-opacity duration-200`}></div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer_Components />
    </div>
  );
}

