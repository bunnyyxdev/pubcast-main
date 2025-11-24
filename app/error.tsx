"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1a1a2e] rounded-2xl p-6 border border-red-500/30 text-center">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">เกิดข้อผิดพลาด</h2>
        <p className="text-gray-400 mb-6">
          {error.message || "เกิดข้อผิดพลาดที่ไม่คาดคิด"}
        </p>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-4 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            ลองอีกครั้ง
          </button>
          <Link
            href="/"
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </div>
  );
}

