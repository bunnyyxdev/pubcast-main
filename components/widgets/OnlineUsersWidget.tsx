"use client";

import { useState, useEffect } from "react";
import { Users, Wifi } from "lucide-react";

export function OnlineUsersWidget() {
  const [onlineCount, setOnlineCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOnlineCount = async () => {
      try {
        const response = await fetch('/api/stats/online', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setOnlineCount(data.count || 0);
        } else {
          console.error('Failed to fetch online users count');
          setOnlineCount(0);
        }
      } catch (error) {
        console.error('Error fetching online users:', error);
        setOnlineCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchOnlineCount();
    const interval = setInterval(fetchOnlineCount, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-4 border border-green-500/30 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-300 mb-1">ผู้ใช้ออนไลน์</p>
            {loading ? (
              <div className="h-6 w-16 bg-white/10 rounded animate-pulse"></div>
            ) : (
              <p className="text-2xl font-bold text-white">{onlineCount}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Wifi className="w-4 h-4 text-green-400 animate-pulse" />
          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
        </div>
      </div>
    </div>
  );
}

