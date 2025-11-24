"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function ClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("th-TH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl p-4 border border-indigo-500/30 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-indigo-400" />
        <h3 className="text-sm font-bold text-white">เวลา</h3>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-white mb-1 font-mono">
          {formatTime(time)}
        </p>
        <p className="text-xs text-gray-300">{formatDate(time)}</p>
      </div>
    </div>
  );
}

