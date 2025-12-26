"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Higher-order component to protect pages with permission checks
 */
export function withPermission(Component, requiredPermission) {
  return function ProtectedComponent(props) {
    const router = useRouter();
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      checkPermission();
    }, []);

    const checkPermission = async () => {
      try {
        const res = await fetch("/api/admin/me", {
          cache: "no-store",
        });
        const data = await res.json();

        if (!data.success) {
          router.push("/admin-login");
          return;
        }

        const permissions = data.permissions || {};
        
        // Super admin has all permissions
        if (permissions.isSuperAdmin) {
          setHasAccess(true);
          setLoading(false);
          return;
        }

        // Check specific permission
        if (requiredPermission && !permissions[requiredPermission]) {
          router.push("/admin");
          return;
        }

        setHasAccess(true);
        setLoading(false);
      } catch (error) {
        console.error("Permission check error:", error);
        router.push("/admin-login");
      }
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      );
    }

    if (!hasAccess) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

