"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";
import {
  Instagram,
  Play,
  Apple,
  Heart,
  MapPin,
  Mountain,
  Camera,
} from "lucide-react";

export default function CommunitySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const monumentsRef = useRef<HTMLDivElement>(null);

  const monuments = [
    { name: "Somnath", icon: "🕉️", position: "top-20 left-20" },
    { name: "Gir", icon: "🦁", position: "top-40 right-32" },
    { name: "Statue of Unity", icon: "🗿", position: "bottom-32 left-32" },
    { name: "Kutch", icon: "🏜️", position: "bottom-20 right-20" },
    { name: "Dwarka", icon: "🛕", position: "top-32 left-1/2" },
    { name: "Pavagadh", icon: "⛰️", position: "bottom-40 left-16" },
  ];

  useEffect(() => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current.children,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        delay: anime.stagger(200),
        easing: "easeOutExpo",
      });
    }

    // Animate monuments
    if (monumentsRef.current) {
      anime({
        targets: monumentsRef.current.children,
        scale: [0, 1],
        rotate: [0, 360],
        duration: 1000,
        delay: anime.stagger(200, { start: 1000 }),
        easing: "easeOutElastic(1, .8)",
      });
    }
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white rounded-full blur-3xl"></div>
      </div>

      {/* Gujarat Map with Monuments */}
      <div className="absolute inset-0 opacity-20">
        <div ref={monumentsRef} className="relative w-full h-full">
          {monuments.map((monument, index) => (
            <div
              key={index}
              className={`absolute ${monument.position} transform -translate-x-1/2 -translate-y-1/2`}
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 shadow-lg">
                <span className="text-2xl">{monument.icon}</span>
              </div>
              <div className="text-white text-xs font-medium text-center mt-2 opacity-80">
                {monument.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        ref={containerRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        {/* Main Content */}
        <div className="text-center text-white mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tripeaz is making outstation travel better – for all of us.
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            We love ideas, suggestions & contributions. Join our growing
            community of travelers and be part of the journey that's
            transforming travel in Gujarat.
          </p>
        </div>

        {/* Community Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Instagram Community */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Instagram className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Join Our Instagram Community
            </h3>
            <p className="text-blue-100 mb-6">
              Follow us for travel tips, behind-the-scenes content, and amazing
              Gujarat destinations
            </p>
            <button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2 mx-auto">
              <Instagram className="w-5 h-5" />
              <span>Follow @GujaratTaxi</span>
            </button>
          </div>

          {/* App Download */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Play className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Download Our App
            </h3>
            <p className="text-blue-100 mb-6">
              Get the Tripeaz app for easier booking, real-time tracking,
              and exclusive offers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
                <Apple className="w-5 h-5" />
                <span>App Store</span>
              </button>
              <button className="bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Google Play</span>
              </button>
            </div>
          </div>
        </div>

        {/* Community Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">
              Share Your Journey
            </h4>
            <p className="text-blue-100 text-sm">
              Post your travel photos and tag us
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">
              Discover Places
            </h4>
            <p className="text-blue-100 text-sm">
              Find hidden gems across Gujarat
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">
              Connect & Share
            </h4>
            <p className="text-blue-100 text-sm">
              Join our community of travelers
            </p>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="w-6 h-6 text-white" />
              <span className="text-2xl font-bold text-white">
                Experience Crafted with ❤️
              </span>
              <Heart className="w-6 h-6 text-white" />
            </div>
            <p className="text-xl text-blue-100 font-medium">
              in Gujarat, India
            </p>
            <div className="mt-4 text-blue-200">
              <p className="text-sm">
                Owned & managed by{" "}
                <span className="font-semibold">Wolfron Technologies LLP</span>
              </p>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-4 h-4 bg-white/30 rounded-full animate-pulse"></div>
        <div
          className="absolute bottom-20 left-20 w-6 h-6 bg-white/20 rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 right-10 w-3 h-3 bg-white/40 rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>
    </section>
  );
}
