"use client";

import { useEffect, useRef, useState } from "react";
import anime from "animejs";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { assest } from "@/assest/assest";

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);
  const [routesPreview, setRoutesPreview] = useState<
    { _id: string; name: string; url: string }[]
  >([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  const footerLinks = {
    quickLinks: [
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms of Service", href: "/terms-of-service" },
      { name: "Cancellation Policy", href: "/cancellation-policy" },
      { name: "Refund Policy", href: "/refund-policy" },
      { name: "Book a Ride", href: "#booking" },
      { name: "Contact", href: "#contact" },
    ],
    services: [
      { name: "One Way Taxi", href: "#" },
      { name: "Round Trip Taxi", href: "#" },
      { name: "Airport Transfer", href: "#" },
      { name: "Outstation Travel", href: "#" },
    ],
    popularRoutes: [
      // Ahmedabad Routes
      { name: "Ahmedabad to Rajkot", href: "#" },
      { name: "Ahmedabad to Vadodara", href: "#" },
      { name: "Ahmedabad to Surat", href: "#" },
      { name: "Ahmedabad to Bhavnagar", href: "#" },
      { name: "Ahmedabad to Jamnagar", href: "#" },
      { name: "Ahmedabad to Dwarka", href: "#" },
      { name: "Ahmedabad to Somnath", href: "#" },
      { name: "Ahmedabad to Junagadh", href: "#" },
      { name: "Ahmedabad to Porbandar", href: "#" },
      { name: "Ahmedabad to Gandhinagar", href: "#" },
      { name: "Ahmedabad to Mehsana", href: "#" },
      { name: "Ahmedabad to Patan", href: "#" },
      { name: "Ahmedabad to Palanpur", href: "#" },
      { name: "Ahmedabad to Bhuj", href: "#" },
      { name: "Ahmedabad to Kutch", href: "#" },
      { name: "Ahmedabad to Anjar", href: "#" },
      { name: "Ahmedabad to Diu", href: "#" },
      { name: "Ahmedabad to Anand", href: "#" },
      { name: "Ahmedabad to Nadiad", href: "#" },
      { name: "Ahmedabad to Bharuch", href: "#" },
      { name: "Ahmedabad to Navsari", href: "#" },
      { name: "Ahmedabad to Valsad", href: "#" },
      { name: "Ahmedabad to Morbi", href: "#" },
      { name: "Ahmedabad to Surendranagar", href: "#" },
      { name: "Ahmedabad to Botad", href: "#" },
      { name: "Ahmedabad to Amreli", href: "#" },
      { name: "Ahmedabad to Veraval", href: "#" },
      { name: "Ahmedabad to Gondal", href: "#" },
      { name: "Ahmedabad to Jetpur", href: "#" },
      { name: "Ahmedabad to Dahod", href: "#" },
      { name: "Ahmedabad to Godhra", href: "#" },
      { name: "Ahmedabad to Himmatnagar", href: "#" },
      { name: "Ahmedabad to Modasa", href: "#" },
      { name: "Ahmedabad to Bardoli", href: "#" },
      { name: "Ahmedabad to Vyara", href: "#" },
      { name: "Ahmedabad to Mangrol", href: "#" },
      { name: "Ahmedabad to Una", href: "#" },
      { name: "Ahmedabad to Keshod", href: "#" },
      { name: "Ahmedabad to Mandvi", href: "#" },
      
      // Surat Routes
      { name: "Surat to Rajkot", href: "#" },
      { name: "Surat to Vadodara", href: "#" },
      { name: "Surat to Bhavnagar", href: "#" },
      { name: "Surat to Jamnagar", href: "#" },
      { name: "Surat to Dwarka", href: "#" },
      { name: "Surat to Somnath", href: "#" },
      { name: "Surat to Junagadh", href: "#" },
      { name: "Surat to Porbandar", href: "#" },
      { name: "Surat to Gandhinagar", href: "#" },
      { name: "Surat to Mehsana", href: "#" },
      { name: "Surat to Bhuj", href: "#" },
      { name: "Surat to Anand", href: "#" },
      { name: "Surat to Nadiad", href: "#" },
      { name: "Surat to Bharuch", href: "#" },
      { name: "Surat to Navsari", href: "#" },
      { name: "Surat to Valsad", href: "#" },
      { name: "Surat to Morbi", href: "#" },
      { name: "Surat to Botad", href: "#" },
      { name: "Surat to Amreli", href: "#" },
      { name: "Surat to Veraval", href: "#" },
      { name: "Surat to Gondal", href: "#" },
      { name: "Surat to Jetpur", href: "#" },
      { name: "Surat to Bardoli", href: "#" },
      { name: "Surat to Vyara", href: "#" },
      { name: "Surat to Mangrol", href: "#" },
      
      // Vadodara Routes
      { name: "Vadodara to Rajkot", href: "#" },
      { name: "Vadodara to Bhavnagar", href: "#" },
      { name: "Vadodara to Jamnagar", href: "#" },
      { name: "Vadodara to Dwarka", href: "#" },
      { name: "Vadodara to Somnath", href: "#" },
      { name: "Vadodara to Junagadh", href: "#" },
      { name: "Vadodara to Porbandar", href: "#" },
      { name: "Vadodara to Gandhinagar", href: "#" },
      { name: "Vadodara to Mehsana", href: "#" },
      { name: "Vadodara to Bhuj", href: "#" },
      { name: "Vadodara to Anand", href: "#" },
      { name: "Vadodara to Nadiad", href: "#" },
      { name: "Vadodara to Bharuch", href: "#" },
      { name: "Vadodara to Navsari", href: "#" },
      { name: "Vadodara to Morbi", href: "#" },
      { name: "Vadodara to Botad", href: "#" },
      { name: "Vadodara to Amreli", href: "#" },
      { name: "Vadodara to Veraval", href: "#" },
      { name: "Vadodara to Gondal", href: "#" },
      { name: "Vadodara to Jetpur", href: "#" },
      { name: "Vadodara to Godhra", href: "#" },
      { name: "Vadodara to Dahod", href: "#" },
      { name: "Vadodara to Himmatnagar", href: "#" },
      
      // Rajkot Routes
      { name: "Rajkot to Dwarka", href: "#" },
      { name: "Rajkot to Somnath", href: "#" },
      { name: "Rajkot to Junagadh", href: "#" },
      { name: "Rajkot to Porbandar", href: "#" },
      { name: "Rajkot to Bhavnagar", href: "#" },
      { name: "Rajkot to Jamnagar", href: "#" },
      { name: "Rajkot to Gandhinagar", href: "#" },
      { name: "Rajkot to Mehsana", href: "#" },
      { name: "Rajkot to Bhuj", href: "#" },
      { name: "Rajkot to Morbi", href: "#" },
      { name: "Rajkot to Surendranagar", href: "#" },
      { name: "Rajkot to Botad", href: "#" },
      { name: "Rajkot to Amreli", href: "#" },
      { name: "Rajkot to Veraval", href: "#" },
      { name: "Rajkot to Gondal", href: "#" },
      { name: "Rajkot to Jetpur", href: "#" },
      { name: "Rajkot to Keshod", href: "#" },
      { name: "Rajkot to Una", href: "#" },
      
      // Routes to Nearby States
      { name: "Ahmedabad to Mumbai", href: "#" },
      { name: "Ahmedabad to Pune", href: "#" },
      { name: "Ahmedabad to Nashik", href: "#" },
      { name: "Ahmedabad to Udaipur", href: "#" },
      { name: "Ahmedabad to Mount Abu", href: "#" },
      { name: "Ahmedabad to Jodhpur", href: "#" },
      { name: "Ahmedabad to Indore", href: "#" },
      { name: "Ahmedabad to Bhopal", href: "#" },
      { name: "Ahmedabad to Daman", href: "#" },
      { name: "Surat to Mumbai", href: "#" },
      { name: "Surat to Pune", href: "#" },
      { name: "Surat to Nashik", href: "#" },
      { name: "Surat to Daman", href: "#" },
      { name: "Surat to Silvassa", href: "#" },
      { name: "Vadodara to Mumbai", href: "#" },
      { name: "Vadodara to Pune", href: "#" },
      { name: "Vadodara to Nashik", href: "#" },
      { name: "Vadodara to Indore", href: "#" },
      { name: "Vadodara to Bhopal", href: "#" },
      { name: "Vadodara to Udaipur", href: "#" },
      { name: "Rajkot to Mumbai", href: "#" },
      { name: "Rajkot to Pune", href: "#" },
      { name: "Rajkot to Udaipur", href: "#" },
      { name: "Rajkot to Mount Abu", href: "#" },
      { name: "Bhavnagar to Mumbai", href: "#" },
      { name: "Bhavnagar to Udaipur", href: "#" },
      { name: "Jamnagar to Mumbai", href: "#" },
      { name: "Jamnagar to Udaipur", href: "#" },
      { name: "Bhuj to Mumbai", href: "#" },
      { name: "Bhuj to Udaipur", href: "#" },
      { name: "Bhuj to Jaisalmer", href: "#" },
      { name: "Gandhinagar to Mumbai", href: "#" },
      { name: "Gandhinagar to Udaipur", href: "#" },
      { name: "Gandhinagar to Mount Abu", href: "#" },
      { name: "Mehsana to Udaipur", href: "#" },
      { name: "Palanpur to Udaipur", href: "#" },
      { name: "Palanpur to Mount Abu", href: "#" },
      { name: "Palanpur to Jodhpur", href: "#" },
      { name: "Dahod to Indore", href: "#" },
      { name: "Dahod to Bhopal", href: "#" },
      { name: "Godhra to Indore", href: "#" },
      { name: "Godhra to Bhopal", href: "#" },
      { name: "Anand to Mumbai", href: "#" },
      { name: "Nadiad to Mumbai", href: "#" },
      { name: "Bharuch to Mumbai", href: "#" },
      { name: "Bharuch to Pune", href: "#" },
      { name: "Navsari to Mumbai", href: "#" },
      { name: "Navsari to Daman", href: "#" },
      { name: "Valsad to Mumbai", href: "#" },
      { name: "Valsad to Daman", href: "#" },
      { name: "Valsad to Silvassa", href: "#" },
      
      // Additional Inter-city Routes
      { name: "Bhavnagar to Rajkot", href: "#" },
      { name: "Bhavnagar to Jamnagar", href: "#" },
      { name: "Bhavnagar to Dwarka", href: "#" },
      { name: "Bhavnagar to Somnath", href: "#" },
      { name: "Jamnagar to Dwarka", href: "#" },
      { name: "Jamnagar to Porbandar", href: "#" },
      { name: "Junagadh to Dwarka", href: "#" },
      { name: "Junagadh to Somnath", href: "#" },
      { name: "Junagadh to Porbandar", href: "#" },
      { name: "Dwarka to Somnath", href: "#" },
      { name: "Dwarka to Porbandar", href: "#" },
      { name: "Somnath to Porbandar", href: "#" },
      { name: "Gandhinagar to Mehsana", href: "#" },
      { name: "Gandhinagar to Patan", href: "#" },
      { name: "Mehsana to Patan", href: "#" },
      { name: "Mehsana to Palanpur", href: "#" },
      { name: "Patan to Palanpur", href: "#" },
      { name: "Anand to Nadiad", href: "#" },
      { name: "Anand to Vadodara", href: "#" },
      { name: "Bharuch to Surat", href: "#" },
      { name: "Bharuch to Vadodara", href: "#" },
      { name: "Navsari to Surat", href: "#" },
      { name: "Valsad to Surat", href: "#" },
      { name: "Morbi to Rajkot", href: "#" },
      { name: "Morbi to Jamnagar", href: "#" },
      { name: "Surendranagar to Rajkot", href: "#" },
      { name: "Surendranagar to Ahmedabad", href: "#" },
      { name: "Botad to Bhavnagar", href: "#" },
      { name: "Botad to Rajkot", href: "#" },
      { name: "Amreli to Rajkot", href: "#" },
      { name: "Amreli to Bhavnagar", href: "#" },
      { name: "Veraval to Junagadh", href: "#" },
      { name: "Veraval to Somnath", href: "#" },
      { name: "Gondal to Rajkot", href: "#" },
      { name: "Jetpur to Rajkot", href: "#" },
      { name: "Dahod to Vadodara", href: "#" },
      { name: "Dahod to Ahmedabad", href: "#" },
      { name: "Godhra to Vadodara", href: "#" },
      { name: "Godhra to Ahmedabad", href: "#" },
      { name: "Himmatnagar to Ahmedabad", href: "#" },
      { name: "Himmatnagar to Udaipur", href: "#" },
      { name: "Palanpur to Ahmedabad", href: "#" },
      { name: "Bhuj to Gandhidham", href: "#" },
      { name: "Bhuj to Mandvi", href: "#" },
      { name: "Anjar to Bhuj", href: "#" },
      { name: "Anjar to Gandhidham", href: "#" },
      { name: "Diu to Veraval", href: "#" },
      { name: "Diu to Somnath", href: "#" },
      { name: "Diu to Junagadh", href: "#" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms of Service", href: "/terms-of-service" },
      { name: "Cancellation Policy", href: "/cancellation-policy" },
      { name: "Refund Policy", href: "/refund-policy" },
    ],
    popularCities: [
      "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar",
      "Gandhinagar", "Junagadh", "Dwarka", "Somnath", "Porbandar", "Bhuj",
      "Mehsana", "Palanpur", "Patan", "Anjar", "Kutch", "Diu", "Anand",
      "Nadiad", "Bharuch", "Navsari", "Valsad", "Morbi", "Surendranagar",
      "Botad", "Amreli", "Veraval", "Gondal", "Jetpur", "Dahod", "Godhra",
      "Himmatnagar", "Modasa", "Bardoli", "Vyara", "Mangrol", "Una"
    ],
    airports: [
      "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Bhuj",
      "Kandla", "Porbandar", "Jamnagar", "Gandhinagar", "Mehsana", 
      "Junagadh", "Dwarka", "Somnath", "Anand", "Bharuch", "Navsari", 
      "Valsad", "Morbi", "Surendranagar", "Amreli", "Veraval", "Gondal", 
      "Jetpur", "Dahod", "Godhra", "Himmatnagar", "Palanpur", "Patan", 
      "Anjar", "Kutch", "Diu", "Nadiad", "Botad", "Mumbai"
    ],
  };

  const socialLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      href: "#",
      color: "hover:text-blue-600",
    },
    { name: "Twitter", icon: Twitter, href: "#", color: "hover:text-blue-400" },
    {
      name: "Instagram",
      icon: Instagram,
      href: "#",
      color: "hover:text-pink-600",
    },
    { name: "YouTube", icon: Youtube, href: "#", color: "hover:text-red-600" },
  ];

  useEffect(() => {
    if (footerRef.current) {
      anime({
        targets: footerRef.current.children,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        delay: anime.stagger(100),
        easing: "easeOutExpo",
      });
    }
  }, []);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoadingRoutes(true);
        const res = await fetch("/api/routes", { cache: "no-store" });
        const data = await res.json();
        if (data?.success && Array.isArray(data.routes)) {
          // show only top 6 in footer for brevity
          setRoutesPreview(data.routes.slice(0, 6));
        } else {
          setRoutesPreview([]);
        }
      } catch (error) {
        console.error("Footer routes fetch failed:", error);
        setRoutesPreview([]);
      } finally {
        setLoadingRoutes(false);
      }
    };
    fetchRoutes();
  }, []);

  const buildRouteHref = (url: string) => {
    if (!url) return "#";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/")) return url;
    return `/route/${url}`;
  };

  return (
    <footer id="contact" className="bg-gray-900 text-white">
      <div ref={footerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            
            {/* <div className="lg:col-span-2"> */}
              {/* <div className="flex items-center space-x-2 py-3 ">
                <div>
                  <Image src={assest.logo} alt="" className="w-12 h-10 object-cover" />
                </div>
                <div className="">
                  <h1 className="leading-7 text-xl font-semibold text-[#98561f]" style={{ fontFamily: "serif" }}>Tripeaz</h1>
                  <p className="text-md text-[#98561f] font-semibold " style={{ fontFamily: "serif" }}>
                    Khushboo Gujarat Ki
                  </p>
                </div>
              </div> */}

              {/* <p className="text-gray-300 mb-6 leading-relaxed">
                Your trusted partner for reliable, affordable, and comfortable
                taxi services across Gujarat. Experience the best of Gujarat
                with our professional drivers and modern fleet.
              </p> */}

              {/* Contact Info */}
              {/* <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-300">+91 9512870958 </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-300">info@gujarat.taxi</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-300">Gujarat, India</span>
                </div>
              </div> */}

              {/* Social Links */}
              {/* <div className="flex space-x-4 mt-6">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-blue-500 ${social.color}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </a>
                  );
                })}
              </div> */}
            {/* </div> */}

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-blue-400">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {footerLinks.quickLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            {/* <div>
              <h4 className="text-lg font-semibold mb-6 text-blue-400">
                Our Services
              </h4>
              <ul className="space-y-3">
                {footerLinks.services.map((service) => (
                  <li key={service.name}>
                    <a
                      href={service.href}
                      className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
                    >
                      {service.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div> */}

            {/* Popular Routes */}
            <div>
              <div className="flex flex-col gap-5">
                <h4 className="text-lg font-semibold text-blue-400">
                  Routes
                </h4>
                
                  <div className="space-y-2">
                  <p className="text-gray-300 text-sm">Ahmedabad to Rajkot</p>
                  <p className="text-gray-300 text-sm">Surat to Vadodara</p>
                  <p className="text-gray-300 text-sm">Vadodara to Jamnagar</p>
                  <p className="text-gray-300 text-sm">Rajkot to Bhavnagar</p>
                  <p className="text-gray-300 text-sm">Bhavnagar to Surat</p>
                  </div>
                
                <div className="pt-3">
                  <Link
                    href="/routes"
                    className="text-blue-400 text-sm font-semibold hover:underline"
                  >
                    View all routes →
                  </Link>
                </div>
              </div>
            </div>

            {/* Popular Cities */}
            <div>
              <div className="flex flex-col gap-5">
                <h4 className="text-lg font-semibold text-blue-400">
                  Cities
                </h4>
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm">Ahmedabad</p>
                  <p className="text-gray-300 text-sm">Surat</p>
                  <p className="text-gray-300 text-sm">Vadodara</p>
                  <p className="text-gray-300 text-sm">Rajkot</p>
                  <p className="text-gray-300 text-sm">Bhavnagar</p>
                </div>
                <div className="pt-3">
                  <Link
                    href="/cities"
                    className="text-blue-400 text-sm font-semibold hover:underline"
                  >
                    View all cities →
                  </Link>
                </div>
              </div>
            </div>

            {/* Airport Pick Up & Drop */}
            <div>
              <div className="flex flex-col gap-5">
                <h4 className="text-lg font-semibold text-blue-400">
                  Airports Pick Up & Drop
                </h4>
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm">Ahmedabad to Surat</p>
                  <p className="text-gray-300 text-sm">Surat to Vadodara</p>
                  <p className="text-gray-300 text-sm">Vadodara to Ahmedabad</p>
                  <p className="text-gray-300 text-sm">Rajkot to Bhavnagar</p>
                  <p className="text-gray-300 text-sm">Bhuj to Gandhidham</p>
                </div>
                <div className="pt-3">
                  <Link
                    href="/airports"
                    className="text-blue-400 text-sm font-semibold hover:underline"
                  >
                    View all airports →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        {/* <div className="border-t border-gray-800 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h4 className="text-xl font-semibold mb-4">
              Stay Updated with Tripeaz
            </h4>
            <p className="text-gray-400 mb-6">
              Get the latest offers, travel tips, and route updates delivered to
              your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              />
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105">
                Subscribe
              </button>
            </div>
          </div>
        </div> */}


        {/* Bottom Footer */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-gray-400">
                © 2025 Tripeaz – Khushboo Gujarat Ki
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Website is owned & managed by{" "}
                <span className="text-blue-400 font-medium">
                  Wolfron Technologies LLP
                </span>
              </p>
            </div>

            {/* Legal Links */}
            {/* <div className="flex flex-wrap justify-center md:justify-end space-x-6">
              {footerLinks.legal.map((legal) => (
                <Link
                  key={legal.name}
                  href={legal.href}
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm"
                >
                  {legal.name}
                </Link>
              ))}
            </div> */}
          </div>
        </div>

        {/* Payment Methods */}
        {/* <div className="border-t border-gray-800 py-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-4">We Accept</p>
            <div className="flex justify-center items-center space-x-4">
              <div className="bg-white rounded-lg p-2">
                <span className="text-xs font-bold text-blue-600">UPI</span>
              </div>
              <div className="bg-white rounded-lg p-2">
                <span className="text-xs font-bold text-green-600">GPay</span>
              </div>
              <div className="bg-white rounded-lg p-2">
                <span className="text-xs font-bold text-purple-600">Paytm</span>
              </div>
              <div className="bg-white rounded-lg p-2">
                <span className="text-xs font-bold text-blue-800">Cards</span>
              </div>
              <div className="bg-white rounded-lg p-2">
                <span className="text-xs font-bold text-gray-800">Cash</span>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </footer>
  );
}
