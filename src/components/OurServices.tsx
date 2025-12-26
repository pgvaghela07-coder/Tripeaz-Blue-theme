"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";
import { Car, MapPin, Plane, Building, Headphones } from "lucide-react";

export default function OurServices() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const services = [
    {
      icon: Car,
      title: "Chauffeur-driven Taxi Services",
      description:
        "Professional drivers with years of experience ensure a safe and comfortable journey.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: MapPin,
      title: "Outstation Trips & City Tours",
      description:
        "Explore Gujarat's beautiful destinations with our reliable outstation taxi services.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Plane,
      title: "Airport Pickup & Drop",
      description:
        "Timely airport transfers with flight tracking to ensure you never miss your flight.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Building,
      title: "Corporate & Business Travel",
      description:
        "Professional business travel solutions for corporate clients and executives.",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: Headphones,
      title: "24x7 Customer Support",
      description:
        "Round-the-clock customer support to assist you with all your travel needs.",
      color: "from-blue-500 to-blue-600",
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

      if (cardsRef.current) {
        anime({
          targets: cardsRef.current.children,
          opacity: [0, 1],
          translateY: [50, 0],
          duration: 800,
          delay: anime.stagger(200, { start: 300 }),
          easing: "easeOutExpo",
        });
      }
    }
  }, []);

  return (
    <section
      id="services"
      className="py-20 bg-gradient-to-br from-gray-50 to-white"
    >
      <div
        ref={containerRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive taxi services designed to meet all your travel needs
            across Gujarat. From city rides to outstation trips, we've got you
            covered.
          </p>
        </div>

        {/* Services Grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={index}
                className="card p-8 group hover:shadow-2xl transition-all duration-500"
              >
                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>

                {/* Hover Effect */}
                <div className="mt-6">
                  <div className="w-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 group-hover:w-full transition-all duration-500"></div> 
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Features */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 md:p-12">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Services?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">✓</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Verified Drivers
                </h4>
                <p className="text-gray-600 text-sm">
                  All drivers are background verified and experienced
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">₹</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Transparent Pricing
                </h4>
                <p className="text-gray-600 text-sm">
                  No hidden charges, pay only for what you use
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">🚗</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Well Maintained Fleet
                </h4>
                <p className="text-gray-600 text-sm">
                  Modern, clean, and well-maintained vehicles
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
