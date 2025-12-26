"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function CancellationPolicy() {
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
            Cancellation Policy
          </h1>
          <p className="text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Overview
              </h2>
              <p className="leading-relaxed">
                At Tripeaz, we understand that plans can change. This Cancellation Policy outlines the terms and conditions for canceling your taxi booking and the applicable charges, if any.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Cancellation by Customer
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    2.1 Free Cancellation Period
                  </h3>
                  <p className="leading-relaxed">
                    You can cancel your booking free of charge if the cancellation is made at least 2 hours before the scheduled pickup time. No cancellation charges will apply in this case.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    2.2 Cancellation Charges
                  </h3>
                  <p className="leading-relaxed mb-4">
                    Cancellation charges apply based on the timing of cancellation:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li><strong>2 hours to 1 hour before pickup:</strong> 25% of the booking amount</li>
                    <li><strong>1 hour to 30 minutes before pickup:</strong> 50% of the booking amount</li>
                    <li><strong>Less than 30 minutes before pickup:</strong> 75% of the booking amount</li>
                    <li><strong>After driver arrival or no-show:</strong> 100% of the booking amount</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    2.3 How to Cancel
                  </h3>
                  <p className="leading-relaxed">
                    You can cancel your booking by:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                    <li>Calling our customer service at +91 9512870958 </li>
                    <li>Using the cancellation option in your booking confirmation</li>
                    <li>Sending an email to info@gujarat.taxi with your booking reference number</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Cancellation by Tripeaz
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    3.1 Service Cancellation
                  </h3>
                  <p className="leading-relaxed">
                    In rare circumstances, we may need to cancel your booking due to:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                    <li>Unforeseen circumstances (natural disasters, extreme weather)</li>
                    <li>Vehicle breakdown or technical issues</li>
                    <li>Driver unavailability due to emergencies</li>
                    <li>Safety concerns or security issues</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    3.2 Refund for Service Cancellation
                  </h3>
                  <p className="leading-relaxed">
                    If we cancel your booking, you will receive a full refund of any amount paid. We will also make reasonable efforts to arrange an alternative solution or reschedule your booking at your convenience.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Special Cases
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    4.1 Airport Transfers
                  </h3>
                  <p className="leading-relaxed">
                    For airport transfer bookings, cancellation must be made at least 4 hours before the scheduled pickup time to avoid charges. Cancellations made less than 4 hours before pickup will incur charges as per the standard policy.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    4.2 Outstation Trips
                  </h3>
                  <p className="leading-relaxed">
                    For outstation trips, cancellation must be made at least 24 hours before the scheduled departure time for free cancellation. Cancellations made less than 24 hours before departure will incur charges as per the standard policy.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    4.3 Round Trips
                  </h3>
                  <p className="leading-relaxed">
                    Round trip bookings follow the same cancellation policy as one-way trips, with charges based on the first leg of the journey.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Refund Processing
              </h2>
              <p className="leading-relaxed mb-4">
                Refunds for cancellations will be processed as follows:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Refunds will be processed to the original payment method used for booking</li>
                <li>Processing time: 5-7 business days for credit/debit cards and UPI</li>
                <li>Cash payments: Refunds will be processed via bank transfer or other agreed method</li>
                <li>You will receive a confirmation email once the refund is processed</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. No-Show Policy
              </h2>
              <p className="leading-relaxed">
                If you fail to show up at the scheduled pickup location and time without prior cancellation, it will be considered a "no-show." In such cases, the full booking amount will be charged, and no refund will be provided.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Modifications vs. Cancellations
              </h2>
              <p className="leading-relaxed">
                If you need to change your booking (pickup time, location, or vehicle type), please contact us as soon as possible. Modifications may be subject to availability and price differences. If modifications are not possible, the cancellation policy will apply.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Force Majeure
              </h2>
              <p className="leading-relaxed">
                In case of force majeure events (natural disasters, pandemics, government restrictions, etc.), cancellation charges may be waived or adjusted at our discretion. We will communicate any such policy changes to affected customers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Disputes and Grievances
              </h2>
              <p className="leading-relaxed">
                If you have any concerns or disputes regarding cancellation charges, please contact our customer service team. We will review your case and work towards a fair resolution.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Contact Us
              </h2>
              <p className="leading-relaxed">
                For cancellation requests or questions about this policy, please contact us:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">Tripeaz</p>
                <p className="text-gray-700">Email: info@gujarat.taxi</p>
                <p className="text-gray-700">Phone: +91 9512870958 </p>
                <p className="text-gray-700">Address: Gujarat, India</p>
                <p className="text-gray-700 mt-2">Customer Service Hours: 24/7</p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

