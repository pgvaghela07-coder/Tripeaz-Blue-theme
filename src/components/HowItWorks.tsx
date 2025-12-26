"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";
import { MapPin, Car, CreditCard, Route } from "lucide-react";
import { useBookingModal } from "@/contexts/BookingModalContext";

export default function HowItWorks() {
  const { openModal } = useBookingModal();
  const containerRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      number: "01",
      icon: MapPin,
      title: "Choose Your Trip",
      description:
        "Select from One-way, Round Trip, or Airport transfer options",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      number: "02",
      icon: Car,
      title: "Select Your Car",
      description: "Pick from Sedan, SUV, or Hatchback based on your needs",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
    },
    {
      number: "03",
      icon: CreditCard,
      title: "Confirm & Pay",
      description: "Get instant booking confirmation with transparent pricing",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      number: "04",
      icon: Route,
      title: "Travel Hassle-Free",
      description:
        "Enjoy your journey with professional drivers and comfortable rides",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
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

      if (stepsRef.current) {
        anime({
          targets: stepsRef.current.children,
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
    <section className="py-20 bg-gradient-to-br from-white to-gray-50">
      <div
        ref={containerRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Booking your ride with Tripeaz is simple and straightforward.
            Follow these 4 easy steps to get started.
          </p>
        </div>

        {/* Steps */}
        <div ref={stepsRef} className="relative">
          {/* Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-green-200 via-purple-200 to-blue-200"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="relative group">
                  {/* Step Card */}
                  <div
                    className={`${step.bgColor} rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group-hover:scale-105`}
                  >
                    {/* Step Number */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}
                      >
                        <span className="text-white font-bold text-lg">
                          {step.number}
                        </span>
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="mt-8 mb-6">
                      <div
                        className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Arrow (Mobile) */}
                    {index < steps.length - 1 && (
                      <div className="lg:hidden flex justify-center mt-6">
                        <div className="w-6 h-6 border-r-2 border-b-2 border-gray-300 transform rotate-45"></div>
                      </div>
                    )}
                  </div>

                  {/* Connection Line (Mobile) */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-300 transform translate-y-1/2"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 md:p-12">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust Tripeaz for
              their travel needs. Book now and experience the difference!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={openModal}
                className="btn-primary text-lg px-8 py-4"
              >
                Book Your Ride Now
              </button>
              <button className="btn-secondary text-lg px-8 py-4">
                Download Our App
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  10K+
                </div>
                <div className="text-sm text-gray-600">Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  500+
                </div>
                <div className="text-sm text-gray-600">Drivers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  50+
                </div>
                <div className="text-sm text-gray-600">Cities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  24/7
                </div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
