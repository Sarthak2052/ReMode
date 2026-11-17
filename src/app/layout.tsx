import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "ReMode — Intelligent Travel Disruption Recovery Engine",
  description:
    "Understand the traveler's connected itinerary, detect what a disruption breaks, protect critical events, and generate feasible recovery plans with minimum overall disruption.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Caveat:wght@600;700&family=Fascinate+Inline&family=Fredoka:wght@500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Roboto+Flex:opsz,wdth,wght@8..144,25..151,100..1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#EAF5FF] text-[#0F1B2B] selection:bg-[#4FA8F8] selection:text-[#FFFFFF]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
