"use client";

import { ReactNode, useRef, useState, useEffect } from "react";

interface SwipeActionsProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  threshold?: number;
}

export function SwipeActions({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  threshold = 100,
}: SwipeActionsProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef<number>(0);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    setSwipeOffset(diff);
  };

  const handleTouchEnd = () => {
    if (Math.abs(swipeOffset) > threshold) {
      if (swipeOffset > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (swipeOffset < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    setSwipeOffset(0);
    setIsSwiping(false);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Left Action */}
      {leftAction && swipeOffset < 0 && (
        <div className="absolute left-0 top-0 bottom-0 flex items-center bg-red-500/20 px-4">
          {leftAction}
        </div>
      )}
      
      {/* Main Content */}
      <div
        ref={elementRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
        }}
        className="relative z-10"
      >
        {children}
      </div>

      {/* Right Action */}
      {rightAction && swipeOffset > 0 && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center bg-green-500/20 px-4">
          {rightAction}
        </div>
      )}
    </div>
  );
}

