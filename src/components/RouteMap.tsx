"use client";

import dynamic from "next/dynamic";
import React from "react";
import { RouteMapProps } from "./RouteMapClient";
import { Compass } from "lucide-react";

const RouteMapClientDynamic = dynamic(
  () => import("./RouteMapClient").then((mod) => mod.RouteMapClient),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[380px] bg-white/90 backdrop-blur-xl border border-[#74BCFB]/30 rounded-3xl flex flex-col items-center justify-center p-6 shadow-[0_8px_30px_rgba(10,61,115,0.06)]">
        <div className="w-12 h-12 rounded-2xl bg-[#EAF5FF] border border-[#74BCFB]/40 flex items-center justify-center text-[#1C6FD9] mb-3 shadow-xs">
          <Compass className="w-6 h-6 animate-spin" />
        </div>
        <h4 className="font-sans font-extrabold text-sm text-[#0F1B2B]">
          Initializing Transit Map Engine...
        </h4>
        <p className="text-xs text-[#4A5B70] font-medium mt-1">
          Loading high-precision Indian route coordinates & waypoints
        </p>
      </div>
    ),
  }
);

export const RouteMap: React.FC<RouteMapProps> = (props) => {
  return <RouteMapClientDynamic {...props} />;
};
