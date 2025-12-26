"use client";

import { useEffect, useRef, useState } from "react";
import anime from "animejs";
import { Car, Fuel, Smile, TrendingUp } from "lucide-react";
import { useBookingModal } from "@/contexts/BookingModalContext";
import { assest } from "@/assest/assest";
import Image from "next/image";

export default function MemeSection() {
  const { openModal } = useBookingModal();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentMeme, setCurrentMeme] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const memeImages = [
    { src: assest.img1, alt: "Meme 1" },
    { src: assest.img2, alt: "Meme 2" },
    { src: assest.meme3, alt: "Meme 3" },
  ];

  const memes = [
    {
      text: "Why argue over fuel price? Just book Tripeaz 🚖",
      emoji: "⛽",
      icon: Fuel,
      color: "from-red-500 to-blue-500",
    },
    {
      text: "When you realize Tripeaz is cheaper than your car maintenance 💸",
      emoji: "😱",
      icon: Car,
      color: "from-green-500 to-blue-500",
    },
    {
      text: "Tripeaz drivers knowing every shortcut in Gujarat like: 🧠",
      emoji: "🗺️",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
    },
    {
      text: "Your face when Tripeaz arrives on time, every time 😎",
      emoji: "⏰",
      icon: Smile,
      color: "from-yellow-500 to-blue-500",
    },
  ];

  useEffect(() => {
    if (containerRef.current) {
      // Set immediate visibility - no delay
      containerRef.current.style.opacity = '1';
    }

    // Auto-rotate images every 3 seconds
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % memeImages.length);
    }, 3000);

    return () => clearInterval(imageInterval);
  }, [memeImages.length]);


  return (
    <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-blue-100 via-white to-blue-50">
      <div
        ref={containerRef}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            Travel Vibes 🚗✨
          </h2>

        </div>

        {/* Meme Banner */}
        <div className="relative ">
          <div className="relative z-10 overflow-hidden rounded-xl  ">
            <div className="relative h-[300px] sm:h-[300px] md:h-[400px] lg:h-[500px]  py-2 sm:py-4 md:py-7 overflow-hidden rounded-xl">
              <div
                className="flex h-full transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentImageIndex * 100}%)`,
                }}
              >
                {memeImages.map((image, index) => (
                  <div
                    key={index}
                    className="min-w-full w-full h-full flex-shrink-0 relative flex items-center justify-center px-2"
                  >
                    <div className="relative w-auto max-w-full h-full max-h-full flex items-center justify-center">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        className="max-w-full max-h-full w-auto h-auto object-contain rounded-xl border-2 border-blue-500"
                        style={{ borderRadius: '0.75rem' }}
                        width={1200}
                        height={600}
                        priority={index === 0}
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1200px"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-3 sm:mt-4">
              {memeImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${index === currentImageIndex
                      ? "w-6 sm:w-8 bg-blue-500"
                      : "w-1.5 sm:w-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-500 rounded-full animate-bounce-slow opacity-20"></div>
          <div
            className="absolute -bottom-4 -right-4 w-6 h-6 bg-blue-400 rounded-full animate-bounce-slow opacity-20"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <p className="text-center w-full mt-4 sm:mt-5 text-base sm:text-lg text-gray-600">
          Because traveling should be fun, not stressful!
        </p>

        {/* Fun Stats */}
        {/* <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">😊</div>
            <div className="text-sm font-medium text-gray-600">
              Happy Customers
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🚗</div>
            <div className="text-sm font-medium text-gray-600">Clean Cars</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-sm font-medium text-gray-600">
              5 Star Service
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-sm font-medium text-gray-600">On Time</div>
          </div>
        </div> */}

        {/* CTA */}
        <div className="text-center mt-6 sm:mt-8">
          <button
            onClick={openModal}
            className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
          >
            Join the Fun - Book Now! 🚖
          </button>
        </div>
      </div>
    </section>
  );
}
