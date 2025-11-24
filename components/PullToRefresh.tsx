"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2 } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop !== 0) return;
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;
      if (container.scrollTop !== 0) {
        setIsPulling(false);
        setPullDistance(0);
        return;
      }

      currentY.current = e.touches[0].clientY;
      const distance = Math.max(0, currentY.current - startY.current);
      setPullDistance(Math.min(distance, threshold * 1.5));
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;

      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(threshold);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
      setIsPulling(false);
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove);
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);
  const shouldShowIndicator = pullDistance > 0 || isRefreshing;

  return (
    <div ref={containerRef} className="relative h-full overflow-y-auto">
      {shouldShowIndicator && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center z-10 transition-transform duration-200"
          style={{
            transform: `translateY(${Math.min(pullDistance, threshold)}px)`,
          }}
        >
          <div className="flex flex-col items-center gap-2 py-4">
            {isRefreshing ? (
              <>
                <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                <span className="text-xs text-gray-400">กำลังรีเฟรช...</span>
              </>
            ) : (
              <>
                <div
                  className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent transition-transform"
                  style={{
                    transform: `rotate(${progress * 360}deg)`,
                  }}
                />
                <span className="text-xs text-gray-400">
                  {progress >= 1 ? "ปล่อยเพื่อรีเฟรช" : "ดึงลงเพื่อรีเฟรช"}
                </span>
              </>
            )}
          </div>
        </div>
      )}
      <div
        style={{
          transform: `translateY(${shouldShowIndicator ? Math.min(pullDistance, threshold) : 0}px)`,
          transition: isRefreshing ? "transform 0.2s" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}

