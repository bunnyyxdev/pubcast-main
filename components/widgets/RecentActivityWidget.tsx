"use client";

import { useState, useEffect } from "react";
import { Activity, MessageSquare, Image, DollarSign, Clock } from "lucide-react";

interface ActivityItem {
  id: number;
  type: "message" | "image" | "payment";
  username: string;
  action: string;
  time: string;
}

export function RecentActivityWidget() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate recent activities
    const fetchActivities = async () => {
      try {
        // TODO: Replace with real API endpoint
        // const response = await fetch('/api/activities');
        // const data = await response.json();
        
        // Simulated data
        setTimeout(() => {
          setActivities([
            {
              id: 1,
              type: "payment",
              username: "user123",
              action: "ชำระเงิน ฿129",
              time: "2 นาทีที่แล้ว",
            },
            {
              id: 2,
              type: "image",
              username: "john_doe",
              action: "ส่งรูปขึ้นจอ",
              time: "5 นาทีที่แล้ว",
            },
            {
              id: 3,
              type: "message",
              username: "sara_smith",
              action: "ส่งข้อความ",
              time: "8 นาทีที่แล้ว",
            },
            {
              id: 4,
              type: "payment",
              username: "mike_wilson",
              action: "ชำระเงิน ฿89",
              time: "12 นาทีที่แล้ว",
            },
          ]);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
        setLoading(false);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "message":
        return MessageSquare;
      case "image":
        return Image;
      case "payment":
        return DollarSign;
      default:
        return Activity;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "message":
        return "text-blue-400 bg-blue-500/20";
      case "image":
        return "text-purple-400 bg-purple-500/20";
      case "payment":
        return "text-green-400 bg-green-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10 animate-pulse">
        <div className="h-4 w-32 bg-white/10 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-white/10 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-purple-400" />
        <h3 className="text-sm font-bold text-white">กิจกรรมล่าสุด</h3>
      </div>
      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">ยังไม่มีกิจกรรม</p>
        ) : (
          activities.map((activity) => {
            const Icon = getIcon(activity.type);
            return (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg ${getColor(activity.type)} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-medium truncate">
                    <span className="text-purple-400">{activity.username}</span> {activity.action}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

