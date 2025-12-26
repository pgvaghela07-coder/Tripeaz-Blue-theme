"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";
import HeroSection from "@/components/HeroSection";
import BookingForm from "@/components/BookingForm";
import PopularDestinations from "@/components/PopularDestinations";
import OurServices from "@/components/OurServices";
import MemeSection from "@/components/MemeSection";
import HowItWorks from "@/components/HowItWorks";
import WhyTravelWithUs from "@/components/WhyTravelWithUs";
import CommunitySection from "@/components/CommunitySection";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import TrustSection from "@/components/TrustSection";

export default function Home() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize animations when page loads - instant display, no delays
    if (pageRef.current) {
      // Set initial opacity to 1 for immediate visibility
      const children = Array.from(pageRef.current.children) as HTMLElement[];
      children.forEach(child => {
        child.style.opacity = '1';
      });
      
      // Optional: Subtle animation without delay
      anime({
        targets: pageRef.current.children,
        opacity: [1, 1],
        translateY: [0, 0],
        duration: 0,
        easing: "easeOutExpo",
      });
    }
  }, []);

  return (
    <div ref={pageRef} className=" bg-white">
      <Navigation />
      <BookingForm />
      {/* <HeroSection /> */}
      <PopularDestinations />
      {/* <OurServices /> */}
      <MemeSection />
      {/* <HowItWorks /> */}
       {/* <WhyTravelWithUs />  */}
      <TrustSection/>
      {/* <CommunitySection /> */}
      <Footer />
    </div>
  );
}
