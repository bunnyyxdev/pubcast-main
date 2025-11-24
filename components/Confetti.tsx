"use client";

import { useEffect, useState } from "react";

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function Confetti({ trigger, onComplete }: ConfettiProps) {
  const [confetti, setConfetti] = useState<Array<{
    id: number;
    x: number;
    y: number;
    rotation: number;
    color: string;
    delay: number;
  }>>([]);

  useEffect(() => {
    if (trigger) {
      const colors = [
        "#FFD700", // Gold
        "#FF6B6B", // Red
        "#4ECDC4", // Teal
        "#45B7D1", // Blue
        "#FFA07A", // Light Salmon
        "#98D8C8", // Mint
        "#F7DC6F", // Yellow
        "#BB8FCE", // Purple
      ];

      const newConfetti = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
      }));

      setConfetti(newConfetti);

      // Clean up after animation
      const timer = setTimeout(() => {
        setConfetti([]);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (confetti.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            backgroundColor: piece.color,
            animation: `confetti-fall ${2 + Math.random()}s ease-out ${piece.delay}s forwards`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// Simpler confetti burst effect
export function ConfettiBurst({ trigger }: { trigger: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] flex items-center justify-center">
      <div className="relative w-20 h-20">
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 360) / 12;
          const color = [
            "#FFD700",
            "#FF6B6B",
            "#4ECDC4",
            "#45B7D1",
            "#FFA07A",
            "#98D8C8",
          ][i % 6];

          return (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: color,
                left: "50%",
                top: "50%",
                transformOrigin: "0 0",
                animation: `burst-${i} 1s ease-out forwards`,
                "--angle": `${angle}deg`,
                "--distance": "60px",
              } as React.CSSProperties & { "--angle": string; "--distance": string }}
            />
          );
        })}
      </div>
      <style jsx>{`
        ${Array.from({ length: 12 })
          .map(
            (_, i) => `
          @keyframes burst-${i} {
            0% {
              transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) rotate(var(--angle)) translateX(var(--distance));
              opacity: 0;
            }
          }
        `
          )
          .join("")}
      `}</style>
    </div>
  );
}

