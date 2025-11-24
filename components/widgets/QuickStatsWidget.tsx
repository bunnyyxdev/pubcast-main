"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCard {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down" | "neutral";
}

export function QuickStatsWidget() {
  const stats: StatCard[] = [
    {
      label: "ผู้ใช้ใหม่",
      value: "+12",
      change: 5.2,
      trend: "up",
    },
    {
      label: "ข้อความ/ชม.",
      value: "45",
      change: -2.1,
      trend: "down",
    },
    {
      label: "รายได้วันนี้",
      value: "฿2,450",
      change: 8.5,
      trend: "up",
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return TrendingUp;
      case "down":
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-400";
      case "down":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
      <h3 className="text-sm font-bold text-white mb-4">สถิติย่อ</h3>
      <div className="space-y-3">
        {stats.map((stat, idx) => {
          const TrendIcon = getTrendIcon(stat.trend);
          return (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
            >
              <div>
                <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                <p className="text-lg font-bold text-white">{stat.value}</p>
              </div>
              <div className={`flex items-center gap-1 ${getTrendColor(stat.trend)}`}>
                <TrendIcon className="w-4 h-4" />
                <span className="text-xs font-medium">{Math.abs(stat.change)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

