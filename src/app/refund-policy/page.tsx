"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function RefundPolicy() {
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
            Refund Policy
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
                This Refund Policy outlines the terms and conditions for refunds on Tripeaz services. Refunds are processed in accordance with our Cancellation Policy and the specific circumstances of each case.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Eligibility for Refunds
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    2.1 Full Refunds
                  </h3>
                  <p className="leading-relaxed mb-2">
                    You are eligible for a full refund in the following cases:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Cancellation made at least 2 hours before scheduled pickup time</li>
                    <li>Service cancellation by Tripeaz due to our fault</li>
                    <li>Vehicle breakdown or technical issues preventing service</li>
                    <li>Driver no-show or significant delay (more than 30 minutes) without prior notice</li>
                    <li>Service not provided as per booking confirmation</li>
                    <li>Double payment or payment processing errors</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    2.2 Partial Refunds
                  </h3>
                  <p className="leading-relaxed mb-2">
                    Partial refunds may be applicable in the following cases:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Cancellation made within the cancellation charge period (as per Cancellation Policy)</li>
                    <li>Service partially completed (e.g., trip started but not completed due to customer request)</li>
                    <li>Disputes resolved through mutual agreement</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    2.3 Non-Refundable Cases
                  </h3>
                  <p className="leading-relaxed mb-2">
                    Refunds will not be provided in the following cases:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>No-show by customer without prior cancellation</li>
                    <li>Cancellation after driver has arrived at pickup location</li>
                    <li>Service completed as per booking terms</li>
                    <li>Customer misconduct or violation of terms</li>
                    <li>Force majeure events beyond our control (unless specifically waived)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Refund Processing
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    3.1 Processing Time
                  </h3>
                  <p className="leading-relaxed">
                    Refunds are processed within 5-7 business days from the date of approval. The actual credit to your account may take additional time depending on your bank or payment provider:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                    <li><strong>Credit/Debit Cards:</strong> 5-10 business days</li>
                    <li><strong>UPI:</strong> 2-5 business days</li>
                    <li><strong>Net Banking:</strong> 5-7 business days</li>
                    <li><strong>Wallet Payments:</strong> 1-3 business days</li>
                    <li><strong>Cash Payments:</strong> Bank transfer within 7-10 business days</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    3.2 Refund Method
                  </h3>
                  <p className="leading-relaxed">
                    Refunds will be processed to the original payment method used for the booking. If the original payment method is no longer available, we will contact you to arrange an alternative refund method.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    3.3 Refund Confirmation
                  </h3>
                  <p className="leading-relaxed">
                    Once your refund is processed, you will receive a confirmation email with the refund details, including the amount refunded and the expected credit date.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. How to Request a Refund
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    4.1 Refund Request Process
                  </h3>
                  <p className="leading-relaxed mb-2">
                    To request a refund, please:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Contact our customer service at +91 9512870958 </li>
                    <li>Email us at info@gujarat.taxi with your booking reference number</li>
                    <li>Provide details about the reason for refund request</li>
                    <li>Include any supporting documents or evidence if applicable</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    4.2 Required Information
                  </h3>
                  <p className="leading-relaxed mb-2">
                    When requesting a refund, please provide:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Booking reference number</li>
                    <li>Date and time of booking</li>
                    <li>Reason for refund request</li>
                    <li>Payment transaction details</li>
                    <li>Contact information</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Refund Review and Approval
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    5.1 Review Process
                  </h3>
                  <p className="leading-relaxed">
                    All refund requests are reviewed by our customer service team. We aim to review and respond to refund requests within 24-48 hours of receipt.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    5.2 Approval Criteria
                  </h3>
                  <p className="leading-relaxed">
                    Refunds are approved based on:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                    <li>Eligibility as per this Refund Policy</li>
                    <li>Verification of booking and payment details</li>
                    <li>Review of circumstances leading to refund request</li>
                    <li>Compliance with Terms of Service</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Disputes and Appeals
              </h2>
              <p className="leading-relaxed mb-4">
                If your refund request is denied or you disagree with the refund amount:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>You can appeal the decision by contacting our customer service</li>
                <li>Provide additional information or evidence to support your case</li>
                <li>Our team will conduct a thorough review of your appeal</li>
                <li>We will communicate the final decision within 3-5 business days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Service Credits
              </h2>
              <p className="leading-relaxed">
                In some cases, instead of a monetary refund, we may offer service credits that can be used for future bookings. Service credits are valid for 6 months from the date of issue and cannot be converted to cash.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Third-Party Bookings
              </h2>
              <p className="leading-relaxed">
                If you booked through a third-party platform or partner, refund policies may vary. Please refer to the terms and conditions of the platform through which you made the booking, or contact us for assistance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Currency and Exchange Rates
              </h2>
              <p className="leading-relaxed">
                All refunds are processed in Indian Rupees (INR). If you paid in a different currency, the refund will be converted at the exchange rate applicable at the time of refund processing. Any exchange rate differences are not our responsibility.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Contact Us
              </h2>
              <p className="leading-relaxed">
                For refund requests or questions about this policy, please contact us:
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

