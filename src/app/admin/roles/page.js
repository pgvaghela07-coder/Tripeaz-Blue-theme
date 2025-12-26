"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Shield, Edit, Trash2, Plus, Check, X } from "lucide-react";

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    permissions: {},
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/admin/roles", {
        cache: "no-store",
      });
      const data = await res.json();

      if (data.success) {
        setRoles(data.roles);
      } else {
        toast.error(data.message || "Failed to fetch roles");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permission, value) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [permission]: value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingRole
        ? `/api/admin/roles/${editingRole._id}`
        : "/api/admin/roles";
      const method = editingRole ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        setShowModal(false);
        setEditingRole(null);
        setFormData({
          name: "",
          slug: "",
          description: "",
          permissions: {},
        });
        fetchRoles();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving role:", error);
      toast.error("Something went wrong");
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      slug: role.slug,
      description: role.description || "",
      permissions: role.permissions || {},
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      const res = await fetch(`/api/admin/roles/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        fetchRoles();
      } else {
        toast.error(data.message || "Failed to delete role");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("Something went wrong");
    }
  };

  const openAddModal = () => {
    setEditingRole(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      permissions: {},
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRole(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      permissions: {},
    });
  };

  const permissionGroups = [
    {
      title: "Blog Management",
      permissions: [
        { key: "canViewBlog", label: "View Blog" },
        { key: "canCreateBlog", label: "Create Blog" },
        { key: "canEditBlog", label: "Edit Blog" },
        { key: "canDeleteBlog", label: "Delete Blog" },
        { key: "canPublishBlog", label: "Publish Blog" },
      ],
    },
    {
      title: "User Management",
      permissions: [
        { key: "canViewUsers", label: "View Users" },
        { key: "canCreateUser", label: "Create User" },
        { key: "canEditUser", label: "Edit User" },
        { key: "canDeleteUser", label: "Delete User" },
        { key: "canAssignRole", label: "Assign Role" },
      ],
    },
    {
      title: "Content Management",
      permissions: [
        { key: "canManageCategories", label: "Manage Categories" },
        { key: "canManageTags", label: "Manage Tags" },
        { key: "canManageMedia", label: "Manage Media" },
      ],
    },
    {
      title: "Location Management",
      permissions: [
        { key: "canManageRoutes", label: "Manage Routes" },
        { key: "canManageCities", label: "Manage Cities" },
        { key: "canManageAirports", label: "Manage Airports" },
      ],
    },
    {
      title: "Other",
      permissions: [
        { key: "canManageSEO", label: "Manage SEO" },
        { key: "canViewBookings", label: "View Bookings" },
        { key: "canManageBookings", label: "Manage Bookings" },
        { key: "canManageSettings", label: "Manage Settings" },
        { key: "canViewAuditLogs", label: "View Audit Logs" },
      ],
    },
  ];

  // Get all permission keys
  const getAllPermissionKeys = () => {
    return permissionGroups.flatMap(group => group.permissions.map(p => p.key));
  };

  // Select all permissions
  const handleSelectAll = () => {
    const allKeys = getAllPermissionKeys();
    const allSelected = allKeys.every(key => formData.permissions[key] === true);
    
    const newPermissions = {};
    if (allSelected) {
      // Deselect all
      allKeys.forEach(key => {
        newPermissions[key] = false;
      });
    } else {
      // Select all
      allKeys.forEach(key => {
        newPermissions[key] = true;
      });
    }
    
    setFormData({
      ...formData,
      permissions: { ...formData.permissions, ...newPermissions },
    });
  };

  // Select all in a group
  const handleSelectAllInGroup = (group) => {
    const groupKeys = group.permissions.map(p => p.key);
    const allSelected = groupKeys.every(key => formData.permissions[key] === true);
    
    const newPermissions = {};
    groupKeys.forEach(key => {
      newPermissions[key] = !allSelected;
    });
    
    setFormData({
      ...formData,
      permissions: { ...formData.permissions, ...newPermissions },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Role Management</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          <Plus size={20} />
          Add Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div
            key={role._id}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield size={24} className="text-blue-600" />
                <h3 className="text-lg font-bold text-gray-800">{role.name}</h3>
              </div>
              {role.slug === "super_admin" && (
                <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                  Super Admin
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">{role.description}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(role)}
                className="flex-1 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                disabled={role.slug === "super_admin"}
              >
                <Edit size={18} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(role._id)}
                className="flex-1 flex items-center justify-center gap-2 text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                disabled={role.slug === "super_admin"}
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 my-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingRole ? "Edit Role" : "Add New Role"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slug: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="role_slug"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Permissions
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {getAllPermissionKeys().every(key => formData.permissions[key] === true)
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {permissionGroups.map((group) => {
                    const groupKeys = group.permissions.map(p => p.key);
                    const allGroupSelected = groupKeys.every(key => formData.permissions[key] === true);
                    
                    return (
                      <div key={group.title} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-700">{group.title}</h4>
                          <button
                            type="button"
                            onClick={() => handleSelectAllInGroup(group)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {allGroupSelected ? "Deselect All" : "Select All"}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {group.permissions.map((perm) => (
                            <label
                              key={perm.key}
                              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={formData.permissions[perm.key] || false}
                                onChange={(e) =>
                                  handlePermissionChange(perm.key, e.target.checked)
                                }
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{perm.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  {editingRole ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
