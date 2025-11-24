"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, User as UserIcon, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Message {
  id: number;
  userId: string;
  username: string;
  profilePhoto?: string;
  message: string;
  createdAt: string;
}

export function MessageListWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("/api/chat/messages?limit=10", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.messages && Array.isArray(data.messages)) {
            // Get last 5 messages for preview
            setMessages(data.messages.slice(-5).reverse());
          }
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (seconds < 60) return "เมื่อสักครู่";
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white">ข้อความล่าสุด</h3>
        </div>
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white/10 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white">ข้อความล่าสุด</h3>
        </div>
        <Link
          href="/chat"
          className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
        >
          ดูทั้งหมด
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">ยังไม่มีข้อความ</p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent pr-2"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
              onClick={() => window.location.href = "/chat"}
            >
              {/* Profile Photo */}
              <div className="flex-shrink-0">
                {msg.profilePhoto ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                    <img
                      src={msg.profilePhoto}
                      alt={msg.username}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center"><svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>`;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center border border-white/20">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-white truncate">
                    {msg.username}
                  </span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-gray-300 line-clamp-2 group-hover:text-white transition-colors">
                  {msg.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View All Button */}
      {messages.length > 0 && (
        <Link
          href="/chat"
          className="mt-4 w-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/30 rounded-lg py-2 px-4 flex items-center justify-center gap-2 transition-all group"
        >
          <Send className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
          <span className="text-xs font-medium text-white">ไปที่แชท</span>
        </Link>
      )}
    </div>
  );
}

