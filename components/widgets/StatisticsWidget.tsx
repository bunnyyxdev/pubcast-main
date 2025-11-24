"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, MessageSquare, DollarSign, Activity } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalMessages: number;
  totalRevenue: number;
  activeToday: number;
}

export function StatisticsWidget() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalMessages: 0,
    totalRevenue: 0,
    activeToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading stats (replace with real API call)
    const fetchStats = async () => {
      try {
        // TODO: Replace with actual API endpoint
        // const response = await fetch('/api/stats');
        // const data = await response.json();
        
        // Simulated data
        setTimeout(() => {
          setStats({
            totalUsers: 1234,
            totalMessages: 5678,
            totalRevenue: 45678,
            activeToday: 89,
          });
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10 animate-pulse">
        <div className="h-4 w-24 bg-white/10 rounded mb-4"></div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-white/10 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      icon: Users,
      label: "ผู้ใช้ทั้งหมด",
      value: stats.totalUsers.toLocaleString(),
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: MessageSquare,
      label: "ข้อความ",
      value: stats.totalMessages.toLocaleString(),
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: DollarSign,
      label: "รายได้",
      value: `฿${stats.totalRevenue.toLocaleString()}`,
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Activity,
      label: "ออนไลน์วันนี้",
      value: stats.activeToday.toLocaleString(),
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-purple-400" />
        <h3 className="text-sm font-bold text-white">สถิติการใช้งาน</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-white/5 to-white/0 rounded-xl p-3 border border-white/5 hover:border-white/10 transition-all"
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
              <stat.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
            <p className="text-lg font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

