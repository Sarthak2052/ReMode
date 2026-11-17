"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("ReMode Root Global Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF7F2] text-[#0F1B2B] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white border-3 border-[#0F1B2B] rounded-3xl p-8 shadow-[6px_6px_0px_#0F1B2B] space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-[#FFEBEB] text-[#DC2626] border-2 border-[#0F1B2B] flex items-center justify-center mx-auto shadow-[2px_2px_0px_#0F1B2B]">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFEBEB] text-[#DC2626] border border-[#DC2626]">
              Fatal System Error
            </span>
            <h2 className="font-black text-2xl text-[#0F1B2B] mt-2">
              System Interruption
            </h2>
            <p className="text-xs text-[#4A5B70] font-medium leading-relaxed mt-1">
              {error.message || "A critical error occurred while rendering the root application shell."}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#1C6FD9] text-white font-bold text-xs border-2 border-[#0F1B2B] shadow-[2px_2px_0px_#0F1B2B] hover:bg-[#155EC0] transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
