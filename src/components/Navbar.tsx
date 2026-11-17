"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  Layers,
  Sparkles,
  FileText,
  PanelBottom,
  Menu,
  X,
  LogOut,
  User,
  Sliders,
  Plane,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Dock, { DockItemData } from "./Dock";

interface NavbarProps {
  onOpenCopilot?: () => void;
}

export function Navbar({ onOpenCopilot }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("hero");
  const profileRef = useRef<HTMLDivElement>(null);

  const isAuthPage = pathname === "/signup" || pathname === "/login";
  const isSignupPage = pathname === "/signup";
  const isLoginPage = pathname === "/login";

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part.replace(/[^a-zA-Z]/g, ""))
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("")
    : "EV";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    if (pathname === "/") {
      if (sectionId === "hero") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (sectionId === "footer") {
        const el = document.getElementById("footer");
        if (el) {
          const navbarOffset = 60;
          const targetY = Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - navbarOffset);
          window.scrollTo({ top: targetY, behavior: "smooth" });
        } else {
          window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
        }
      } else {
        const el = document.getElementById(sectionId);
        if (el) {
          const navbarOffset = 76;
          const targetY = Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - navbarOffset);
          window.scrollTo({ top: targetY, behavior: "smooth" });
        }
      }
    } else {
      window.location.href = `/#${sectionId}`;
    }
  };

  useEffect(() => {
    if (pathname !== "/") return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // Bottom reached -> Footer active
      if (scrollY + windowHeight >= docHeight - 120) {
        setActiveSection("footer");
        return;
      }

      const sections = ["footer", "cta", "how-it-works", "hero"];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= windowHeight * 0.45) {
            setActiveSection(id);
            return;
          }
        }
      }
      setActiveSection("hero");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const isAppPage = pathname === "/dashboard" || pathname.startsWith("/trip");

  const dockItems: DockItemData[] = isAppPage
    ? [
        {
          icon: <Compass className="w-5 h-5 stroke-[2]" />,
          label: "Home",
          onClick: () => router.push("/"),
          href: "/",
          active: false,
        },
        {
          icon: <Plane className="w-5 h-5 stroke-[2]" />,
          label: "Input Details",
          onClick: () => router.push("/trip/new"),
          href: "/trip/new",
          active: pathname.startsWith("/trip"),
        },
        {
          icon: <Sliders className="w-5 h-5 stroke-[2]" />,
          label: "Dashboard",
          onClick: () => router.push("/dashboard"),
          href: "/dashboard",
          active: pathname === "/dashboard",
        },
        {
          icon: <Sparkles className="w-5 h-5 stroke-[2]" />,
          label: "Ask Copilot",
          onClick: () => {
            if (onOpenCopilot) {
              onOpenCopilot();
            } else {
              router.push("/dashboard?copilot=open");
            }
          },
          href: onOpenCopilot ? undefined : "/dashboard?copilot=open",
          active: false,
        },
      ]
    : [
        {
          icon: <Compass className="w-5 h-5 stroke-[2]" />,
          label: "Home",
          onClick: () => scrollToSection("hero"),
          href: "/#hero",
          active: pathname === "/" && activeSection === "hero",
        },
        {
          icon: <Layers className="w-5 h-5 stroke-[2]" />,
          label: "How It Works",
          onClick: () => scrollToSection("how-it-works"),
          href: "/#how-it-works",
          active: pathname === "/" && activeSection === "how-it-works",
        },
        {
          icon: <Sparkles className="w-5 h-5 stroke-[2]" />,
          label: "Protect Journey",
          onClick: () => scrollToSection("cta"),
          href: "/#cta",
          active: pathname === "/" && activeSection === "cta",
        },
        {
          icon: <PanelBottom className="w-5 h-5 stroke-[2]" />,
          label: "Footer",
          onClick: () => scrollToSection("footer"),
          href: "/#footer",
          active: pathname === "/" && activeSection === "footer",
        },
      ];

  return (
    <>
      <div className="fixed top-5 sm:top-6 left-1/2 -translate-x-1/2 z-50 px-2 sm:px-4 w-[97%] max-w-[1440px] pointer-events-none transition-all">
        <nav className="pointer-events-auto w-full min-h-[48px] sm:min-h-[50px] bg-white/85 hover:bg-white/95 rounded-2xl sm:rounded-[20px] px-4 sm:px-6 py-1.5 sm:py-2 border border-white/90 shadow-[0_10px_35px_rgba(10,61,115,0.09),0_2px_8px_rgba(79,168,248,0.12),inset_0_1px_1px_rgba(255,255,255,0.95),inset_0_-1px_2px_rgba(195,220,255,0.35)] flex items-center justify-between backdrop-blur-xl overflow-visible transition-all">
          {/* Left Section: Emblem Logo + Brand Typography */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0 transition-transform hover:scale-[1.02] active:scale-[0.99]">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#1C6FD9] via-[#2F8BF5] to-[#4FA8F8] border border-white/90 flex items-center justify-center p-1.5 shadow-[0_4px_14px_rgba(28,111,217,0.38),inset_0_1px_1px_rgba(255,255,255,0.7)] group-hover:scale-105 group-hover:shadow-[0_6px_18px_rgba(28,111,217,0.48)] group-hover:border-white transition-all">
              <Image
                src="/logo-white.png"
                alt="ReMode Logo"
                width={28}
                height={28}
                priority
                className="object-contain select-none drop-shadow-[0_1px_2px_rgba(10,61,115,0.35)]"
              />
            </div>
            <div className="leading-tight flex flex-col justify-center">
              <div className="font-fascinate text-2xl sm:text-[27px] tracking-wide leading-none flex items-center select-none">
                <span className="text-[#0F1B2B] drop-shadow-[0_1px_1px_rgba(15,27,43,0.12)] group-hover:text-[#0A3D73] transition-colors">
                  Re
                </span>
                <span className="bg-gradient-to-r from-[#1C6FD9] via-[#2F8BF5] to-[#4FA8F8] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(28,111,217,0.22)]">
                  Mode
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2CD9B8] shadow-[0_0_6px_#2CD9B8] animate-pulse" />
                <span className="text-[8px] sm:text-[8.5px] font-black uppercase tracking-[0.24em] text-[#1C6FD9]">
                  Recovery Engine
                </span>
              </div>
            </div>
          </Link>

          {/* Center Section: 4-Icon Dock Island (Hidden on Auth pages like /signup and /login) */}
          {!isAuthPage && (
            <div className="hidden md:flex items-center justify-center">
              <Dock items={dockItems} />
            </div>
          )}

          {/* Right Section: Compact Auth Buttons or User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!isAuthenticated ? (
              isSignupPage ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="hidden sm:inline text-xs font-semibold text-[#4A5B70]">
                    Already registered?
                  </span>
                  <Link
                    href="/login"
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#1C6FD9] hover:bg-[#155EC0] text-white font-bold text-xs uppercase tracking-wider border-2 border-[#74BCFB]/50 hover:border-white shadow-[0_4px_14px_rgba(28,111,217,0.32),inset_0_1px_1px_rgba(255,255,255,0.35)] hover:shadow-[0_8px_20px_rgba(28,111,217,0.42)] transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center"
                  >
                    Log In
                  </Link>
                </div>
              ) : isLoginPage ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="hidden sm:inline text-xs font-semibold text-[#4A5B70]">
                    New traveler?
                  </span>
                  <Link
                    href="/signup"
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#1C6FD9] hover:bg-[#155EC0] text-white font-bold text-xs uppercase tracking-wider border-2 border-[#74BCFB]/50 hover:border-white shadow-[0_4px_14px_rgba(28,111,217,0.32),inset_0_1px_1px_rgba(255,255,255,0.35)] hover:shadow-[0_8px_20px_rgba(28,111,217,0.42)] transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-5 py-2 sm:py-2.5 rounded-xl bg-[#1C6FD9] hover:bg-[#155EC0] text-white font-bold text-xs uppercase tracking-wider border-2 border-[#74BCFB]/50 hover:border-white shadow-[0_4px_14px_rgba(28,111,217,0.32),inset_0_1px_1px_rgba(255,255,255,0.35)] hover:shadow-[0_8px_20px_rgba(28,111,217,0.42)] transition-all duration-250 ease-[cubic-bezier(0.2,0.8,0.2,1)] transform hover:-translate-y-0.5 hover:scale-[1.025] active:translate-y-0 active:scale-[0.98] flex items-center"
                >
                  Log In
                </Link>
              )
            ) : (
              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  title={`${user?.name || "Traveler Profile"} (${userInitials})`}
                  className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-[#EAF5FF] hover:bg-[#D5EBFF] border border-[#1C6FD9]/30 hover:border-[#1C6FD9] text-[#1C6FD9] flex items-center justify-center font-black text-xs tracking-wider transition-all select-none cursor-pointer hover:scale-105 active:scale-95"
                >
                  {userInitials ? (
                    <span>{userInitials}</span>
                  ) : (
                    <User className="w-3.5 h-3.5 text-[#1C6FD9]" />
                  )}
                </button>

                {/* Dropdown Profile Flyout */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white/95 rounded-2xl border border-white/90 shadow-[0_16px_40px_rgba(10,61,115,0.18)] p-3.5 backdrop-blur-2xl z-50">
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1C6FD9] to-[#4FA8F8] text-white flex items-center justify-center font-black text-sm tracking-wider shadow-sm border border-white/80 flex-shrink-0 select-none">
                        {userInitials ? (
                          <span>{userInitials}</span>
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-extrabold text-xs text-[#0F1B2B] truncate">
                          {user?.name || "Dr. Elena Vance"}
                        </div>
                        <div className="text-[10px] text-[#1C6FD9] font-bold truncate">
                          {user?.role || "Keynote Speaker"}
                        </div>
                        <div className="text-[10px] text-[#4A5B70] truncate">
                          {user?.email || "elena.vance@cleantech-summit.org"}
                        </div>
                      </div>
                    </div>

                    <div className="py-2 space-y-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#0F1B2B] hover:bg-[#EAF5FF] hover:text-[#1C6FD9] transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Sliders className="w-3.5 h-3.5 text-[#1C6FD9]" />
                          Trip Dashboard
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#1C6FD9] bg-[#EAF5FF] px-1.5 py-0.5 rounded-md border border-[#74BCFB]/30">
                          Active
                        </span>
                      </Link>
                      <Link
                        href="/trip/new"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#0F1B2B] hover:bg-[#EAF5FF] hover:text-[#1C6FD9] transition-colors"
                      >
                        <Plane className="w-3.5 h-3.5 text-[#1C6FD9]" />
                        <span>Plan New Recovery</span>
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          logout();
                          router.push("/");
                        }}
                        className="w-full flex items-center justify-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#FF5A5A] hover:bg-[#FFF1F1] border border-transparent hover:border-[#FF5A5A]/20 transition-all cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button with Border */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full border border-[#74BCFB]/40 bg-white/70 hover:bg-white text-[#0F1B2B] shadow-sm transition-all"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </nav>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="pointer-events-auto md:hidden mt-2 bg-white/95 rounded-2xl border border-white/80 shadow-2xl p-3 space-y-1.5 backdrop-blur-xl">
            {isAuthPage ? (
              <>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-sm text-[#0F1B2B] hover:bg-[#EAF5FF] hover:text-[#1C6FD9] transition-all"
                >
                  <Compass className="w-5 h-5 text-[#1C6FD9]" />
                  <span>Back to Flight Deck</span>
                </Link>
                {isSignupPage && (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-sm text-[#0F1B2B] hover:bg-[#EAF5FF] hover:text-[#1C6FD9] transition-all"
                  >
                    <User className="w-5 h-5 text-[#1C6FD9]" />
                    <span>Already Registered? Log In</span>
                  </Link>
                )}
                {isLoginPage && (
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-sm text-[#0F1B2B] hover:bg-[#EAF5FF] hover:text-[#1C6FD9] transition-all"
                  >
                    <Sparkles className="w-5 h-5 text-[#1C6FD9]" />
                    <span>Create Account</span>
                  </Link>
                )}
              </>
            ) : isAppPage ? (
              <>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-sm text-[#0F1B2B] hover:bg-[#EAF5FF] hover:text-[#1C6FD9] transition-all"
                >
                  <Compass className="w-5 h-5 text-[#1C6FD9]" />
                  <span>Home</span>
                </Link>
                <Link
                  href="/trip/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-sm border transition-all ${
                    pathname.startsWith("/trip")
                      ? "border-[#74BCFB]/60 bg-[#EAF5FF] text-[#1C6FD9]"
                      : "border-transparent text-[#0F1B2B] hover:bg-[#EAF5FF] hover:text-[#1C6FD9]"
                  }`}
                >
                  <Plane className="w-5 h-5 text-[#1C6FD9]" />
                  <span>Input Travel Details</span>
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-sm border transition-all ${
                    pathname === "/dashboard"
                      ? "border-[#74BCFB]/60 bg-[#EAF5FF] text-[#1C6FD9]"
                      : "border-transparent text-[#0F1B2B] hover:bg-[#EAF5FF] hover:text-[#1C6FD9]"
                  }`}
                >
                  <Sliders className="w-5 h-5 text-[#1C6FD9]" />
                  <span>Trip Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenCopilot) {
                      onOpenCopilot();
                    } else {
                      router.push("/dashboard?copilot=open");
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-sm border border-[#74BCFB]/30 bg-[#EAF5FF]/60 hover:bg-[#EAF5FF] text-[#1C6FD9] text-left transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[#1C6FD9]" />
                  <span>Ask AI Copilot</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    scrollToSection("hero");
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-sm border transition-all text-left ${
                    pathname === "/" && activeSection === "hero"
                      ? "border-[#74BCFB]/60 bg-[#EAF5FF] text-[#1C6FD9]"
                      : "border-transparent hover:border-[#74BCFB]/30 hover:bg-[#EAF5FF] text-[#0F1B2B]"
                  }`}
                >
                  <Compass className="w-5 h-5 text-[#1C6FD9]" />
                  <span>Home</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    scrollToSection("how-it-works");
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-sm border transition-all text-left ${
                    pathname === "/" && activeSection === "how-it-works"
                      ? "border-[#74BCFB]/60 bg-[#EAF5FF] text-[#1C6FD9]"
                      : "border-transparent hover:border-[#74BCFB]/30 hover:bg-[#EAF5FF] text-[#0F1B2B]"
                  }`}
                >
                  <Layers className="w-5 h-5 text-[#1C6FD9]" />
                  <span>How It Works</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    scrollToSection("cta");
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-sm border transition-all text-left ${
                    pathname === "/" && activeSection === "cta"
                      ? "border-[#74BCFB]/60 bg-[#EAF5FF] text-[#1C6FD9]"
                      : "border-transparent hover:border-[#74BCFB]/30 hover:bg-[#EAF5FF] text-[#0F1B2B]"
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-[#1C6FD9]" />
                  <span>Protect Journey</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    scrollToSection("footer");
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-sm border transition-all text-left ${
                    pathname === "/" && activeSection === "footer"
                      ? "border-[#74BCFB]/60 bg-[#EAF5FF] text-[#1C6FD9]"
                      : "border-transparent hover:border-[#74BCFB]/30 hover:bg-[#EAF5FF] text-[#0F1B2B]"
                  }`}
                >
                  <PanelBottom className="w-5 h-5 text-[#1C6FD9]" />
                  <span>Footer</span>
                </button>
                {onOpenCopilot && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenCopilot();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-sm border border-[#74BCFB]/30 bg-[#EAF5FF]/60 hover:bg-[#EAF5FF] text-[#1C6FD9] text-left transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-[#1C6FD9]" />
                    <span>Ask AI Copilot</span>
                  </button>
                )}
              </>
            )}

            {isAuthenticated && (
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1C6FD9] to-[#4FA8F8] text-white text-[10px] font-black flex items-center justify-center border border-white/80 flex-shrink-0 select-none">
                    {userInitials ? (
                      <span>{userInitials}</span>
                    ) : (
                      <User className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#0F1B2B] truncate max-w-[120px]">
                    {user?.name}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    router.push("/");
                  }}
                  className="text-xs font-bold text-[#FF5A5A] hover:underline"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Spacer to preserve natural flow height so top page content does not collide on initial load */}
      <div className="h-14 sm:h-16 w-full flex-shrink-0 pointer-events-none" aria-hidden="true" />
    </>
  );
}
