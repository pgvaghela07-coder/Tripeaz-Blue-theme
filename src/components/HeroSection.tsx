"use client";

import { useEffect, useRef, useState } from "react";
import anime from "animejs";
import { ArrowRight, MapPin, Clock, Users } from "lucide-react";
import TariffModal from "./TariffModal";
import { useBookingModal } from "@/contexts/BookingModalContext";

export default function HeroSection() {
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
  const { openModal } = useBookingModal();
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate hero elements on mount
    if (heroRef.current) {
      anime({
        targets: headlineRef.current,
        opacity: [0, 1],
        translateY: [50, 0],
        duration: 1000,
        easing: "easeOutExpo",
      });

      anime({
        targets: subheadlineRef.current,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        delay: 300,
        easing: "easeOutExpo",
      });

      anime({
        targets: ctaRef.current?.children,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        delay: anime.stagger(200, { start: 600 }),
        easing: "easeOutExpo",
      });

      // Floating animation for icons
      anime({
        targets: ".floating-icon",
        translateY: [0, -20, 0],
        duration: 3000,
        loop: true,
        easing: "easeInOutSine",
        delay: anime.stagger(500),
      });
    }
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 floating-icon">
          <MapPin className="w-16 h-16 text-blue-600" />
        </div>
        <div className="absolute top-40 right-20 floating-icon">
          <Clock className="w-12 h-12 text-blue-500" />
        </div>
        <div className="absolute bottom-40 left-20 floating-icon">
          <Users className="w-14 h-14 text-blue-400" />
        </div>
        <div className="absolute top-60 left-1/2 floating-icon">
          <MapPin className="w-10 h-10 text-blue-300" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1
            ref={headlineRef}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Book Your Ride with{" "}
            <span className="text-gradient">Tripeaz</span>
            <br />
            <span className="text-2xl md:text-4xl lg:text-5xl text-gray-700 font-semibold">
              Reliable, Affordable & Comfortable
            </span>
          </h1>

          {/* Subheadline */}
          <p
            ref={subheadlineRef}
            className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            One-way, Round Trip, and Airport Rides across Gujarat. Experience
            the best taxi service with professional drivers and transparent
            pricing.
          </p>

          {/* CTA Buttons */}
          <div
            ref={ctaRef}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <button
              onClick={openModal}
              className="btn-primary text-lg px-8 py-4 flex items-center space-x-2 group"
            >
              <span>Book Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setIsTariffModalOpen(true)}
              className="btn-secondary text-lg px-8 py-4"
            >
              View Tariff Plans
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                10K+
              </div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                500+
              </div>
              <div className="text-gray-600">Verified Drivers</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                24/7
              </div>
              <div className="text-gray-600">Customer Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" className="w-full h-16 fill-white">
          <path d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,96C960,107,1056,117,1152,112C1248,107,1344,85,1392,74.7L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
        </svg>
      </div>

      {/* Tariff Modal */}
      <TariffModal
        isOpen={isTariffModalOpen}
        onClose={() => setIsTariffModalOpen(false)}
      />
    </section>
  );
}
