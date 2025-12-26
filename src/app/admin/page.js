"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RecentPosts from "@/components/admin/RecentPosts";
import QuickActions from "@/components/admin/QuickActions";

export default function BlogList() {
    const [totalBlogs, setTotalBlogs] = useState(0);
    const [totalBookings, setTotalBookings] = useState(0);
    const [oneWayCount, setOneWayCount] = useState(0);
    const [roundTripCount, setRoundTripCount] = useState(0);
    const [scheduledCount, setScheduledCount] = useState(0);
    const [publishedCount, setPublishedCount] = useState(0);
    const [draftCount, setDraftCount] = useState(0);
    const [categoriesCount, setCategoriesCount] = useState(0);
    const [tagsCount, setTagsCount] = useState(0);

    const fetchBlogs = async () => {
        try {
            const res = await fetch("/api/blogs", {
                method: "GET",
                cache: "no-store",
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            });

            const data = await res.json();
            if (data.success !== false) {
                setTotalBlogs(data.totalBlogs || 0);
                setPublishedCount(data.publishedCount || 0);
                setScheduledCount(data.scheduledCount || 0);
                setDraftCount(data.draftCount || 0);
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
        }
    };

    const fetchBokkings = async () => {
        try {
            const res = await fetch("/api/Bookings", {
                method: "GET",
                cache: "no-store",
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            });

            const data = await res.json();
            if (data.success) {
                setTotalBookings(data.totalBookings || 0);
                setOneWayCount(data.oneWayCount || 0);
                setRoundTripCount(data.roundTripCount || 0);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories", {
                cache: "no-store",
            });
            const data = await res.json();
            if (data.success) {
                setCategoriesCount(data.categories?.length || 0);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchTags = async () => {
        try {
            const res = await fetch("/api/tags", {
                cache: "no-store",
            });
            const data = await res.json();
            if (data.success) {
                setTagsCount(data.tags?.length || 0);
            }
        } catch (error) {
            console.error("Error fetching tags:", error);
        }
    };

    useEffect(() => {
        fetchBlogs();
        fetchBokkings();
        fetchCategories();
        fetchTags();
    }, []);

    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            <div className="bg-blue-500 p-4 md:p-5 rounded-md text-white border-2">
                <h2 className="font-bold text-sm md:text-base">Total Blogs:</h2>
                <p className="text-2xl md:text-3xl font-bold mt-2">{totalBlogs}</p>
            </div>

            <div className="bg-yellow-500 p-4 md:p-5 rounded-md text-white border-2">
                <h2 className="font-bold text-sm md:text-base">Total Bookings:</h2>
                <p className="text-2xl md:text-3xl font-bold mt-2">{totalBookings}</p>
            </div>

            <div className="bg-blue-500 p-4 md:p-5 rounded-md text-white border-2">
                <h2 className="font-bold text-sm md:text-base">One Way Bookings:</h2>
                <p className="text-2xl md:text-3xl font-bold mt-2">{oneWayCount}</p>
            </div>

            <div className="bg-green-500 p-4 md:p-5 rounded-md text-white border-2">
                <h2 className="font-bold text-sm md:text-base">Round Trip Bookings:</h2>
                <p className="text-2xl md:text-3xl font-bold mt-2">{roundTripCount}</p>
            </div>

            <div className="bg-purple-500 p-4 md:p-5 rounded-md text-white border-2">
                <h2 className="font-bold text-sm md:text-base">Published Posts:</h2>
                <p className="text-2xl md:text-3xl font-bold mt-2">{publishedCount}</p>
            </div>

            <div className="bg-indigo-500 p-4 md:p-5 rounded-md text-white border-2">
                <h2 className="font-bold text-sm md:text-base">Scheduled Posts:</h2>
                <p className="text-2xl md:text-3xl font-bold mt-2">{scheduledCount}</p>
            </div>

            <div className="bg-gray-500 p-4 md:p-5 rounded-md text-white border-2">
                <h2 className="font-bold text-sm md:text-base">Draft Posts:</h2>
                <p className="text-2xl md:text-3xl font-bold mt-2">{draftCount}</p>
            </div>

            <div className="bg-teal-500 p-4 md:p-5 rounded-md text-white border-2">
                <h2 className="font-bold text-sm md:text-base">Categories:</h2>
                <p className="text-2xl md:text-3xl font-bold mt-2">{categoriesCount}</p>
            </div>

            <div className="bg-pink-500 p-4 md:p-5 rounded-md text-white border-2">
                <h2 className="font-bold text-sm md:text-base">Tags:</h2>
                <p className="text-2xl md:text-3xl font-bold mt-2">{tagsCount}</p>
            </div>
            </div>

            {/* Recent Posts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentPosts limit={5} />
            </div>
        </div>
    );
}
