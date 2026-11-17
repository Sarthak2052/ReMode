"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

interface AirplaneLightRevealOverlayProps {
  onComplete?: () => void;
  forcePlay?: boolean;
  title?: string;
  subtitle?: string;
}

export const AirplaneLightRevealOverlay: React.FC<AirplaneLightRevealOverlayProps> = ({
  onComplete,
  forcePlay = true,
  title = "Arriving at Operations Dashboard",
  subtitle = "Keynote Safety Protected • 100% Deterministic Engine",
}) => {
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(forcePlay);
  const [progress, setProgress] = useState(0);
  const [lightBurstOpacity, setLightBurstOpacity] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const DURATION = 1400; // 1.4 seconds athletic, cinematic flight

  const handleSkip = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    setIsPlaying(false);
    if (onComplete) onComplete();
  };

  const startFlight = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    setIsPlaying(true);
    setProgress(0.001);
    setLightBurstOpacity(0);
    startTimeRef.current = null;

    safetyTimerRef.current = setTimeout(() => {
      handleSkip();
    }, DURATION + 800);

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const rawProgress = Math.min(1, elapsed / DURATION);

      // Smooth flight easing: soft launch, steady climb, gentle glide
      const easeT =
        rawProgress < 0.5
          ? 2 * rawProgress * rawProgress
          : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;

      setProgress(easeT);

      // Trigger radiant shine of light when the plane reaches the top-right corner (~85% to 100%)
      if (rawProgress >= 0.82) {
        const lightP = (rawProgress - 0.82) / 0.18; // 0 to 1
        // Rapid flare up then fade out
        if (lightP < 0.45) {
          setLightBurstOpacity(lightP / 0.45); // 0 to 1
        } else {
          setLightBurstOpacity(Math.max(0, 1 - (lightP - 0.45) / 0.55)); // 1 to 0
        }
      } else {
        setLightBurstOpacity(0);
      }

      if (rawProgress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Shine of light dissolves and main dashboard is revealed!
        setTimeout(() => {
          if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
          setIsPlaying(false);
          if (onComplete) onComplete();
        }, 180);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    setMounted(true);
    const updateSize = () => {
      setDimensions({
        width: typeof window !== "undefined" ? window.innerWidth : 1920,
        height: typeof window !== "undefined" ? window.innerHeight : 1080,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleSkip();
    };
    window.addEventListener("keydown", handleKeyDown);

    // Auto-start takeoff sequence immediately on mount
    startFlight();

    return () => {
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("keydown", handleKeyDown);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    };
  }, []);

  if (!mounted || !isPlaying) return null;

  const W = dimensions.width;
  const H = dimensions.height;

  // Pure diagonal flight path matching Pinterest reference (Image 2)
  const startX = -120;
  const startY = H + 80;
  const endX = W + 140;
  const endY = -120;

  const dx = endX - startX;
  const dy = endY - startY;
  const flightDist = Math.hypot(dx, dy);
  const uX = dx / flightDist;
  const uY = dy / flightDist;

  // Tangent angle
  const angleRad = Math.atan2(dy, dx);
  const angleDeg = (angleRad * 180) / Math.PI + 90;

  const t = Math.max(0.001, Math.min(1, progress));

  // Plane center coordinates along the balanced diagonal
  const planeX = startX + t * dx;
  const planeY = startY + t * dy;

  // Tail coordinates: exactly 42px behind plane center along longitudinal axis
  const tailDistance = 42;
  const tailX = planeX - uX * tailDistance;
  const tailY = planeY - uY * tailDistance;

  // Exact Unit Normal Vectors perpendicular to flight path:
  // nTop points to the upper-left side (above the plane)
  // nBot points to the lower-right side (below the plane)
  // nBot = -nTop (100% mathematically opposite and symmetric!)
  const nTopX = uY;
  const nTopY = -uX;
  const nBotX = -uY;
  const nBotY = uX;

  // Dynamic scoop expansion backwards from the tail along the flight line
  const Dback = t * flightDist + 180;

  // Symmetric Scoop Bezier Control Points (exact mirror across plane's axis)
  // Upper side (Top Blue flap):
  const P1X = tailX - 0.28 * Dback * uX + 0.12 * Dback * nTopX;
  const P1Y = tailY - 0.28 * Dback * uY + 0.12 * Dback * nTopY;
  const P2X = tailX - 0.62 * Dback * uX + 0.46 * Dback * nTopX;
  const P2Y = tailY - 0.62 * Dback * uY + 0.46 * Dback * nTopY;
  const AtopX = tailX - 1.10 * Dback * uX + 0.90 * Dback * nTopX;
  const AtopY = tailY - 1.10 * Dback * uY + 0.90 * Dback * nTopY;

  // Lower side (Bottom Blue flap - IDENTICAL proportion and distance):
  const Q1X = tailX - 0.28 * Dback * uX + 0.12 * Dback * nBotX;
  const Q1Y = tailY - 0.28 * Dback * uY + 0.12 * Dback * nBotY;
  const Q2X = tailX - 0.62 * Dback * uX + 0.46 * Dback * nBotX;
  const Q2Y = tailY - 0.62 * Dback * uY + 0.46 * Dback * nBotY;
  const AbotX = tailX - 1.10 * Dback * uX + 0.90 * Dback * nBotX;
  const AbotY = tailY - 1.10 * Dback * uY + 0.90 * Dback * nBotY;

  // Far corners outside viewport to seamlessly cut out bottom-left
  const ExtBotX = AbotX - 800 * uX + 500 * nBotX;
  const ExtBotY = AbotY - 800 * uY + 500 * nBotY;
  const CornerX = -700;
  const CornerY = H + 700;
  const ExtTopX = AtopX - 800 * uX + 500 * nTopX;
  const ExtTopY = AtopY - 800 * uY + 500 * nTopY;

  // Symmetrical White Scoop Mask Path
  const scoopPath = `
    M ${AtopX} ${AtopY}
    C ${P2X} ${P2Y}, ${P1X} ${P1Y}, ${tailX} ${tailY}
    C ${Q1X} ${Q1Y}, ${Q2X} ${Q2Y}, ${AbotX} ${AbotY}
    L ${ExtBotX} ${ExtBotY}
    L ${CornerX} ${CornerY}
    L ${ExtTopX} ${ExtTopY}
    Z
  `;

  // Symmetrical Crest Edge Line
  const boundaryPath = `
    M ${AtopX} ${AtopY}
    C ${P2X} ${P2Y}, ${P1X} ${P1Y}, ${tailX} ${tailY}
    C ${Q1X} ${Q1Y}, ${Q2X} ${Q2Y}, ${AbotX} ${AbotY}
  `;

  return (
    <div
      className={`fixed inset-0 z-[9999] pointer-events-none overflow-hidden select-none transition-opacity duration-300 ${
        progress >= 0.99 ? "opacity-0" : "opacity-100"
      }`}
      style={{
        backgroundColor: "transparent",
        willChange: "transform, opacity",
        transform: "translate3d(0, 0, 0)",
      }}
    >
      {/* SVG Canvas for Symmetrical Blue Curtain & Locked Airplane */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none select-none z-10"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="overlaySkyGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E88E5" />
            <stop offset="60%" stopColor="#1976D2" />
            <stop offset="100%" stopColor="#1565C0" />
          </linearGradient>

          {/* Symmetrical Mask: Keeps Blue Screen on Both Sides, Cuts out the White Scoop Behind Tail */}
          <mask id="curtainRevealMask">
            <rect x="-800" y="-800" width={W + 1600} height={H + 1600} fill="#FFFFFF" />
            {t > 0.01 && <path d={scoopPath} fill="#000000" />}
          </mask>

          <filter id="curtainEdgeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="-4" dy="4" stdDeviation="10" floodColor="#0A3D73" floodOpacity="0.38" />
          </filter>
        </defs>

        {/* Dynamic Curved Blue Screen with Symmetrical Scoop Cutout */}
        {progress < 0.98 && (
          <rect
            x="0"
            y="0"
            width={W}
            height={H}
            fill="url(#overlaySkyGrad)"
            mask="url(#curtainRevealMask)"
          />
        )}

        {/* Subtle Drop Shadow / Crest along the curved scoop edge */}
        {progress > 0.01 && progress < 0.98 && (
          <path
            d={boundaryPath}
            fill="none"
            stroke="rgba(10, 61, 115, 0.32)"
            strokeWidth="3.5"
          />
        )}

        {/* Airplane Silhouette ΓÇö Inside the EXACT SAME SVG COORDINATE SYSTEM */}
        {progress < 0.99 && (
          <g
            transform={`translate(${planeX}, ${planeY}) rotate(${angleDeg}) scale(1.15)`}
            filter="drop-shadow(-6px 12px 14px rgba(10,61,115,0.45))"
          >
            {/* Fuselage & Nose */}
            <path
              d="M 0 -46 C -3 -38, -4 -20, -4 15 C -4 32, -2 42, 0 46 C 2 42, 4 32, 4 15 C 4 -20, 3 -38, 0 -46 Z"
              fill="#FFFFFF"
            />
            {/* Main Swept Wings */}
            <path
              d="M -2 -12 L -43 8 C -46 10, -46 13, -41 13 L -3 2 Z"
              fill="#FFFFFF"
            />
            <path
              d="M 2 -12 L 43 8 C 46 10, 46 13, 41 13 L 3 2 Z"
              fill="#FFFFFF"
            />
            {/* Wing Jet Engines */}
            <rect x="-28" y="2" width="4" height="10" rx="2" fill="#E2E8F0" />
            <rect x="-17" y="-3" width="4" height="10" rx="2" fill="#E2E8F0" />
            <rect x="24" y="2" width="4" height="10" rx="2" fill="#E2E8F0" />
            <rect x="13" y="-3" width="4" height="10" rx="2" fill="#E2E8F0" />
            {/* Tail Horizontal Stabilizers */}
            <path
              d="M -2 33 L -22 42 C -24 43, -24 45, -21 45 L -2 41 Z"
              fill="#FFFFFF"
            />
            <path
              d="M 2 33 L 22 42 C 24 43, 24 45, 21 45 L 2 41 Z"
              fill="#FFFFFF"
            />
            {/* Vertical Tail Fin */}
            <path d="M -0.5 26 L -0.5 44 L 0.5 44 L 0.5 26 Z" fill="#CBD5E1" />
          </g>
        )}
      </svg>

      {/* =========================================================================
          RADIANT SHINE OF LIGHT / LENS FLARE FLASH
          "once it is over where will shine a light and or main dashboard will show"
          ========================================================================= */}
      <div
        className="absolute inset-0 pointer-events-none z-50 transition-opacity duration-300 flex items-center justify-center"
        style={{
          opacity: lightBurstOpacity,
          background: `radial-gradient(circle at 80% 20%, rgba(255,255,255,1) 0%, rgba(220,240,255,0.95) 25%, rgba(100,180,255,0.7) 50%, rgba(255,255,255,0.9) 100%)`,
        }}
      >
        {/* Radiant Light Starburst Streaks */}
        <svg className="w-full h-full absolute inset-0 opacity-80 animate-spin" style={{ animationDuration: '8s' }} viewBox="0 0 1000 1000">
          <circle cx="800" cy="200" r="180" fill="url(#sunFlare)" />
          <defs>
            <radialGradient id="sunFlare" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="30%" stopColor="#FFF4D0" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#74BCFB" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Radiant Beams of Light */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
            <line
              key={i}
              x1="800"
              y1="200"
              x2={800 + Math.cos((deg * Math.PI) / 180) * 1200}
              y2={200 + Math.sin((deg * Math.PI) / 180) * 1200}
              stroke="#FFFFFF"
              strokeWidth={i % 2 === 0 ? "8" : "3"}
              strokeOpacity="0.6"
            />
          ))}
        </svg>

        {/* Pure cinematic radiant light burst / lens flare dissolve */}
      </div>
    </div>
  );
};

