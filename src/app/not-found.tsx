import React from "react";
import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#EAF5FF] text-[#0F1B2B] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white border-3 border-[#0F1B2B] rounded-3xl p-8 shadow-[6px_6px_0px_#0F1B2B] space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-[#EAF5FF] text-[#1C6FD9] border-2 border-[#0F1B2B] flex items-center justify-center mx-auto shadow-[2px_2px_0px_#0F1B2B]">
          <Compass className="w-7 h-7" />
        </div>

        <div>
          <span className="font-display font-black text-6xl text-[#1C6FD9] block">
            404
          </span>
          <h2 className="font-display font-black text-2xl text-[#0F1B2B] mt-1">
            Route Not Found
          </h2>
          <p className="text-xs text-[#4A5B70] font-medium leading-relaxed mt-1">
            The requested travel corridor or page does not exist on this network.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1C6FD9] text-white font-bold text-xs border-2 border-[#0F1B2B] shadow-[2px_2px_0px_#0F1B2B] hover:bg-[#155EC0] transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Mission Control</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
