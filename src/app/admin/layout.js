"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, FilePlus2, FileText, Settings, Tag, FolderTree, Map, FileCode, Activity, Shield, Building2, Plane, Users, User, Mail } from "lucide-react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  // Helper function to check if user has permission
  const hasPermission = (permission) => {
    if (!permissions) return false;
    // Super admin has all permissions
    if (permissions.isSuperAdmin) return true;
    return permissions[permission] === true;
  };

  // All possible navigation items with their required permissions
  const allNavItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, permission: null }, // Always visible
    { name: "Add Blog", href: "/admin/blog/add", icon: FilePlus2, permission: "canCreateBlog" },
    { name: "All Blogs", href: "/admin/blog/manage", icon: FileText, permission: "canViewBlog", requiresAny: ["canViewBlog", "canEditBlog", "canDeleteBlog"] }, // Show if user can view, edit, or delete blogs
    { name: "Categories", href: "/admin/categories", icon: FolderTree, permission: "canManageCategories" },
    { name: "Tags", href: "/admin/tags", icon: Tag, permission: "canManageTags" },
    { name: "Routes", href: "/admin/routes", icon: Map, permission: "canManageRoutes" },
    { name: "Cities", href: "/admin/cities", icon: Building2, permission: "canManageCities" },
    { name: "Airports", href: "/admin/airports", icon: Plane, permission: "canManageAirports" },
    { name: "Media Library", href: "/admin/media", icon: FileText, permission: "canManageMedia" },
    { name: "All Bookings", href: "/admin/bookings", icon: FileText, permission: "canViewBookings" },
    { name: "SEO Tools", href: "#", icon: Settings, divider: true, permission: "canManageSEO" },
    { name: "Users", href: "/admin/users", icon: Users, permission: "canViewUsers" },
    { name: "Audit Logs", href: "/admin/audit-logs", icon: Activity, permission: "canViewAuditLogs" },
    { name: "Roles", href: "/admin/roles", icon: Shield, permission: "canAssignRole" },
    { name: "Sitemap", href: "/admin/seo/sitemap", icon: Map, permission: "canManageSEO" },
    { name: "Robots.txt", href: "/admin/seo/robots", icon: FileCode, permission: "canManageSEO" },
  ];

  // Filter navigation items based on permissions
  const getNavItems = () => {
    return allNavItems.filter(item => {
      // Always show dashboard
      if (item.href === "/admin") return true;
      // Show dividers if next item is visible
      if (item.divider) {
        const nextItem = allNavItems[allNavItems.indexOf(item) + 1];
        return nextItem && hasPermission(nextItem.permission);
      }
      // Check permission for other items
      if (!item.permission) return true;
      
      // If item requires ANY of the listed permissions (OR logic)
      if (item.requiresAny && Array.isArray(item.requiresAny)) {
        return item.requiresAny.some(perm => hasPermission(perm));
      }
      
      // If item has specific requirements, check all of them (AND logic)
      if (item.requires && Array.isArray(item.requires)) {
        return item.requires.every(perm => hasPermission(perm));
      }
      
      // Otherwise check the main permission
      return hasPermission(item.permission);
    });
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/admin/me", {
        cache: "no-store",
      });
      const data = await res.json();

      if (data.success) {
        setCurrentUser(data.user);
        setPermissions(data.permissions || {});
      } else {
        // If unauthorized, redirect to login
        router.push("/admin-login");
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "GET" });
    router.push("/admin-login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Fixed Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-gray-200 h-16">
        <div className="flex items-center justify-between h-full px-4 md:px-6">
          {/* Left: Mobile Menu Button and Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isSidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-blue-600">Admin Panel</h1>
          </div>

          {/* Right: User Info and Logout Button */}
          <div className="flex items-center gap-2 md:gap-3">
            {!loading && currentUser && (
              <>
                {/* Mobile: Simple user display */}
                <div className="md:hidden flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <User size={14} className="text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-800 leading-tight">
                      {currentUser.userName.length > 10 
                        ? currentUser.userName.substring(0, 10) + "..." 
                        : currentUser.userName}
                    </span>
                    <span className="text-xs text-gray-500 leading-tight">
                      {currentUser.email.length > 15 
                        ? currentUser.email.substring(0, 15) + "..." 
                        : currentUser.email}
                    </span>
                  </div>
                </div>
                
                {/* Desktop: Full user display */}
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User size={16} className="text-blue-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-800">
                        {currentUser.userName}
                      </span>
                      <div className="flex items-center gap-1">
                        <Mail size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {currentUser.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  {currentUser.roleSlug === "super_admin" && (
                    <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                      Super Admin
                    </span>
                  )}
                </div>
              </>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Fixed Page Title Header */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-gray-50 border-b border-gray-200 h-16 md:left-64">
        <div className="flex items-center justify-between h-full px-4 md:px-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            {pathname === "/admin"
              ? "Dashboard"
              : pathname.split("/").slice(-1)[0].replace("-", " ").toUpperCase()}
          </h2>
        </div>
      </div>

      <div className="flex flex-1 pt-32">
        {/* Fixed Sidebar */}
        <aside className={`
          fixed md:fixed inset-y-0 left-0 z-30
          w-64 bg-white shadow-lg flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          pt-16 md:pt-16
        `}>
          <div className="flex flex-col h-full">
            <div className="p-4 md:p-5 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
            </div>

            {/* Scrollable Navigation */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden">
              {getNavItems().map((item, index) => {
                if (item.href === "#") {
                  return (
                    <div key={item.name} className="px-4 md:px-5 py-2 mt-4 first:mt-0">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {item.name}
                      </div>
                    </div>
                  );
                }
                const isActive = pathname === item.href;
                const Icon = item.icon;
                if (!Icon) {
                  return null; // Skip items without icons
                }
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 md:px-5 py-3 text-sm font-medium 
                    transition-all duration-200 
                    ${isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"}`}
                  >
                    <Icon size={18} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full md:w-auto ml-0 md:ml-64">
          <div className="p-4 md:p-6">
            <div className="bg-white rounded-xl shadow p-4 md:p-6 min-h-[80vh]">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
