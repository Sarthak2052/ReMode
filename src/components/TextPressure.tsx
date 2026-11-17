"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getAttr = (distance: number, maxDist: number, minVal: number, maxVal: number) => {
  const t = Math.max(0, Math.min(1, 1 - distance / maxDist));
  const smooth = t * t * (3 - 2 * t);
  return minVal + (maxVal - minVal) * smooth;
};

const debounce = <T extends (...args: unknown[]) => void>(func: T, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export interface TextPressureProps {
  text?: string;
  fontFamily?: string;
  fontUrl?: string;
  width?: boolean;
  weight?: boolean;
  italic?: boolean;
  alpha?: boolean;
  flex?: boolean;
  stroke?: boolean;
  scale?: boolean;
  textColor?: string;
  strokeColor?: string;
  className?: string;
  minFontSize?: number;
  fontSize?: number;
}

export const TextPressure: React.FC<TextPressureProps> = ({
  text = "Compressa",
  fontFamily = "Roboto Flex",
  fontUrl = "https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wdth,wght@8..144,25..151,100..1000&display=swap",

  width = true,
  weight = true,
  italic = true,
  alpha = false,

  flex = true,
  stroke = false,
  scale = false,

  textColor = "#0F1B2B",
  strokeColor = "#1C6FD9",
  className = "",

  minFontSize = 24,
  fontSize: propFontSize,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const spansRef = useRef<(HTMLSpanElement | null)[]>([]);

  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cursorRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [fontSize, setFontSize] = useState(minFontSize);
  const [scaleY, setScaleY] = useState(1);
  const [lineHeight, setLineHeight] = useState(1);

  const chars = text.split("");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) {
        cursorRef.current.x = t.clientX;
        cursorRef.current.y = t.clientY;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    if (containerRef.current) {
      const { left, top, width: containerW, height: containerH } =
        containerRef.current.getBoundingClientRect();
      mouseRef.current.x = left + containerW / 2;
      mouseRef.current.y = top + containerH / 2;
      cursorRef.current.x = mouseRef.current.x;
      cursorRef.current.y = mouseRef.current.y;
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  const setSize = useCallback(() => {
    if (!containerRef.current || !titleRef.current) return;

    const { width: containerW, height: containerH } =
      containerRef.current.getBoundingClientRect();

    let autoSize = containerW / (chars.length / 2);
    if (!scale && containerH > 0) {
      autoSize = Math.min(autoSize, containerH * 0.92);
    }
    let newFontSize = propFontSize || autoSize;
    if (!Number.isFinite(newFontSize) || newFontSize <= 0) {
      newFontSize = minFontSize;
    }
    newFontSize = Math.max(newFontSize, minFontSize);

    setFontSize(newFontSize);
    setScaleY(1);
    setLineHeight(1);

    requestAnimationFrame(() => {
      if (!titleRef.current) return;
      const textRect = titleRef.current.getBoundingClientRect();

      if (scale && textRect.height > 0) {
        const yRatio = containerH / textRect.height;
        setScaleY(yRatio);
        setLineHeight(yRatio);
      }
    });
  }, [chars.length, minFontSize, propFontSize, scale]);

  useEffect(() => {
    setSize();
    const debouncedSetSize = debounce(setSize, 80);
    window.addEventListener("resize", debouncedSetSize);
    return () => window.removeEventListener("resize", debouncedSetSize);
  }, [setSize]);

  useEffect(() => {
    let rafId: number;
    let isSettled = false;

    // Cache span center coordinates relative to title container to eliminate 60fps forced layout thrashing
    let cachedCenters: { x: number; y: number }[] = [];
    const measureCenters = () => {
      if (!titleRef.current) return;
      cachedCenters = spansRef.current.map((span) => {
        if (!span) return { x: 0, y: 0 };
        return {
          x: span.offsetLeft + span.offsetWidth / 2,
          y: span.offsetTop + span.offsetHeight / 2,
        };
      });
    };

    measureCenters();
    window.addEventListener("resize", measureCenters);

    const animate = () => {
      const dxMouse = cursorRef.current.x - mouseRef.current.x;
      const dyMouse = cursorRef.current.y - mouseRef.current.y;
      
      const isMoving = Math.abs(dxMouse) > 0.05 || Math.abs(dyMouse) > 0.05;
      if (isMoving) {
        mouseRef.current.x += dxMouse / 7.5;
        mouseRef.current.y += dyMouse / 7.5;
        isSettled = false;
      } else if (!isSettled) {
        mouseRef.current.x = cursorRef.current.x;
        mouseRef.current.y = cursorRef.current.y;
        isSettled = true;
      }

      if (titleRef.current && (!isSettled || isMoving)) {
        const titleRect = titleRef.current.getBoundingClientRect();
        const maxDist = Math.max(titleRect.width / 2.8, 170);

        spansRef.current.forEach((span, i) => {
          if (!span) return;

          const centerOffset = cachedCenters[i] || {
            x: span.offsetLeft + span.offsetWidth / 2,
            y: span.offsetTop + span.offsetHeight / 2,
          };

          const charCenter = {
            x: titleRect.left + centerOffset.x,
            y: titleRect.top + centerOffset.y,
          };

          const d = dist(mouseRef.current, charCenter);

          const wdth = width ? Math.floor(getAttr(d, maxDist, 120, 100)) : 100;
          const wght = weight ? Math.floor(getAttr(d, maxDist, 900, 680)) : 900;
          const italVal = italic ? getAttr(d, maxDist, 0, 0.14).toFixed(2) : "0";
          const liftVal = getAttr(d, maxDist, 0, -2);

          const newFontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;

          if (span.style.fontVariationSettings !== newFontVariationSettings) {
            span.style.fontVariationSettings = newFontVariationSettings;
          }
          const transformVal = `translate3d(0, ${liftVal.toFixed(1)}px, 0)`;
          if (span.style.transform !== transformVal) {
            span.style.transform = transformVal;
          }
        });
      }

      rafId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      window.removeEventListener("resize", measureCenters);
      cancelAnimationFrame(rafId);
    };
  }, [width, weight, italic, alpha]);

  const styleElement = useMemo(() => {
    return (
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .tp-flex {
              display: flex;
              justify-content: space-between;
            }

            .tp-stroke span {
              position: relative;
              color: ${textColor};
            }
            .tp-stroke span::after {
              content: attr(data-char);
              position: absolute;
              left: 0;
              top: 0;
              color: transparent;
              z-index: -1;
              -webkit-text-stroke-width: 3px;
              -webkit-text-stroke-color: ${strokeColor};
            }

            .text-pressure-title {
              color: ${textColor};
            }
          `,
        }}
      />
    );
  }, [textColor, strokeColor]);

  const dynamicClassName = [
    className,
    flex ? "tp-flex" : "",
    stroke ? "tp-stroke" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={containerRef}
      onMouseLeave={() => {
        cursorRef.current = { x: -9999, y: -9999 };
      }}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "transparent",
      }}
    >
      {styleElement}
      <h1
        ref={titleRef}
        className={`text-pressure-title ${dynamicClassName}`}
        style={{
          fontFamily: `"${fontFamily}", "Plus Jakarta Sans", system-ui, -apple-system, sans-serif`,
          textTransform: "uppercase",
          fontSize: fontSize,
          lineHeight,
          transform: `scale(1, ${scaleY})`,
          transformOrigin: "center top",
          margin: 0,
          textAlign: "left",
          userSelect: "none",
          whiteSpace: "nowrap",
          fontWeight: 900,
          fontVariationSettings: "'wght' 900, 'wdth' 125, 'ital' 0",
          width: "100%",
        }}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            ref={(el) => {
              spansRef.current[i] = el;
            }}
            data-char={char}
            style={{
              display: "inline-block",
              color: stroke ? undefined : textColor,
              fontWeight: 900,
              fontVariationSettings: "'wght' 900, 'wdth' 125, 'ital' 0",
              willChange: "font-variation-settings, transform",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default TextPressure;
