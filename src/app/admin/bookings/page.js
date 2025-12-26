"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Pencil, Save, X } from "lucide-react";
import Link from "next/link";

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [assignedToValues, setAssignedToValues] = useState({});

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/Bookings", {
        cache: "no-store",
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
      });
      const data = await res.json();
      if (data.success && data.bookings) {
        setBookings(data.bookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAssignedToChange = (bookingId, value) => {
    setAssignedToValues(prev => ({
      ...prev,
      [bookingId]: value
    }));
  };

  const handleSaveAssignedTo = async (bookingId) => {
    try {
      const assignedTo = assignedToValues[bookingId] || "";
      
      const res = await fetch(`/api/Bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignedTo }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Assignment saved successfully!");
        fetchBookings(); // Refresh bookings
        setEditingId(null);
      } else {
        toast.error(data.message || "Failed to save assignment");
      }
    } catch (error) {
      console.error("Error saving assignment:", error);
      toast.error("Something went wrong");
    }
  };

  const handleCancelEdit = (bookingId) => {
    setEditingId(null);
    // Reset to original value
    const booking = bookings.find(b => b._id === bookingId);
    if (booking) {
      setAssignedToValues(prev => ({
        ...prev,
        [bookingId]: booking.assignedTo || ""
      }));
    }
  };

  
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; 
      
      const formattedDate = date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      
      const formattedTime = date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      
      return (
        <div className="flex flex-col">
          <span className="font-medium">{formattedDate}</span>
          <span className="text-xs text-gray-500">{formattedTime}</span>
        </div>
      );
    } catch (error) {
      return dateString;
    }
  };

  // Helper function to format trip type
  const formatTripType = (tripType) => {
    if (!tripType) return "N/A";
    return tripType
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  };

  // Initialize assignedToValues when bookings are fetched
  useEffect(() => {
    if (bookings.length > 0) {
      const initialValues = {};
      bookings.forEach(booking => {
        initialValues[booking._id] = booking.assignedTo || "";
      });
      setAssignedToValues(initialValues);
    }
  }, [bookings]);

  return (
    <div className="p-2 md:p-4">
      <h1 className="text-xl md:text-2xl font-bold mb-4 dark:text-black">All Bookings</h1>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="w-full border-collapse bg-white dark:bg-gray-800 text-xs md:text-sm text-left">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <th className="p-2 md:p-3 border dark:border-gray-600">Trip Type</th>
              <th className="p-2 md:p-3 border dark:border-gray-600">Phone</th>
              <th className="p-2 md:p-3 border dark:border-gray-600">Pickup</th>
              <th className="p-2 md:p-3 border dark:border-gray-600">Drop</th>
              <th className="p-2 md:p-3 border dark:border-gray-600">Car Type</th>
              <th className="p-2 md:p-3 border dark:border-gray-600">Trip Start</th>
              <th className="p-2 md:p-3 border dark:border-gray-600">Trip End</th>
              <th className="p-2 md:p-3 border dark:border-gray-600">Assigned To</th>
              <th className="p-2 md:p-3 border dark:border-gray-600 text-center">Edit</th>
            </tr>
          </thead>

          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center p-4 text-gray-600 dark:text-gray-300">No bookings found</td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-2 md:p-3 border dark:border-gray-600 text-gray-900 dark:text-gray-200">
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                      {formatTripType(b.tripType)}
                    </span>
                  </td>
                  <td className="p-2 md:p-3 border dark:border-gray-600 text-gray-900 dark:text-gray-200">{b.phone || "N/A"}</td>
                  <td className="p-2 md:p-3 border dark:border-gray-600 text-gray-900 dark:text-gray-200">{b.from || "N/A"}</td>
                  <td className="p-2 md:p-3 border dark:border-gray-600 text-gray-900 dark:text-gray-200">{b.to || "N/A"}</td>
                  <td className="p-2 md:p-3 border dark:border-gray-600 text-gray-900 dark:text-gray-200">
                    <span className="capitalize">{b.carType || "N/A"}</span>
                  </td>
                  <td className="p-2 md:p-3 border dark:border-gray-600 text-gray-900 dark:text-gray-200">
                    {formatDateTime(b.date)}
                  </td>
                  <td className="p-2 md:p-3 border dark:border-gray-600 text-gray-900 dark:text-gray-200">
                    {b.tripType === "round-trip" ? formatDateTime(b.tripEndDate) : <span className="text-gray-400">N/A</span>}
                  </td>
                  <td className="p-2 md:p-3 border dark:border-gray-600 text-gray-900 dark:text-gray-200 min-w-[150px]">
                    {editingId === b._id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={assignedToValues[b._id] || ""}
                          onChange={(e) => handleAssignedToChange(b._id, e.target.value)}
                          placeholder="Enter assignment/comment..."
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleSaveAssignedTo(b._id)}
                            className="flex-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-1"
                          >
                            <Save size={12} />
                            Save
                          </button>
                          <button
                            onClick={() => handleCancelEdit(b._id)}
                            className="flex-1 px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center justify-center gap-1"
                          >
                            <X size={12} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-700 dark:text-gray-200 break-words">
                          {b.assignedTo || <span className="text-gray-400 italic">Not assigned</span>}
                        </span>
                        <button
                          onClick={() => setEditingId(b._id)}
                          className="text-xs text-blue-600 hover:text-blue-800 underline self-start"
                        >
                          {b.assignedTo ? "Edit" : "Assign"}
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="p-2 md:p-3 border dark:border-gray-600 text-center">
                    <Link
                      href={`/admin/bookings/edit/${b._id}`}
                      className="inline-flex items-center justify-center text-blue-600 hover:text-blue-800"
                      title="Edit Booking"
                    >
                      <Pencil size={16} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
