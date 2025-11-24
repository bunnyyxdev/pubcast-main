"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, BarChart3, Send, DollarSign, MessageSquare, Image as ImageIcon, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToastContext } from "@/components/ToastProvider";
import { PageSkeleton } from "@/components/LoadingSkeleton";

interface DashboardStats {
  totalPosts: number;
  totalMessages: number;
  totalSpent: number;
  postsThisMonth: number;
  messagesThisMonth: number;
  spentThisMonth: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const toast = useToastContext();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    } else if (user) {
      loadStats();
    }
  }, [user, authLoading, router]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/dashboard", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        toast.error("ไม่สามารถโหลดข้อมูลได้");
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden flex justify-center">
        <div className="w-full max-w-[480px] min-h-screen bg-[#0f0f12] shadow-2xl relative flex flex-col border-x border-white/5">
          <PageSkeleton />
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen bg-[#0f0f12] shadow-2xl relative flex flex-col border-x border-white/5">
        
        {/* Header */}
        <div className="p-4 flex items-center border-b border-white/10">
          <Link href="/profile" className="p-2 -ml-2 text-white/80 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="ml-2 text-lg font-bold">สถิติส่วนตัว</h1>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {stats ? (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Send className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-gray-400">ส่งทั้งหมด</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalPosts}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    เดือนนี้: {stats.postsThisMonth}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-gray-400">ข้อความ</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalMessages}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    เดือนนี้: {stats.messagesThisMonth}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-4 col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-400">ยอดใช้จ่าย</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalSpent.toLocaleString()} ฿</p>
                  <p className="text-xs text-gray-400 mt-1">
                    เดือนนี้: {stats.spentThisMonth.toLocaleString()} ฿
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  การกระทำด่วน
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/post"
                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ImageIcon className="w-5 h-5 text-purple-400" />
                    <span>ส่งรูปขึ้นจอ</span>
                  </Link>
                  <Link
                    href="/payment-history"
                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <span>ประวัติการชำระเงิน</span>
                  </Link>
                  <Link
                    href="/queue"
                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <span>ดูคิวแสดงผล</span>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>ไม่พบข้อมูล</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

