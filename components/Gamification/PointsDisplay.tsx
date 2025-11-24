"use client";

import { Coins, Trophy, Flame } from "lucide-react";

interface PointsDisplayProps {
  points: number;
  streak?: number;
  badges?: number;
}

export function PointsDisplay({ points, streak = 0, badges = 0 }: PointsDisplayProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-3 py-1.5">
        <Coins className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-semibold text-yellow-400">{points.toLocaleString()}</span>
      </div>
      {streak > 0 && (
        <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-lg px-3 py-1.5">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-semibold text-orange-400">{streak} วัน</span>
        </div>
      )}
      {badges > 0 && (
        <div className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-1.5">
          <Trophy className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-purple-400">{badges}</span>
        </div>
      )}
    </div>
  );
}

