"use client";

import Link from "next/link";
import { Plus, Upload, FileText, Settings } from "lucide-react";

export default function QuickActions() {
    const actions = [
        {
            name: "Create Post",
            href: "/admin/blog/add",
            icon: Plus,
            color: "bg-blue-600 hover:bg-blue-700",
        },
        {
            name: "Media Library",
            href: "/admin/media",
            icon: Upload,
            color: "bg-blue-600 hover:bg-blue-700",
        },
        {
            name: "All Posts",
            href: "/admin/blog/manage",
            icon: FileText,
            color: "bg-green-600 hover:bg-green-700",
        },
        {
            name: "SEO Tools",
            href: "/admin/seo/sitemap",
            icon: Settings,
            color: "bg-purple-600 hover:bg-purple-700",
        },
    ];

    return (
        <div className="bg-white border rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={action.name}
                            href={action.href}
                            className={`${action.color} text-white p-4 rounded-lg text-center transition-colors flex flex-col items-center justify-center gap-2`}
                        >
                            <Icon size={24} />
                            <span className="text-sm font-medium">{action.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}









