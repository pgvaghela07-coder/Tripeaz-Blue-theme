"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";
import { Shield, DollarSign, Car, MapPin, Clock, Phone } from "lucide-react";
import { useBookingModal } from "@/contexts/BookingModalContext";

export default function WhyTravelWithUs() {
  const containerRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const { openModal } = useBookingModal();

  const features = [
    {
      icon: Shield,
      title: "Experienced & Verified Drivers",
      description:
        "All our drivers are background verified, experienced, and trained to provide the best service.",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: DollarSign,
      title: "Transparent Pricing, No Hidden Charges",
      description:
        "Know exactly what you're paying for with our upfront pricing and no surprise charges.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Car,
      title: "Comfortable Rides with AC Cars",
      description:
        "Travel in comfort with our well-maintained, air-conditioned fleet of modern vehicles.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: MapPin,
      title: "Coverage Across All Major Cities",
      description:
        "We serve all major cities and tourist destinations across Gujarat with reliable service.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Shield,
      title: "Safe & Reliable Service",
      description:
        "Your safety is our priority with GPS tracking, emergency support, and secure payment options.",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: Clock,
      title: "24x7 Availability",
      description:
        "Round-the-clock service availability for your convenience, whether it's early morning or late night.",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  useEffect(() => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current.children[0],
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        easing: "easeOutExpo",
      });

      if (featuresRef.current) {
        anime({
          targets: featuresRef.current.children,
          opacity: [0, 1],
          translateY: [50, 0],
          duration: 800,
          delay: anime.stagger(150, { start: 300 }),
          easing: "easeOutExpo",
        });
      }
    }
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div
        ref={containerRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Travel With Us?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We're committed to providing you with the best taxi service
            experience in Gujarat. Here's what makes us your preferred choice
            for travel.
          </p>
        </div>

        {/* Features Grid */}
        <div
          ref={featuresRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className={`${feature.bgColor} rounded-2xl p-8 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group`}
              >
                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <IconComponent className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect */}
                <div className="mt-6">
                  <div className="w-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 group-hover:w-full transition-all duration-500"></div>
                </div>
              </div>
            );
          })}
        </div>

       
      </div>
    </section>
  );
}
