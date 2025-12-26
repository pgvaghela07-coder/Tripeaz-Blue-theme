"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";
import { MapPin } from "lucide-react";
import { assest } from "../assest/assest";
import Image from "next/image";

export default function PopularDestinations() {
  const containerRef = useRef<HTMLDivElement>(null);

  const destinations = [
    { name: "Vadodara", image: assest.vadodara },
    { name: "Surat", image: assest.surat },
    { name: "Rajkot", image: assest.rajkot },
    { name: "Dwarka", image: assest.dwarka },
    { name: "Somnath", image: assest.somnath },
    { name: "Unity", image: assest.unity },
    { name: "Gir", image: assest.gir },
    { name: "Kutch", image: assest.kuch },
    { name: "Bhavnagar", image: assest.bhavnagar },
    { name: "Gandhinagar", image: assest.gandhinagr },
  ];

  useEffect(() => {
    if (containerRef.current) {
      // Set immediate visibility - no delay
      containerRef.current.style.opacity = '1';
    }
  }, []);

  return (
    <section className="py-8 bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden">
      <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 max-md:mb-5">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Popular Destinations
          </h2>
          {/* <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Explore the beautiful cities and tourist destinations across Gujarat
          </p> */}
        </div>

        {/* Scrollable Section */}
        <div className="relative overflow-hidden">
          <div className="flex  md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2 lg:-mx-8  lg:px-8">
            {destinations.map((destination, index) => (
              <div
                key={index}
                className="flex flex-col justify-center items-center gap-2 text-white "
                style={{ minWidth: '110px', width: '110px' }}
              >
                <Image
                  src={destination.image || ""}
                  alt={destination.name}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover"
                  width={96}
                  height={96}
                />
                <p className="text-center text-xs md:text-sm whitespace-nowrap">{destination.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Info Text */}
        {/* <div className="text-center mt-12">
          <p className="text-blue-100 text-lg">
            ✨ Book your ride to any destination across Gujarat
          </p>
        </div> */}
      </div>
    </section>
  );
}