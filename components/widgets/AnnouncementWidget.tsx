"use client";

import { useState, useEffect } from "react";
import { Megaphone, X } from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "success";
}

export function AnnouncementWidget() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Simulate fetching announcement
    // TODO: Replace with real API endpoint
    const fetchAnnouncement = async () => {
      try {
        // const response = await fetch('/api/announcements');
        // const data = await response.json();
        
        // Simulated data
        setTimeout(() => {
          setAnnouncement({
            id: 1,
            title: "โปรโมชั่นพิเศษ!",
            message: "ส่งรูปขึ้นจอฟรีทุกวัน 18:00-22:00 น.",
            type: "success",
          });
        }, 500);
      } catch (error) {
        console.error("Failed to fetch announcement:", error);
      }
    };

    fetchAnnouncement();
  }, []);

  if (!announcement || dismissed) return null;

  const colors = {
    info: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    warning: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30",
    success: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  };

  return (
    <div className={`bg-gradient-to-r ${colors[announcement.type]} rounded-2xl p-4 border backdrop-blur-md relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white mb-1">{announcement.title}</h4>
              <p className="text-xs text-gray-200">{announcement.message}</p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/60 hover:text-white transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

