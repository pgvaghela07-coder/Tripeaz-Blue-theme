"use client";

import { useState, useEffect } from "react";
import { Menu, X, Phone, Mail } from "lucide-react";
import { useBookingModal } from "@/contexts/BookingModalContext";
import Link from "next/link";
import { assest } from "@/assest/assest";
import Image from "next/image";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { openModal } = useBookingModal();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "Services", href: "#services" },
    { name: "Book a Ride", href: "#booking" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    // <nav
    //   className={`fixed top-0  left-0 right-0 z-50 transition-all duration-300 ${
    //     isScrolled ? "bg-white shadow-lg" : "bg-white shadow-lg"
    //   }`}
    // >
    //   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    //     <div className="flex justify-between items-center py-4">
    //       {/* Logo */}
    //       <div className="flex items-center space-x-2">
    //         <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
    //           <span className="text-white font-bold text-xl">GT</span>
    //         </div>
    //         <div>
    //           <h1 className="text-xl font-bold text-gray-900">Tripeaz</h1>
    //           <p className="text-xs text-blue-600 font-medium">
    //             Travel Made Easy
    //           </p>
    //         </div>
    //       </div>



    //       {/* Contact Info & CTA */}
    //       <div className="hidden lg:flex items-center space-x-4">
    //         <div className="flex items-center space-x-4 text-sm text-gray-600">
    //           <div className="flex items-center space-x-1">
    //             <Phone className="w-4 h-4" />
    //             <span>+91 9512870958 </span>
    //           </div>
    //           <div className="flex items-center space-x-1">
    //             <Mail className="w-4 h-4" />
    //             <span>info@gujarat.taxi</span>
    //           </div>

    //         </div>
    //         <button onClick={openModal} className="btn-primary">Book Now</button>
    //       </div>

    //       {/* Mobile menu button */}
    //       <button
    //         className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
    //         onClick={() => setIsMenuOpen(!isMenuOpen)}
    //       >
    //         {isMenuOpen ? (
    //           <X className="w-6 h-6" />
    //         ) : (
    //           <Menu className="w-6 h-6" />
    //         )}
    //       </button>
    //     </div>

    //     {/* Mobile Navigation */}
    //     {isMenuOpen && (
    //       <div className="md:hidden py-4 border-t border-gray-200 bg-white">
    //         <div className="flex flex-col space-y-4">
    //             {/* {navItems.map((item) => (
    //               <a
    //                 key={item.name}
    //                 href={item.href}
    //                 className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 py-2"
    //                 onClick={() => setIsMenuOpen(false)}
    //               >
    //                 {item.name}
    //               </a>
    //             ))} */}
    //           <div className="pt-4 border-t border-gray-200">
    //             <div className="flex flex-col space-y-2 text-sm text-gray-600">
    //               <div className="flex items-center space-x-2">
    //                 <Phone className="w-4 h-4" />
    //                 <span>+91 9512870958 </span>
    //               </div>
    //               <div className="flex items-center space-x-2">
    //                 <Mail className="w-4 h-4" />
    //                 <span>info@gujarat.taxi</span>
    //               </div>
    //             </div>
    //             <button
    //               onClick={() => {
    //                 openModal();
    //                 setIsMenuOpen(false);
    //               }}
    //               className="btn-primary w-full mt-4"
    //             >
    //               Book Now
    //             </button>
    //           </div>
    //         </div>
    //       </div>
    //     )}
    //   </div>
    // </nav>

    <div className="flex  items-center justify-center -mt-2 bg-gradient-to-br  from-blue-50  to-blue-50">
      <div>
        <Image src={assest.logo} alt="" className="w-96 h-40 object-cover" />
      </div>
        {/* <p className="text-xl text-[#3579F3] font-semibold -mt-3" style={{ fontFamily: "serif" }}>
          Travel Made Easy
        </p> */}
    </div>
  );
}
