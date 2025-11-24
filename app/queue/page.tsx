"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Clock, Play, Loader2, Image as ImageIcon, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToastContext } from "@/components/ToastProvider";
import { PageSkeleton } from "@/components/LoadingSkeleton";

interface QueueItem {
  id: number;
  type: 'image' | 'message' | 'video';
  username: string;
  content: string;
  mediaUrl?: string;
  duration: number;
  position: number;
  estimatedTime: string;
}

export default function QueuePage() {
  const { user, loading: authLoading } = useAuth();
  const toast = useToastContext();
  const router = useRouter();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentItem, setCurrentItem] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    } else if (user) {
      loadQueue();
      const interval = setInterval(loadQueue, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [user, authLoading, router]);

  const loadQueue = async () => {
    try {
      // Get current playing item
      const currentResponse = await fetch("/api/queue/current", {
        credentials: "include",
      });
      if (currentResponse.ok) {
        const currentData = await currentResponse.json();
        setCurrentItem(currentData.currentItem);
      }

      // Get queue
      const response = await fetch("/api/queue", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setQueue(data.queue || []);
      }
    } catch (error) {
      console.error("Failed to load queue:", error);
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
          <Link href="/" className="p-2 -ml-2 text-white/80 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="ml-2 text-lg font-bold">คิวแสดงผล</h1>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Currently Playing */}
          {currentItem && (
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">กำลังแสดง</p>
                  <p className="font-bold text-white">{currentItem.user || 'Unknown'}</p>
                </div>
              </div>
              {currentItem.mediaUrl && (
                <div className="relative w-full h-48 rounded-xl overflow-hidden mb-3">
                  <img
                    src={currentItem.mediaUrl}
                    alt="Current content"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {currentItem.message && (
                <p className="text-gray-300">{currentItem.message}</p>
              )}
            </div>
          )}

          {/* Queue List */}
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              คิวรอแสดง ({queue.length} รายการ)
            </h2>

            {queue.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>ไม่มีคิวรอแสดง</p>
              </div>
            ) : (
              <div className="space-y-3">
                {queue.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center border border-purple-500/30">
                        <span className="text-lg font-bold text-purple-400">#{item.position}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {item.type === 'image' ? (
                            <ImageIcon className="w-4 h-4 text-blue-400" />
                          ) : (
                            <MessageSquare className="w-4 h-4 text-green-400" />
                          )}
                          <span className="font-semibold text-white">{item.username}</span>
                        </div>
                        {item.mediaUrl && (
                          <div className="relative w-full h-32 rounded-lg overflow-hidden mb-2">
                            <img
                              src={item.mediaUrl}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {item.content && (
                          <p className="text-sm text-gray-300 mb-2 line-clamp-2">{item.content}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>ระยะเวลา: {item.duration} วินาที</span>
                          {item.estimatedTime && (
                            <span>ประมาณ: {item.estimatedTime}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

