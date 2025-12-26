"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import anime from "animejs";
import { useBookingModal } from "@/contexts/BookingModalContext";
import BookingFormContent from "./BookingFormContent";

export default function BookingModal() {
  const { isOpen, closeModal } = useBookingModal();
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, closeModal]);

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

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto py-4 md:py-8"
      onClick={closeModal}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] md:max-h-[90vh] overflow-hidden flex flex-col my-auto mx-4 min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
            Book Your Ride
          </h2>
          <button
            onClick={closeModal}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <BookingFormContent onSuccess={closeModal} />
        </div>
      </div>
    </div>
  );
}
