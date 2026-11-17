"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import Stepper, { Step } from "@/components/Stepper";
import {
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  // Default to Input Travel Details (/trip/new) after signup
  const redirect = redirectParam && redirectParam !== "/dashboard" ? redirectParam : "/trip/new";
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleValidateStep = (step: number) => {
    if (step === 1) {
      if (!name.trim()) {
        setError("Please enter your name.");
        return false;
      }
      if (!email.trim() || !email.includes("@")) {
        setError("Please enter a valid email address.");
        return false;
      }
      const cleanPhone = phone.replace(/\D/g, "");
      if (!phone.trim() || cleanPhone.length < 10) {
        setError("Please enter a valid 10-digit mobile number for WhatsApp alerts.");
        return false;
      }
      setError("");
      return true;
    }
    if (step === 2) {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return false;
      }
      setError("");
      return true;
    }
    return true;
  };

  const handleCompleteSignup = () => {
    const userPhone = phone.trim();
    signup({
      name: name.trim(),
      email: email.trim(),
      phone: userPhone,
      role: "Executive Traveler",
      priorityPreference: "SPEED",
    });

    // Send automated WhatsApp/SMS welcome notification to the user's phone if provided
    if (userPhone) {
      try {
        fetch("/api/notifications/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phoneNumber: userPhone,
            channel: "both",
            message: `✈️ ReMode Disruption Sentinel Active!\nWelcome ${name.trim() || "Traveler"}! Your autonomous travel recovery agent is initialized.\nYou will receive live WhatsApp & SMS alerts here for delays or cancellations.`,
          }),
        }).catch((err) => console.error("Notification dispatch error:", err));
      } catch (e) {
        console.error("Failed to trigger signup notification", e);
      }
    }

    router.push(redirect);
  };

  return (
    <div className="w-full max-w-md relative z-10 my-auto">
      <Stepper
        initialStep={1}
        beforeNextStep={handleValidateStep}
        onFinalStepCompleted={handleCompleteSignup}
        backButtonText="Back"
        nextButtonText="Next"
        completeButtonText="Complete Registration"
      >
        {/* Step 1: Traveler Identity */}
        <Step>
          <div className="space-y-4">
            <div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-[#0F1B2B] tracking-tight">
                Create your account
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5B70] mt-1 leading-relaxed">
                Step 1: Enter your identity and contact info.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-[#FFEBEB] border border-[#FF5A5A]/30 text-xs font-bold text-[#D32F2F] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF5A5A] flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0F1B2B] mb-1.5">
                Full Name
              </label>
              <div className="relative group">
                <User className="w-4 h-4 text-[#1C6FD9] absolute left-3.5 top-3.5 pointer-events-none group-focus-within:text-[#1C6FD9] transition-colors" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError("");
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#1C6FD9]/20 bg-[#F8FBFF] focus:bg-white text-sm font-semibold text-[#0F1B2B] placeholder:text-[#8A9BA8] focus:outline-none focus:border-[#1C6FD9] focus:ring-4 focus:ring-[#1C6FD9]/10 transition-all shadow-xs"
                  placeholder="Enter Name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0F1B2B] mb-1.5">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-[#1C6FD9] absolute left-3.5 top-3.5 pointer-events-none group-focus-within:text-[#1C6FD9] transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#1C6FD9]/20 bg-[#F8FBFF] focus:bg-white text-sm font-semibold text-[#0F1B2B] placeholder:text-[#8A9BA8] focus:outline-none focus:border-[#1C6FD9] focus:ring-4 focus:ring-[#1C6FD9]/10 transition-all shadow-xs"
                  placeholder="Enter Email Address"
                />
              </div>
            </div>

            {/* Mobile Phone (WhatsApp Alerts - Mandatory) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0F1B2B]">
                  Phone Number (WhatsApp Alerts) <span className="text-[#FF5A5A]">*</span>
                </label>
                <span className="text-[10px] font-bold text-[#1C6FD9] bg-[#EAF5FF] px-2 py-0.5 rounded-full border border-[#74BCFB]/30">
                  Mandatory for Alerts
                </span>
              </div>
              <div className="relative group">
                <Phone className="w-4 h-4 text-[#1C6FD9] absolute left-3.5 top-3.5 pointer-events-none group-focus-within:text-[#1C6FD9] transition-colors" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (error) setError("");
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#1C6FD9]/20 bg-[#F8FBFF] focus:bg-white text-sm font-semibold text-[#0F1B2B] placeholder:text-[#8A9BA8] focus:outline-none focus:border-[#1C6FD9] focus:ring-4 focus:ring-[#1C6FD9]/10 transition-all shadow-xs"
                  placeholder="Enter 10-digit mobile number"
                />
              </div>
              <p className="text-[11px] text-[#8A9BA8] mt-1 font-medium">
                Used to dispatch real-time WhatsApp & SMS updates during transit disruptions.
              </p>
            </div>
          </div>
        </Step>

        {/* Step 2: Security & Password */}
        <Step>
          <div className="space-y-4">
            <div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-[#0F1B2B] tracking-tight">
                Secure your vault
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5B70] mt-1 leading-relaxed">
                Step 2: Set password credentials for your traveler account.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-[#FFEBEB] border border-[#FF5A5A]/30 text-xs font-bold text-[#D32F2F] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF5A5A] flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0F1B2B] mb-1.5">
                Password
              </label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-[#1C6FD9] absolute left-3.5 top-3.5 pointer-events-none group-focus-within:text-[#1C6FD9] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-[#1C6FD9]/20 bg-[#F8FBFF] focus:bg-white text-sm font-semibold text-[#0F1B2B] placeholder:text-[#8A9BA8] focus:outline-none focus:border-[#1C6FD9] focus:ring-4 focus:ring-[#1C6FD9]/10 transition-all shadow-xs"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-[#8A9BA8] hover:text-[#1C6FD9] p-0.5 rounded transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-[#8A9BA8] mt-1 font-medium">
                Must be at least 6 characters
              </p>
            </div>
          </div>
        </Step>

        {/* Step 3: Confirmation & Activation */}
        <Step>
          <div className="space-y-4">
            <div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-[#0F1B2B] tracking-tight">
                Ready to activate
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5B70] mt-1 leading-relaxed">
                Step 3: Review your details and launch journey protection.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FBFF] border border-[#1C6FD9]/20 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#4A5B70]">Traveler Name:</span>
                <span className="font-black text-[#0F1B2B]">{name || "—"}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#4A5B70]">Email Address:</span>
                <span className="font-black text-[#0F1B2B]">{email || "—"}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#4A5B70]">WhatsApp Alerts Phone:</span>
                <span className="font-black text-[#0F1B2B]">{phone || "—"}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-blue-50">
                <span className="font-bold text-[#4A5B70]">Recovery Engine:</span>
                <span className="font-bold text-[#00A878] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Zero Fake Bookings
                </span>
              </div>
            </div>
          </div>
        </Step>
      </Stepper>

      {/* Card Footer: Login Link */}
      <div className="mt-4 text-center text-xs font-medium text-[#4A5B70]">
        Already have an account?{" "}
        <Link
          href={
            redirect
              ? `/login?redirect=${encodeURIComponent(redirect)}`
              : "/login"
          }
          className="text-[#1C6FD9] font-bold hover:underline ml-1"
        >
          Log in here →
        </Link>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#EAF5FF] text-[#0F1B2B] flex flex-col relative overflow-hidden select-none">
      {/* =========================================================================
          HERO-STYLE 3-SHADE FLUID TOPOGRAPHIC WAVES WITH LIVING MOTION
          ========================================================================= */}
      <div className="fixed inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0">
        <svg
          className="absolute -inset-x-24 -inset-y-24 w-[calc(100%+192px)] h-[calc(100%+192px)]"
          viewBox="0 0 1920 1403"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shade 2: Mid Cerulean Primary Swirl Layer (#74BCFB) with Gentle Floating Animation */}
          <motion.g
            animate={{
              x: [0, 20, -16, 10, 0],
              y: [0, -18, 14, -10, 0],
              rotate: [0, 0.8, -0.6, 0.4, 0],
              scale: [1, 1.018, 0.992, 1.012, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              transformBox: "fill-box",
              transformOrigin: "50% 50%",
              willChange: "transform",
            }}
          >
            <path
              d="M1695.07 151.632c64.24-31.904 131.73-7.088 176.11 42.102 40.17 44.528 55.82 98.753 61.56 156.949 6.14 62.16-2.03 123.84-5.58 185.677-3.39 59.179-3.64 118.025 17.39 174.679 10.72 28.85 25.42 55.218 51.77 73.069 37.97 25.728 81.74 25.202 122.06-1.291 30.97-20.344 55.08-47.559 77.62-76.157v264.039c-58.87 19.501-116.27 43.421-174.84 63.861-44.23 15.43-89.54 27.89-136.8 29.55-56.61 1.99-105.94-14-133.74-67.126-13.24-25.298-23.19-53.745-27.66-81.867-8.42-53.005-10.61-106.956-17.74-160.196-3.59-26.806-9.33-54.115-19.35-79.093-19.69-49.067-66.48-65.165-114.61-43.224-29.94 13.641-55.74 33.151-80.62 54.275-37 31.428-73.18 64.005-112.05 92.942-22.25 16.551-48.12 29.623-74.19 39.345-41.28 15.384-78.24 2.614-110.36-26.124-31.39-28.102-50.42-64.67-70.05-100.935-11.96-22.103-24.51-43.883-37.17-65.587-3.23-5.562-7.57-10.586-11.94-15.365-27.98-30.646-58.88-30.767-82.42 3.757-19.89 29.17-34.427 61.976-51.488 93.082-21.019 38.326-40.302 77.781-63.758 114.584-39.329 61.713-97.979 101.491-163.715 129.981-59.999 26.005-121.922 47.501-182.611 71.931-42.824 17.23-83.179 39.5-118.338 69.59-34.021 29.14-59.637 64.2-65.374 110.44-3.776 30.48 4.892 57.48 24.129 81.15 36.407 44.77 86.741 62.81 141.012 73.57 59.97 11.89 120.728 11.08 181.378 12.17 61.192 1.09 122.363 2.43 181.917 18.66 37.051 10.09 72.202 24.64 102.005 49.74 39.753 33.48 57.763 73.94 57.933 120.19H226.533c-32.085-15.58-61.858-36.47-89.169-62.36-48.299-45.77-73.99-103.5-81.404-168.72-13.75-120.96 23.385-223.39 117.115-302.9 47.855-40.585 105.059-63.358 164.62-80.624 55.764-16.161 111.972-30.874 167.344-48.27 81.076-25.473 126.787-83.135 138.108-165.858 7.617-55.667 10.094-112.134 12.801-168.345 3.398-70.665 5.964-141.34 26.451-209.729 14.422-48.177 37.313-91.294 76.771-124.226 54.474-45.449 114.019-50.265 177.528-22.453 57.146 25.041 98.342 69.929 140.732 113.528 45.29 46.59 90.28 93.645 138.12 137.532 35.4 32.486 79.11 50.935 127.66 56.479 46.17 5.271 86.45-6.277 120.85-38.421 37.86-35.39 61.71-79.931 84.98-125.169 20.81-40.424 41.24-81.195 64.93-119.919 19.97-32.658 45.75-61.364 81.1-78.913"
              fill="#74BCFB"
              stroke="#74BCFB"
              strokeWidth="1.5"
            />
          </motion.g>

          {/* Shade 3: Deep Royal Electric Azure Swirl Layer (#1C6FD9) with Opposing Motion */}
          <motion.g
            animate={{
              x: [0, -22, 18, -12, 0],
              y: [0, 20, -14, 10, 0],
              rotate: [0, -0.8, 0.7, -0.4, 0],
              scale: [1, 0.99, 1.015, 0.996, 1],
            }}
            transition={{
              duration: 13,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              transformBox: "fill-box",
              transformOrigin: "50% 50%",
              willChange: "transform",
            }}
          >
            <path
              d="M957.607 848.011c20.203-17.228 39.917-18.164 60.863-1.598 24.27 19.186 39.37 45.721 56.29 70.767 20.96 31.054 43.97 59.866 77.1 79.279 41.59 24.371 83.09 22.411 120.71-5.291 52.77-38.829 86.04-99.464 141.58-134.68 55.94-35.443 123.8-13.01 158.65 32.594 24.12 31.568 37.13 67.993 49.5 105.059 15.59 46.719 30.26 93.909 49.19 139.269 17.07 40.92 45.88 73.4 88.67 90.21 28.36 11.14 57.68 9.52 87.02 3.74 41.87-8.25 78.62-28.78 116.22-47.63 33.58-16.84 67.56-33.2 102.44-47.01 26.07-10.33 55.11-9.2 82.05-3.2 56.46 12.08 85.31 54.13 71.77 110.37-5.95 24.65-16.34 48.25-25.99 72.01l-200.78 210.09c-1.38 21.8-56.65 62.14-72.01 78.21-83.44-113.45-193.12-200.93-308.88-278.2-32.4-21.62-122-69.18-168.22-88.23-46.23-19.06-83.56-40.17-105.3-15.59-6.32 7.14-8.24 18.89-4.06 34.64 17.72 66.79 82.4 117.75 128.69 165.26 41.55 42.65 79.03 83.98 109.75 135.17 27.95 54.83 33.11 111.22.04 165.6-11.32 18.46-23.77 36.39-36.62 54.15h-398.04c11.97-17.53 23.77-35.16 35.19-53.04 51.48-80.58 72.49-167.09 44.19-261.54-17.6-58.74-55.7-101.56-103.96-136.93-77.07-56.49-164.4-70.38-256.68-58.91-90.677 11.28-180.716 36.61-272.653 33.39-53.175-1.87-76.339-50.6-54.608-99.18 12.558-28.06 37.122-45.2 63.16-59.83 65.899-37.02 146.081-33.01 217.687-51.68 64.376-16.8 100.398-59.8 109.708-125.523 3.03-21.431 6.031-42.89 10.139-64.133 3.621-18.691 12.243-34.869 27.194-47.613"
              fill="#1C6FD9"
              stroke="#1C6FD9"
              strokeWidth="1.5"
            />
          </motion.g>
        </svg>

        {/* Soft Atmospheric Depth Gradient in Top Right */}
        <div className="absolute top-[8%] right-[8%] w-[480px] h-[480px] rounded-full bg-[#4FA8F8]/15 blur-3xl pointer-events-none" />

        {/* Soft Drifting Cartoon Clouds on Left Side */}
        <motion.div
          className="absolute top-[18%] left-6 sm:top-[22%] sm:left-12 lg:left-16 pointer-events-none select-none z-10"
          animate={{ x: [0, 10, 0], y: [0, -4, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="86" height="38" viewBox="0 0 86 38" fill="none">
            <rect x="8" y="14" width="70" height="20" rx="10" fill="#FFFFFF" fillOpacity="0.85" />
            <circle cx="28" cy="14" r="14" fill="#FFFFFF" fillOpacity="0.85" />
            <circle cx="50" cy="17" r="12" fill="#FFFFFF" fillOpacity="0.85" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute bottom-16 left-4 sm:bottom-24 sm:left-8 lg:left-14 pointer-events-none select-none z-10"
          animate={{ x: [0, -8, 0], y: [0, 5, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <svg width="104" height="46" viewBox="0 0 104 46" fill="none">
            <rect x="10" y="18" width="84" height="24" rx="12" fill="#FFFFFF" fillOpacity="0.75" />
            <circle cx="38" cy="18" r="16" fill="#FFFFFF" fillOpacity="0.75" />
            <circle cx="66" cy="22" r="13" fill="#FFFFFF" fillOpacity="0.75" />
          </svg>
        </motion.div>
      </div>

      {/* Navbar with customized auth variant */}
      <Navbar />

      {/* Main Content Area: Centered, No Footer */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 relative z-10">
        <Suspense
          fallback={
            <div className="p-8 text-center text-sm font-bold text-[#1C6FD9] bg-white/90 rounded-2xl shadow-sm border border-white">
              Loading registration portal...
            </div>
          }
        >
          <SignupForm />
        </Suspense>
      </main>
    </div>
  );
}
