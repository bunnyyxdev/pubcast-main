"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="th">
      <body className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1a1a2e] rounded-2xl p-6 border border-red-500/30 text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">เกิดข้อผิดพลาดร้ายแรง</h2>
          <p className="text-gray-400 mb-6">
            {error.message || "เกิดข้อผิดพลาดที่ไม่คาดคิด"}
          </p>
          <button
            onClick={reset}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-4 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            รีเฟรชหน้า
          </button>
        </div>
      </body>
    </html>
  );
}

