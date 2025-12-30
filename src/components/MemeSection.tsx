"use client";

import { useEffect, useRef, useState } from "react";
import anime from "animejs";
import { Car, Fuel, Smile, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useBookingModal } from "@/contexts/BookingModalContext";
import { assest } from "@/assest/assest";
import Image from "next/image";

export default function MemeSection() {
  const { openModal } = useBookingModal();
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentMeme, setCurrentMeme] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const memeImages = [
    { src: assest.meme1, alt: "Meme 1" },
    { src: assest.meme2, alt: "Meme 2" },
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
  }, []);

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? memeImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % memeImages.length);
  };

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }
  };


  return (
    <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-blue-100 via-white to-blue-50">
      <div
        ref={containerRef}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-2xl max-md:mt-5 sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            Travel Vibes 🚗✨
          </h2>

        </div>

        {/* Meme Banner */}
        <div className="relative  ">
          <div className="relative z-10 overflow-hidden rounded-xl  ">
            <div 
              className="relative h-[280px] sm:h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-xl"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Left Arrow - Mobile: on image, Desktop: on side */}
              <button
                onClick={goToPrevious}
                className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-blue-600 hover:text-blue-700 rounded-full p-2 sm:p-3 shadow-lg transition-all duration-300 hover:scale-110"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Right Arrow - Mobile: on image, Desktop: on side */}
              <button
                onClick={goToNext}
                className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-blue-600 hover:text-blue-700 rounded-full p-2 sm:p-3 shadow-lg transition-all duration-300 hover:scale-110"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <div
                ref={sliderRef}
                className="flex h-full transition-transform duration-500 ease-in-out touch-pan-x"
                style={{
                  transform: `translateX(-${currentImageIndex * 100}%)`,
                }}
              >
                {memeImages.map((image, index) => (
                  <div
                    key={index}
                    className="min-w-full w-full h-full flex-shrink-0 relative flex items-center justify-center"
                  >
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                      <div className="rounded-xl border-2 border-blue-500 shadow-xl overflow-hidden inline-block max-w-full max-h-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={typeof image.src === 'string' ? image.src : image.src.src}
                          alt={image.alt}
                          className="rounded-xl block max-w-full max-h-full w-auto h-auto object-contain"
                          style={{ 
                            maxWidth: '100%',
                            maxHeight: '100%',
                            display: 'block'
                          }}
                        />
                      </div>
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
