"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null; // Don't show if online
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-yellow-500/30 text-center max-w-sm w-full">
        <WifiOff className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">ไม่มีอินเทอร์เน็ต</h2>
        <p className="text-gray-400 mb-6">
          กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-4 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          ลองอีกครั้ง
        </button>
      </div>
    </div>
  );
}

