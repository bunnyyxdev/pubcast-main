"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, DollarSign, Calendar, FileText, Download, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToastContext } from "@/components/ToastProvider";
import { PageSkeleton } from "@/components/LoadingSkeleton";

interface Payment {
  id: number;
  amount: number;
  serviceType: string;
  status: string;
  createdAt: string;
}

export default function PaymentHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const toast = useToastContext();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    } else if (user) {
      loadPayments();
    }
  }, [user, authLoading, router]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/payments", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
        setTotalSpent(data.totalSpent || 0);
      } else {
        toast.error("ไม่สามารถโหลดประวัติการชำระเงินได้");
      }
    } catch (error) {
      console.error("Failed to load payments:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (paymentId: number) => {
    try {
      const response = await fetch(`/api/user/payments/${paymentId}/receipt`, {
        credentials: "include",
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `receipt-${paymentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("ดาวน์โหลดใบเสร็จสำเร็จ");
      } else {
        toast.error("ไม่สามารถดาวน์โหลดใบเสร็จได้");
      }
    } catch (error) {
      console.error("Failed to download receipt:", error);
      toast.error("เกิดข้อผิดพลาด");
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
          <h1 className="ml-2 text-lg font-bold">ประวัติการชำระเงิน</h1>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Summary Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">ยอดใช้จ่ายทั้งหมด</p>
                <p className="text-3xl font-bold text-white">{totalSpent.toLocaleString()} ฿</p>
              </div>
              <DollarSign className="w-12 h-12 text-purple-400 opacity-50" />
            </div>
          </div>

          {/* Payments List */}
          {payments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>ยังไม่มีประวัติการชำระเงิน</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-white mb-1">
                        {payment.serviceType === 'image' ? 'ส่งรูปขึ้นจอ' : 
                         payment.serviceType === 'message' ? 'ส่งข้อความขึ้นจอ' :
                         payment.serviceType === 'video' ? 'ส่งวิดีโอขึ้นจอ' :
                         payment.serviceType}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(payment.createdAt).toLocaleString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-400">
                        {payment.amount.toLocaleString()} ฿
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        payment.status === 'completed' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {payment.status === 'completed' ? 'สำเร็จ' : payment.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadReceipt(payment.id)}
                    className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    ดาวน์โหลดใบเสร็จ
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

