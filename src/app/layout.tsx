import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import { BookingModalProvider } from "@/contexts/BookingModalContext";
import BookingModal from "@/components/BookingModal";
import ScrollToTop from "@/components/ScrollToTop";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Reduced weights to prevent timeout
  variable: "--font-poppins",
  display: "swap",
  preload: false, // Disable preload to prevent timeout errors
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Arial", "sans-serif"],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "Tripeaz - Khushboo Gujarat Ki | Book Your Ride",
  description:
    "Reliable, affordable & comfortable taxi services across Gujarat. One-way, round trip, and airport rides with experienced drivers.",
  keywords:
    "Gujarat, Ahmedabad taxi, Surat taxi, Vadodara taxi, Rajkot taxi, airport pickup, outstation travel",
  authors: [{ name: "Wolfron Technologies LLP" }],
  robots: "index, follow",
  icons: {
    icon: "/favicon.ico",
  },
  other: {
    "color-scheme": "light",
  },
  openGraph: {
    title: "Tripeaz - Khushboo Gujarat Ki",
    description:
      "Book your ride with Tripeaz - Reliable, Affordable & Comfortable",
    type: "website",
    locale: "en_IN",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff", // Force light theme color
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable} style={{ colorScheme: 'light' }}>
      <body className={`${poppins.className} bg-blue-50 antialiased`}>
        <div id="root-portal"></div>
        <BookingModalProvider>
          <ToastContainer/>
          {children}
          <BookingModal />
          <ScrollToTop />
        </BookingModalProvider>
      </body>
    </html>
  );
}
