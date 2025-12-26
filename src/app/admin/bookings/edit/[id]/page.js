"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EditBookingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [booking, setBooking] = useState(null);
  const [formData, setFormData] = useState({
    tripType: "",
    from: "",
    to: "",
    date: "",
    time: "",
    tripEndDate: "",
    passengers: 1,
    carType: "",
    phone: "",
    assignedTo: "",
  });

  useEffect(() => {
    if (id) {
      fetchBooking();
    }
  }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/Bookings`);
      const data = await res.json();
      if (data.success && data.bookings) {
        const foundBooking = data.bookings.find(b => b._id === id);
        if (foundBooking) {
          setBooking(foundBooking);
          setFormData({
            tripType: foundBooking.tripType || "",
            from: foundBooking.from || "",
            to: foundBooking.to || "",
            date: foundBooking.date || "",
            time: foundBooking.time || "",
            tripEndDate: foundBooking.tripEndDate || "",
            passengers: foundBooking.passengers || 1,
            carType: foundBooking.carType || "",
            phone: foundBooking.phone || "",
            assignedTo: foundBooking.assignedTo || "",
          });
        } else {
          toast.error("Booking not found");
          router.push("/admin/bookings");
        }
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast.error("Failed to load booking");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "passengers" ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/Bookings/${id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Booking updated successfully!");
        router.push("/admin/bookings");
      } else {
        toast.error(data.message || "Failed to update booking");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-gray-600">Loading booking...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-gray-600">Booking not found</p>
        <Link href="/admin/bookings" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/bookings"
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Edit Booking</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Trip Type</label>
            <select
              name="tripType"
              value={formData.tripType}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
              required
            >
              <option value="one-way">One Way</option>
              <option value="round-trip">Round Trip</option>
              <option value="airport">Airport</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">From</label>
            <input
              type="text"
              name="from"
              value={formData.from}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">To</label>
            <input
              type="text"
              name="to"
              value={formData.to}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Car Type</label>
            <select
              name="carType"
              value={formData.carType}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
              required
            >
              <option value="">Select Car Type</option>
              <option value="hatchback">Hatchback</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Passengers</label>
            <input
              type="number"
              name="passengers"
              value={formData.passengers}
              onChange={handleChange}
              min="1"
              className="w-full border rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Trip Start Date</label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
              required
            />
          </div>

          {formData.tripType === "round-trip" && (
            <div>
              <label className="block text-sm font-semibold mb-2">Trip End Date</label>
              <input
                type="datetime-local"
                name="tripEndDate"
                value={formData.tripEndDate}
                onChange={handleChange}
                className="w-full border rounded-md p-2"
              />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2">Assigned To / Comment</label>
            <textarea
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
              rows="3"
              placeholder="Enter assignment or comment..."
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link
            href="/admin/bookings"
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

