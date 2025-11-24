"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToastContext } from "@/components/ToastProvider";

export function PushNotificationManager() {
  const { user } = useAuth();
  const toast = useToastContext();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, [user]);

  const checkSubscription = async () => {
    if (!("serviceWorker" in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("เบราว์เซอร์ไม่รองรับการแจ้งเตือน");
      return;
    }

    const permission = await Notification.requestPermission();
    setPermission(permission);

    if (permission === "granted") {
      toast.success("เปิดการแจ้งเตือนสำเร็จ");
      await subscribeToPush();
    } else {
      toast.error("คุณปฏิเสธการแจ้งเตือน");
    }
  };

  const subscribeToPush = async () => {
    if (!("serviceWorker" in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // VAPID public key (should be in env)
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BEl62iUYgUivxIkv69yViEuiBIa40HIeX0XD9Ij-tEhaVz0JEW6BthDaksoiY7J3lzmzCwpL-nx1jEauAd2N3gM";
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      });

      // Send subscription to server
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subscription }),
      });

      setIsSubscribed(true);
      toast.success("สมัครรับการแจ้งเตือนสำเร็จ");
    } catch (error) {
      console.error("Error subscribing to push:", error);
      toast.error("เกิดข้อผิดพลาดในการสมัครรับการแจ้งเตือน");
    }
  };

  const unsubscribeFromPush = async () => {
    if (!("serviceWorker" in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await fetch("/api/notifications/unsubscribe", {
          method: "POST",
          credentials: "include",
        });
        setIsSubscribed(false);
        toast.success("ยกเลิกการแจ้งเตือนสำเร็จ");
      }
    } catch (error) {
      console.error("Error unsubscribing from push:", error);
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  if (!isSupported || !user) {
    return null;
  }

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isSubscribed ? (
            <Bell className="w-5 h-5 text-green-400" />
          ) : (
            <BellOff className="w-5 h-5 text-gray-400" />
          )}
          <div>
            <p className="text-sm font-semibold">Push Notifications</p>
            <p className="text-xs text-gray-400">
              {isSubscribed ? "เปิดใช้งานอยู่" : permission === "denied" ? "ถูกปฏิเสธ" : "ปิดอยู่"}
            </p>
          </div>
        </div>
        {permission === "granted" ? (
          <button
            onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              isSubscribed
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-green-500/20 text-green-400 border border-green-500/30"
            }`}
          >
            {isSubscribed ? "ปิด" : "เปิด"}
          </button>
        ) : (
          <button
            onClick={requestPermission}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition-colors"
          >
            เปิดใช้งาน
          </button>
        )}
      </div>
    </div>
  );
}

