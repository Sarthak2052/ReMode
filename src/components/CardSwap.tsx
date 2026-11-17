"use client";

import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  ReactNode,
  HTMLAttributes,
} from 'react';
import gsap from 'gsap';
import './CardSwap.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  customClass?: string;
  children?: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ customClass, className, ...rest }, ref) => (
    <div
      ref={ref}
      {...rest}
      className={`card ${customClass ?? ''} ${className ?? ''}`.trim()}
    />
  )
);
Card.displayName = 'Card';

export interface CardSwapHandle {
  next: () => void;
  prev: () => void;
}

export interface CardSwapProps {
  width?: number | string;
  height?: number | string;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  onCardClick?: (idx: number) => void;
  onCardChange?: (frontIdx: number) => void;
  skewAmount?: number;
  easing?: 'linear' | 'elastic';
  children: ReactNode;
  className?: string;
}

const makeSlot = (i: number, distX: number, distY: number, total: number) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
});

const placeNow = (
  el: HTMLElement | null,
  slot: { x: number; y: number; z: number; zIndex: number },
  skew: number
) => {
  if (!el) return;
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true,
  });
};

export const CardSwap = forwardRef<CardSwapHandle, CardSwapProps>(
  (
    {
      width = 500,
      height = 400,
      cardDistance = 60,
      verticalDistance = 70,
      delay = 5000,
      pauseOnHover = false,
      onCardClick,
      onCardChange,
      skewAmount = 6,
      easing = 'elastic',
      children,
      className = '',
    },
    forwardedRef
  ) => {
    const config =
      easing === 'elastic'
        ? {
            ease: 'elastic.out(0.6,0.9)',
            durDrop: 1.8,
            durMove: 1.8,
            durReturn: 1.8,
            promoteOverlap: 0.9,
            returnDelay: 0.05,
          }
        : {
            ease: 'power1.inOut',
            durDrop: 0.8,
            durMove: 0.8,
            durReturn: 0.8,
            promoteOverlap: 0.45,
            returnDelay: 0.2,
          };

    const childArr = useMemo(() => Children.toArray(children), [children]);
    const refs = useMemo(
      () => childArr.map(() => React.createRef<HTMLDivElement>()),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [childArr.length]
    );

    const order = useRef(Array.from({ length: childArr.length }, (_, i) => i));
    const tlRef = useRef<gsap.core.Timeline | null>(null);
    const intervalRef = useRef<number | undefined>();
    const container = useRef<HTMLDivElement | null>(null);
    const isAnimating = useRef(false);

    // Swap Next (front card drops down and returns to back)
    const swapNext = () => {
      if (order.current.length < 2 || isAnimating.current) return;
      isAnimating.current = true;

      const [front, ...rest] = order.current;
      const elFront = refs[front]?.current;
      if (!elFront) {
        isAnimating.current = false;
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimating.current = false;
        },
      });
      tlRef.current = tl;

      tl.to(elFront, {
        y: '+=520',
        duration: config.durDrop,
        ease: config.ease,
      });

      tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const el = refs[idx]?.current;
        if (!el) return;
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        tl.set(el, { zIndex: slot.zIndex }, 'promote');
        tl.to(
          el,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: config.durMove,
            ease: config.ease,
          },
          `promote+=${i * 0.15}`
        );
      });

      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
      tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
      tl.call(
        () => {
          if (elFront) {
            gsap.set(elFront, { zIndex: backSlot.zIndex });
          }
        },
        undefined,
        'return'
      );
      tl.to(
        elFront,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          duration: config.durReturn,
          ease: config.ease,
        },
        'return'
      );

      tl.call(() => {
        order.current = [...rest, front];
        onCardChange?.(rest[0]);
      });
    };

    // Swap Prev (back card swings to front)
    const swapPrev = () => {
      if (order.current.length < 2 || isAnimating.current) return;
      isAnimating.current = true;

      const last = order.current[order.current.length - 1];
      const rest = order.current.slice(0, -1);
      const elLast = refs[last]?.current;
      if (!elLast) {
        isAnimating.current = false;
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimating.current = false;
        },
      });
      tlRef.current = tl;

      // Drop back card out and bring to top slot
      const frontSlot = makeSlot(0, cardDistance, verticalDistance, refs.length);
      tl.to(elLast, {
        y: '+=520',
        duration: config.durDrop * 0.8,
        ease: config.ease,
      });

      tl.addLabel('demote', `-=${config.durDrop * 0.7}`);
      rest.forEach((idx, i) => {
        const el = refs[idx]?.current;
        if (!el) return;
        const slot = makeSlot(i + 1, cardDistance, verticalDistance, refs.length);
        tl.to(
          el,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: config.durMove,
            ease: config.ease,
          },
          `demote+=${i * 0.1}`
        );
        tl.set(el, { zIndex: slot.zIndex }, `demote+=${i * 0.1}`);
      });

      tl.call(
        () => {
          if (elLast) {
            gsap.set(elLast, { zIndex: frontSlot.zIndex });
          }
        },
        undefined,
        'demote+=0.2'
      );

      tl.to(
        elLast,
        {
          x: frontSlot.x,
          y: frontSlot.y,
          z: frontSlot.z,
          duration: config.durReturn,
          ease: config.ease,
        },
        'demote+=0.2'
      );

      tl.call(() => {
        order.current = [last, ...rest];
        onCardChange?.(last);
      });
    };

    const swapNextRef = useRef(swapNext);
    swapNextRef.current = swapNext;

    const resetInterval = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (delay > 0) {
        intervalRef.current = window.setInterval(() => {
          swapNextRef.current();
        }, delay);
      }
    };

    useImperativeHandle(forwardedRef, () => ({
      next: () => {
        swapNext();
        resetInterval();
      },
      prev: () => {
        swapPrev();
        resetInterval();
      },
    }));

    useEffect(() => {
      const total = refs.length;
      refs.forEach((r, i) => {
        placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount);
      });

      if (delay > 0) {
        intervalRef.current = window.setInterval(() => {
          swapNextRef.current();
        }, delay);
      }

      const node = container.current;
      if (pauseOnHover && node) {
        const pause = () => {
          tlRef.current?.pause();
          clearInterval(intervalRef.current);
        };
        const resume = () => {
          tlRef.current?.play();
          if (delay > 0) {
            intervalRef.current = window.setInterval(() => {
              swapNextRef.current();
            }, delay);
          }
        };
        node.addEventListener('mouseenter', pause);
        node.addEventListener('mouseleave', resume);
        return () => {
          node.removeEventListener('mouseenter', pause);
          node.removeEventListener('mouseleave', resume);
          clearInterval(intervalRef.current);
        };
      }

      return () => clearInterval(intervalRef.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing]);

    // Drag / Swipe listener to make cards movable via touch / mouse swipe
    useEffect(() => {
      const node = container.current;
      if (!node) return;

      let startX = 0;
      let startY = 0;
      let isDragging = false;

      const handlePointerDown = (e: PointerEvent) => {
        startX = e.clientX;
        startY = e.clientY;
        isDragging = true;
      };

      const handlePointerUp = (e: PointerEvent) => {
        if (!isDragging) return;
        isDragging = false;
        const diffX = e.clientX - startX;
        const diffY = e.clientY - startY;

        // If swiped down or to the left, swap next; if swiped up or right, swap prev
        if (Math.abs(diffX) > 40 || Math.abs(diffY) > 40) {
          if (diffY > 40 || diffX < -40) {
            swapNext();
            resetInterval();
          } else if (diffY < -40 || diffX > 40) {
            swapPrev();
            resetInterval();
          }
        }
      };

      node.addEventListener('pointerdown', handlePointerDown);
      window.addEventListener('pointerup', handlePointerUp);

      return () => {
        node.removeEventListener('pointerdown', handlePointerDown);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }, []);

    const rendered = childArr.map((child, i) =>
      isValidElement(child)
        ? cloneElement(child as React.ReactElement, {
            key: i,
            ref: refs[i],
            style: { width, height, ...(child.props.style ?? {}) },
            onClick: (e: React.MouseEvent) => {
              child.props.onClick?.(e);
              onCardClick?.(i);
              swapNext(); // Movable on click!
              resetInterval();
            },
          })
        : child
    );

    return (
      <div
        ref={container}
        className={`card-swap-container ${className}`.trim()}
        style={{ width, height }}
      >
        {rendered}
      </div>
    );
  }
);

CardSwap.displayName = 'CardSwap';
export default CardSwap;
