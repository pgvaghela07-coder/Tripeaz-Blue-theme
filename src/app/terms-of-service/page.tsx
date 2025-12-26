"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function TermsOfService() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      anime({
        targets: contentRef.current.children,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        delay: anime.stagger(100),
        easing: "easeOutExpo",
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors duration-300"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        {/* Content */}
        <div ref={contentRef} className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="leading-relaxed">
                By accessing and using Tripeaz's services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Description of Services
              </h2>
              <p className="leading-relaxed">
                Tripeaz provides taxi booking and transportation services across Gujarat, India. Our services include one-way trips, round trips, airport transfers, and outstation travel. We connect customers with professional drivers and vehicles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. User Responsibilities
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    3.1 Account Information
                  </h3>
                  <p className="leading-relaxed">
                    You are responsible for maintaining the accuracy of your account information and ensuring the security of your account credentials.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    3.2 Booking Information
                  </h3>
                  <p className="leading-relaxed">
                    You must provide accurate pickup and drop-off locations, travel dates, and contact information when making a booking.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    3.3 Conduct
                  </h3>
                  <p className="leading-relaxed">
                    You agree to treat our drivers and staff with respect and follow all applicable laws and regulations during your ride.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Booking and Payment
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    4.1 Booking Process
                  </h3>
                  <p className="leading-relaxed">
                    Bookings can be made through our website, phone, or other authorized channels. All bookings are subject to driver availability and vehicle availability.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    4.2 Pricing
                  </h3>
                  <p className="leading-relaxed">
                    Prices are displayed at the time of booking and may vary based on distance, route, time, and vehicle type. Final pricing will be confirmed upon booking confirmation.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    4.3 Payment
                  </h3>
                  <p className="leading-relaxed">
                    Payment can be made through cash, credit/debit cards, UPI, or other accepted payment methods. Payment is due as per the payment terms agreed upon during booking.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Cancellation and Refunds
              </h2>
              <p className="leading-relaxed">
                Cancellation and refund policies are detailed in our Cancellation Policy and Refund Policy. Please refer to those documents for specific terms regarding cancellations and refunds.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Service Availability
              </h2>
              <p className="leading-relaxed">
                While we strive to provide reliable services, we do not guarantee that our services will be available at all times or in all locations. Service availability is subject to driver availability, weather conditions, and other factors beyond our control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Limitation of Liability
              </h2>
              <p className="leading-relaxed mb-4">
                To the maximum extent permitted by law:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Tripeaz shall not be liable for any indirect, incidental, or consequential damages</li>
                <li>Our total liability shall not exceed the amount paid by you for the specific service</li>
                <li>We are not responsible for delays caused by traffic, weather, or other external factors</li>
                <li>We are not liable for loss or damage to personal belongings left in vehicles</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Insurance and Safety
              </h2>
              <p className="leading-relaxed">
                All our vehicles are insured as per applicable laws. However, passengers are advised to maintain their own travel insurance. We prioritize safety, but passengers use our services at their own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Prohibited Activities
              </h2>
              <p className="leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Use our services for any illegal purposes</li>
                <li>Harass, abuse, or harm our drivers or staff</li>
                <li>Damage or deface vehicles</li>
                <li>Smoke or consume alcohol in vehicles (where prohibited)</li>
                <li>Exceed the maximum passenger capacity of the vehicle</li>
                <li>Carry prohibited items or substances</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Intellectual Property
              </h2>
              <p className="leading-relaxed">
                All content, logos, trademarks, and intellectual property on our website and services are owned by Tripeaz or our licensors. You may not use, reproduce, or distribute any content without our prior written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. Modifications to Terms
              </h2>
              <p className="leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of our services after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                12. Governing Law
              </h2>
              <p className="leading-relaxed">
                These Terms of Service are governed by the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Gujarat, India.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                13. Contact Information
              </h2>
              <p className="leading-relaxed">
                For questions or concerns about these Terms of Service, please contact us:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">Tripeaz</p>
                <p className="text-gray-700">Email: info@gujarat.taxi</p>
                <p className="text-gray-700">Phone: +91 9512870958 </p>
                <p className="text-gray-700">Address: Gujarat, India</p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

