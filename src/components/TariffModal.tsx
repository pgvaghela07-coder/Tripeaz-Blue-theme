"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import anime from "animejs";

interface TariffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TariffModal({ isOpen, onClose }: TariffModalProps) {
  const [activeTab, setActiveTab] = useState<"one-way" | "round-trip">("one-way");
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Add custom scrollbar styles
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const styleId = 'tariff-modal-scrollbar-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          .tariff-modal-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .tariff-modal-scroll::-webkit-scrollbar-track {
            background: #f5f5f5;
            border-radius: 4px;
          }
          .tariff-modal-scroll::-webkit-scrollbar-thumb {
            background: #f97316;
            border-radius: 4px;
          }
          .tariff-modal-scroll::-webkit-scrollbar-thumb:hover {
            background: #ea580c;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Animate modal entrance
      if (modalRef.current && backdropRef.current) {
        anime({
          targets: backdropRef.current,
          opacity: [0, 1],
          duration: 300,
          easing: "easeOutExpo",
        });
        anime({
          targets: modalRef.current,
          opacity: [0, 1],
          scale: [0.9, 1],
          duration: 300,
          easing: "easeOutExpo",
        });
      }
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const oneWayTariff = [
    { carType: "Hatchback", price: "₹11 / km" },
    { carType: "Sedan", price: "₹13 / km" },
    { carType: "SUV", price: "₹15 / km" },
  ];

  const roundTripTariff = [
    { carType: "Hatchback", price: "₹9 / km" },
    { carType: "Sedan", price: "₹11 / km" },
    { carType: "SUV", price: "₹13 / km" },
  ];

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto py-4 md:py-8"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] md:max-h-[90vh] my-auto overflow-hidden flex flex-col mx-4 min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
            Tariff Plans
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("one-way")}
            className={`flex-1 px-4 md:px-6 py-3 md:py-4 text-sm md:text-base text-center font-semibold transition-all duration-300 ${
              activeTab === "one-way"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            }`}
          >
            One-way
          </button>
          <button
            onClick={() => setActiveTab("round-trip")}
            className={`flex-1 px-4 md:px-6 py-3 md:py-4 text-sm md:text-base text-center font-semibold transition-all duration-300 ${
              activeTab === "round-trip"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            }`}
          >
            Round Trip
          </button>
        </div>

        {/* Content */}
        <div 
          className="flex-1 overflow-y-auto p-4 md:p-6 overscroll-contain tariff-modal-scroll" 
          style={{ 
            scrollbarWidth: 'thin', 
            scrollbarColor: '#f97316 #f5f5f5'
          }}
        >
          {activeTab === "one-way" ? (
            <div className="space-y-6">
              {/* One-way Tariff Table - Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-500 to-blue-600">
                      <th className="px-6 py-4 text-left text-white font-semibold text-lg">
                        Car Type
                      </th>
                      <th className="px-6 py-4 text-left text-white font-semibold text-lg">
                        Price per KM
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {oneWayTariff.map((item, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors ${
                          index === oneWayTariff.length - 1 ? "border-b-0" : ""
                        }`}
                      >
                        <td className="px-6 py-4 text-gray-800 font-medium">
                          {item.carType}
                        </td>
                        <td className="px-6 py-4 text-blue-600 font-semibold text-lg">
                          {item.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* One-way Tariff Cards - Mobile */}
              <div className="md:hidden space-y-4">
                {oneWayTariff.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-md"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-semibold text-base">
                        {item.carType}
                      </span>
                      <span className="text-blue-600 font-bold text-lg">
                        {item.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Common Note */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-semibold text-blue-600">*</span> Tariff does not include toll, parking, and other extra charges. Customers must pay these separately.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Round Trip Tariff Table - Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-500 to-blue-600">
                      <th className="px-6 py-4 text-left text-white font-semibold text-lg">
                        Car Type
                      </th>
                      <th className="px-6 py-4 text-left text-white font-semibold text-lg">
                        Round Trip Price per KM
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {roundTripTariff.map((item, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors ${
                          index === roundTripTariff.length - 1 ? "border-b-0" : ""
                        }`}
                      >
                        <td className="px-6 py-4 text-gray-800 font-medium">
                          {item.carType}
                        </td>
                        <td className="px-6 py-4 text-blue-600 font-semibold text-lg">
                          {item.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Round Trip Tariff Cards - Mobile */}
              <div className="md:hidden space-y-4">
                {roundTripTariff.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-md"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-semibold text-base">
                        {item.carType}
                      </span>
                      <span className="text-blue-600 font-bold text-lg">
                        {item.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Round Trip Notes */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg space-y-2">
                <p className="text-sm font-semibold text-gray-800 mb-2">Notes:</p>
                <ul className="space-y-1 text-sm text-gray-700 leading-relaxed">
                  <li>• Minimum 300 km per day will be counted</li>
                  <li>• After 8 PM, night charges apply</li>
                  <li>• Every night will count as DA (Driver Allowance)</li>
                  <li>• Tariff does NOT include toll, parking, border tax, or other extra charges—these must be paid by the customer</li>
                </ul>
              </div>

              {/* Common Note */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-semibold text-blue-600">*</span> Tariff does not include toll, parking, and other extra charges. Customers must pay these separately.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
