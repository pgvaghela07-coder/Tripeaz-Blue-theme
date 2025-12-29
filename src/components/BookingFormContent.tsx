"use client";

import { useState, useEffect, useRef } from "react";
import anime from "animejs";
import {
  MapPin,
  Calendar,
  Users,
  Car,
  ArrowRight,
  CheckCircle,
  CalendarCheck,
  Phone,
} from "lucide-react";
import { assest } from "../assest/assest";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface BookingData {
  tripType: "one-way" | "round-trip" | "airport";
  from: string;
  to: string;
  date: string;
  time: string;
  tripEndDate: string;
  passengers: number;
  carType: "sedan" | "suv" | "hatchback";
  phone: string;
}

interface BookingFormContentProps {
  onSuccess?: () => void;
  showHeader?: boolean;
}

const gujaratCities = [
  "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar",
  "Gandhinagar", "Junagadh", "Anand", "Navsari", "Morbi", "Bharuch",
  "Nadiad", "Vapi", "Gandhidham", "Mehsana", "Porbandar", "Palanpur",
  "Botad", "Amreli", "Dahod", "Surendranagar", "Patan", "Veraval",
  "Godhra", "Valsad", "Kheda", "Somnath", "Dwarka", "Mahesana"
];


interface CityInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function CityInput({ label, value, onChange, placeholder = "Search city…" }: CityInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredCities = gujaratCities.filter((city) =>
    city.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className="relative">
      <div className="relative w-full">
        {/* Label inside border with white background */}
        <label className="absolute -top-2 left-4 bg-white px-1 text-sm font-semibold text-gray-700 z-10">
          {label}
        </label>

        {/* Icon inside input */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-20 pointer-events-none">
          <MapPin className="w-5 h-5 text-gray-400" />
        </div>

        {/* Input field */}
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          className="border-2 pl-10 pr-2 h-[48px] rounded-md w-full
                     bg-white text-black placeholder-gray-500 border-gray-300
                     dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:border-gray-600
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder={placeholder}
        />
      </div>

      {showDropdown && filteredCities.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto z-50 mt-1">
          {filteredCities.map((city) => (
            <li
              key={city}
              onClick={() => {
                onChange(city);
                setShowDropdown(false);
              }}
              className="p-2 hover:bg-blue-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-gray-200"
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function BookingFormContent({ onSuccess, showHeader = true }: BookingFormContentProps) {
  const [bookingData, setBookingData] = useState<BookingData>({
    tripType: "one-way",
    from: "",
    to: "",
    date: "",
    time: "",
    tripEndDate: "",
    passengers: 1,
    carType: "sedan",
    phone: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formRef.current) {
      // Set immediate visibility - no animation delay
      const children = Array.from(formRef.current.children) as HTMLElement[];
      children.forEach(child => {
        child.style.opacity = '1';
      });
    }
  }, []);

  const carTypes = [
    {
      id: "hatchback",
      name: "Hatchback",
      description: "Economical 4-seater car",
      image: assest.hatchback,
      price: "₹10/km",
    },
    {
      id: "sedan",
      name: "Sedan",
      description: "Comfortable 4-seater car",
      image: assest.sedan,
      price: "₹12/km",
    },
    {
      id: "suv",
      name: "SUV",
      description: "Spacious 6-7 seater vehicle",
      image: assest.suv,
      price: "₹18/km",
    },

  ];

  const sendBookingEmail = async (data: BookingData) => {
    try {
      const response = await fetch("/api/send-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        return result.bookingId;
      } else {
        throw new Error(result.message || "Failed to send booking email");
      }
    } catch (error) {
      console.error("Error sending booking email:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {

      const saveResponse = await fetch("/api/create-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const saveResult = await saveResponse.json();
      if (!saveResult.success) {
        throw new Error("Failed to save booking in database");
      }

      const newBookingId = await sendBookingEmail(bookingData);
      setBookingId(newBookingId);

      setIsSubmitted(true);

      console.log("Booking submitted successfully:", bookingData);

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 5000);
      }
    } catch (error) {
      console.error("Booking failed:", error);
      alert(
        "Failed to submit booking. Please try again or contact us directly."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof BookingData,
    value: string | number
  ) => {
    setBookingData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isSubmitted) {
    return (
      <div className="p-6 md:p-8  bg-blue-50 text-center">
        <CheckCircle className="w-16 h-16 md:w-20 md:h-20 text-green-500 mx-auto mb-6" />
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 ">
          Booking Received!
        </h2>
        <p className="text-base md:text-lg text-gray-600 mb-6 flex flex-col gap-2">
          We have received your booking inquiry from {bookingData.from} to {bookingData.to}, our team will give you a call at {bookingData.phone} as soon as possible.
          <span>Thanks for choosing us for your travel! Have a great travel with Tripeaz.</span>
        </p>
        <div className="bg-blue-100 rounded-lg p-4 md:p-6 mb-6">
          <h3 className="text-lg md:text-xl font-semibold text-blue-800 mb-2">
            Booking ID
          </h3>
          <p className="text-xl md:text-2xl font-bold text-blue-600">{bookingId}</p>
        </div>
        <a href="tel:+919512870958 " className="btn-primary inline-block">
          +91 9512870958
        </a>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6 border-2  md:pt-0 lg:px-28 pb-14 max-md:px-4 bg-gradient-to-br from-blue-50 to-blue-50">

      <form onSubmit={handleSubmit} className="px-3 py-4 rounded-3xl shadow-xl border-4 border-transparent border-l-blue-600 bg-white">
        <div className="grid grid-cols-1 gap-6 md:gap-8">
          {/* Left Column */}
          <div className="space-y-4 md:space-y-6">
            {/* Trip Type */}
            <div>

              <div className="flex w-full justify-center items-center  gap-2 md:gap-3">
                {[
                  { id: "one-way", label: "One Way" },
                  { id: "round-trip", label: "Round Trip" },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() =>
                      handleInputChange("tripType", type.id as any)
                    }
                    className={`p-2 md:px-10 rounded-lg border-2 transition-all duration-300 text-sm md:text-base ${bookingData.tripType === type.id
                      ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                      : "border-gray-200 hover:border-blue-300 dark:border-black dark:text-black"
                      }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* From & To */}
            {/* Mobile Layout (<768px) */}
            <div className="space-y-4 md:hidden">
              {/* From - Full width on mobile */}
              <div>
                <CityInput
                  label="From"
                  value={bookingData.from}
                  onChange={(val) => handleInputChange("from", val)}
                  placeholder="Enter pickup location"
                />
              </div>

              {/* To - Full width on mobile */}
              <div>
                <CityInput
                  label="To"
                  value={bookingData.to}
                  onChange={(val) => handleInputChange("to", val)}
                  placeholder="Enter destination location"
                />
              </div>

              {/* Trip Start and Trip End - Side by side on mobile ONLY when round-trip */}
              {bookingData.tripType === "round-trip" ? (
                <div className="grid grid-cols-2 gap-4">
                  {/* Trip Start */}
                  <div>
                    <div className="relative w-full">
                      <div className="relative flex items-center justify-center pl-2 border-2 border-gray-300 rounded-md w-full bg-white dark:bg-gray-800 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-400">
                        <div className="">
                          <Calendar className="w-5 h-5 text-gray-400" />
                        </div>
                        <DatePicker
                          selected={bookingData.date ? new Date(bookingData.date) : null}
                          onChange={(date) => {
                            handleInputChange("date", date?.toISOString() || "");
                          }}
                          showTimeSelect
                          timeFormat="hh:mm aa"
                          dateFormat="MMMM d, yyyy h:mm aa"
                          minDate={new Date()}
                          popperClassName="z-50" // ✅ ensures it appears above everything
                          popperPlacement="bottom-start" // ✅ opens properly below input
                          portalId="root-portal" // ✅ renders inside body instead of container
                          placeholderText="Trip start"
                          className="w-full pl-10 pr-2 h-[48px] rounded-md bg-transparent text-black dark:text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Trip End */}
                  <div>
                    <div className="relative w-full">
                      <div className="relative flex items-center justify-center pl-2 border-2 border-gray-300 rounded-md w-full bg-white dark:bg-gray-800 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-400">
                        <div className="">
                          <Calendar className="w-5 h-5 text-gray-400" />
                        </div>
                        <DatePicker
                          selected={bookingData.tripEndDate ? new Date(bookingData.tripEndDate) : null}
                          onChange={(date) => {
                            handleInputChange("tripEndDate", date?.toISOString() || "");
                          }}
                          showTimeSelect
                          timeFormat="hh:mm aa"
                          dateFormat="MMMM d, yyyy h:mm aa"
                          minDate={bookingData.date ? new Date(bookingData.date) : new Date()}
                          popperClassName="z-50" // ✅ ensures it appears above everything
                          popperPlacement="bottom-start" // ✅ opens properly below input
                          portalId="root-portal" // ✅ renders inside body instead of container
                          placeholderText="Trip End"
                          className="w-full pl-10 pr-2 h-[48px] rounded-md bg-transparent text-black dark:text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Trip Start - Full width on mobile when one-way */
                <div>
                  <div className="relative w-full">
                    <div className="relative flex items-center justify-center pl-2 border-2 border-gray-300 rounded-md w-full bg-white dark:bg-gray-800 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-400">
                      <div className="">
                        <Calendar className="w-5 h-5 text-gray-400" />
                      </div>
                      <DatePicker
                        selected={bookingData.date ? new Date(bookingData.date) : null}
                        onChange={(date) => {
                          handleInputChange("date", date?.toISOString() || "");
                        }}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        dateFormat="MMMM d, yyyy h:mm aa"
                        minDate={new Date()}
                        popperClassName="z-50" // ✅ ensures it appears above everything
                        popperPlacement="bottom-start" // ✅ opens properly below input
                        portalId="root-portal" // ✅ renders inside body instead of container
                        placeholderText="Trip start"
                        className="w-full pl-10 pr-2 h-[48px] rounded-md bg-transparent text-black dark:text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Number - Full width on mobile */}
              <div>
                <div className="relative w-full">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-20 pointer-events-none">
                    <Phone className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={bookingData.phone}
                    onChange={(e) =>
                      handleInputChange("phone", e.target.value)
                    }
                    className="w-full border-2 pl-10 pr-2 h-[48px] rounded-md
                               bg-white text-black placeholder-gray-500 border-gray-300
                               dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:border-gray-600
                               focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Mobile Number"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Desktop Layout (≥768px) - Original layout unchanged */}
            <div className={`hidden md:grid gap-4 ${bookingData.tripType === "round-trip" ? "lg:grid-cols-5" : "lg:grid-cols-4"} md:grid-cols-2`}>
              <div>
                <CityInput
                  label="From"
                  value={bookingData.from}
                  onChange={(val) => handleInputChange("from", val)}
                  placeholder="Enter pickup location"
                />
              </div>
              <div>
                <CityInput
                  label="To"
                  value={bookingData.to}
                  onChange={(val) => handleInputChange("to", val)}
                  placeholder="Enter destination location"
                />
              </div>

              <div>
                <div className="relative w-full">
                  <div className="relative flex items-center justify-center pl-2 border-2 border-gray-300 rounded-md w-full bg-white dark:bg-gray-800 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-400">
                    <div className="">
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <DatePicker
                      selected={bookingData.date ? new Date(bookingData.date) : null}
                      onChange={(date) => handleInputChange("date", date?.toISOString() || "")}
                      showTimeSelect
                      timeFormat="hh:mm aa"
                      dateFormat="MMMM d, yyyy h:mm aa"
                      minDate={new Date()}
                      placeholderText="Trip start"
                      popperClassName="z-50" // ✅ ensures it appears above everything
                      popperPlacement="bottom-start" // ✅ opens properly below input
                      portalId="root-portal" // ✅ renders inside body instead of container
                      className="w-full pl-10 pr-2 h-[48px] rounded-md bg-transparent text-black dark:text-white outline-none"
                    />

                  </div>
                </div>
              </div>

              {/* Trip End - Only show for Round Trip */}
              {bookingData.tripType === "round-trip" && (
                <div>
                  <div className="relative w-full">
                    <div className="relative flex items-center justify-center pl-2 border-2 border-gray-300 rounded-md w-full bg-white dark:bg-gray-800 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-400">
                      <div className="">
                        <Calendar className="w-5 h-5 text-gray-400" />
                      </div>
                      <DatePicker
                        selected={bookingData.tripEndDate ? new Date(bookingData.tripEndDate) : null}
                        onChange={(date) => {
                          handleInputChange("tripEndDate", date?.toISOString() || "");
                        }}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        dateFormat="MMMM d, yyyy h:mm aa"
                        minDate={bookingData.date ? new Date(bookingData.date) : new Date()}
                        placeholderText="Trip End"
                        popperClassName="z-50" // ✅ ensures it appears above everything
                        popperPlacement="bottom-start" // ✅ opens properly below input
                        portalId="root-portal" // ✅ renders inside body instead of container
                        className="w-full pl-10 pr-2 h-[48px] rounded-md bg-transparent text-black dark:text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="relative w-full">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-20 pointer-events-none">
                    <Phone className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    value={bookingData.phone}
                    onChange={(e) => {
                      handleInputChange("phone", e.target.value);
                    }}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) e.preventDefault();
                    }}

                    className="w-full border-2 pl-10 pr-2 h-[48px] rounded-md
                               bg-white text-black placeholder-gray-500 border-gray-300
                               dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:border-gray-600
                               focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Mobile Number"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 md:space-y-6">
            {/* Car Type Selection */}
            <div className="flex flex-col  justify-center items-center">
              <label className=" text-left text-sm font-semibold text-gray-700  mb-3">
                Select Car Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 max-sm:flex gap-3">
                {carTypes.map((car) => (
                  <button
                    key={car.id}
                    type="button"
                    onClick={() =>
                      handleInputChange("carType", car.id as any)
                    }
                    className={`p-3 md:px-10 rounded-lg border-2 transition-all duration-300 ${bookingData.carType === car.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                      }`}
                  >
                    <div className="flex flex-col gap-2 items-center justify-center">
                      <Image
                        src={car.image}
                        alt={car.name}
                        className="w-16 h-10 md:w-20 md:h-12 object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                          {car.name}
                        </h3>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 md:mt-8 text-center">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary text-base md:text-lg px-8 md:px-12 py-3 md:py-4 flex items-center space-x-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Confirm Booking</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

