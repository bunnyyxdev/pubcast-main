"use client";

import { useState, useEffect } from "react";
import { Calendar, Gift, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToastContext } from "@/components/ToastProvider";

export function DailyCheckIn() {
  const { user } = useAuth();
  const toast = useToastContext();
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkCheckInStatus();
  }, [user]);

  const checkCheckInStatus = async () => {
    if (!user) return;
    
    try {
      const response = await fetch("/api/gamification/checkin/status", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCheckedIn(data.checkedIn || false);
      }
    } catch (error) {
      console.error("Failed to check check-in status:", error);
    }
  };

  const handleCheckIn = async () => {
    if (!user || checkedIn || loading) return;

    setLoading(true);
    try {
      const response = await fetch("/api/gamification/checkin", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setCheckedIn(true);
        toast.success(`เช็คอินสำเร็จ! ได้รับ ${data.points || 10} คะแนน`);
        // Refresh user data to update points
        window.location.reload();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "เกิดข้อผิดพลาดในการเช็คอิน");
      }
    } catch (error) {
      console.error("Failed to check in:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-purple-400" />
          <div>
            <p className="text-sm font-semibold">เช็คอินรายวัน</p>
            <p className="text-xs text-gray-400">รับคะแนนฟรีทุกวัน!</p>
          </div>
        </div>
        <button
          onClick={handleCheckIn}
          disabled={checkedIn || loading}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            checkedIn
              ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
        >
          {checkedIn ? (
            <>
              <CheckCircle className="w-4 h-4" />
              เช็คอินแล้ว
            </>
          ) : (
            <>
              <Gift className="w-4 h-4" />
              เช็คอิน
            </>
          )}
        </button>
      </div>
    </div>
  );
}

