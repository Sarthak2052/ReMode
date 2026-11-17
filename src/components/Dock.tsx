"use client";

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, MotionValue, SpringOptions } from "motion/react";
import React, { Children, cloneElement, useEffect, useRef, useState } from "react";
import "./Dock.css";

export interface DockItemData {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  className?: string;
  active?: boolean;
}

interface DockItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  distance: number;
  label: string;
  active?: boolean;
}

function DockItem({
  children,
  className = "",
  onClick,
  href,
  mouseX,
  spring,
  distance,
  label,
  active,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  // Measure distance from cursor to stationary center of this slot
  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return distance;
    return val - (rect.left + rect.width / 2);
  });

  // Scale between 1.0 and 1.28
  const targetScale = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [1, 1.28, 1]
  );
  const scale = useSpring(targetScale, spring);

  // Tactile bump upwards by -5px on hover
  const targetY = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [0, -5, 0]
  );
  const y = useSpring(targetY, spring);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      ref={ref}
      className="relative flex items-center justify-center w-[42px] h-[42px] select-none"
    >
      <motion.button
        style={{ scale, y }}
        whileTap={{ scale: 0.94, y: 0 }}
        onHoverStart={() => isHovered.set(1)}
        onHoverEnd={() => isHovered.set(0)}
        onFocus={() => isHovered.set(1)}
        onBlur={() => isHovered.set(0)}
        onClick={onClick}
        className={`dock-item ${className} ${active ? "active" : ""}`}
        tabIndex={0}
        aria-label={label}
        onKeyDown={handleKeyDown}
      >
        {Children.map(children, (child) =>
          React.isValidElement(child)
            ? cloneElement(child as React.ReactElement<{ isHovered: MotionValue<number> }>, { isHovered })
            : child
        )}
      </motion.button>
      <DockLabel isHovered={isHovered}>{label}</DockLabel>
    </div>
  );
}

function DockLabel({
  children,
  className = "",
  isHovered,
}: {
  children: React.ReactNode;
  className?: string;
  isHovered?: MotionValue<number>;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on("change", (latest) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -2, scale: 0.96 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className={`dock-label ${className}`}
          role="tooltip"
          style={{ x: "-50%" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`dock-icon ${className}`}>{children}</div>;
}

export interface DockProps {
  items: DockItemData[];
  className?: string;
  spring?: SpringOptions;
  distance?: number;
}

export default function Dock({
  items,
  className = "",
  spring = { mass: 0.1, stiffness: 260, damping: 20 },
  distance = 110,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <div className="dock-outer">
      <div
        onMouseMove={({ pageX }) => {
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          mouseX.set(Infinity);
        }}
        className={`dock-panel ${className}`}
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            href={item.href}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            label={item.label}
            active={item.active}
          >
            <DockIcon>{item.icon}</DockIcon>
          </DockItem>
        ))}
      </div>
    </div>
  );
}
