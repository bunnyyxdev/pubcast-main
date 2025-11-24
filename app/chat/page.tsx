"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, User as UserIcon, Loader2, Trash2, MoreVertical } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { useToastContext } from "@/components/ToastProvider";
import { PullToRefresh } from "@/components/PullToRefresh";
import { ChatSkeleton } from "@/components/LoadingSkeleton";

interface Message {
  id: number;
  chatId: number;
  userId: string;
  username: string;
  profilePhoto?: string;
  message: string;
  createdAt: string;
}

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const toast = useToastContext();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingMessageId, setDeletingMessageId] = useState<number | null>(null);
  const [showDeleteMenu, setShowDeleteMenu] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<number>(0);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/chat/messages?limit=100", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
          
          // Update last message ID for polling
          if (data.messages.length > 0) {
            const lastMessage = data.messages[data.messages.length - 1];
            lastMessageIdRef.current = lastMessage.id;
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      toast.error("ไม่สามารถโหลดข้อความได้");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  // Poll for new messages every 2 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchMessages();
    }, 2000);

    return () => clearInterval(interval);
  }, [user]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending || !user) return;

    setSending(true);
    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          message: newMessage.trim(),
          chat_id: 1, // Global chat
        }),
      });

      if (response.ok) {
        setNewMessage("");
        toast.success("ส่งข้อความสำเร็จ");
        // Fetch messages again to get the new one
        await fetchMessages();
      } else {
        const data = await response.json();
        const errorMsg = data.error || "เกิดข้อผิดพลาดในการส่งข้อความ";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("เกิดข้อผิดพลาดในการส่งข้อความ");
    } finally {
      setSending(false);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: number) => {
    if (!user) return;
    
    // Show confirmation
    if (!confirm('คุณต้องการลบข้อความนี้หรือไม่?')) {
      return;
    }

    setDeletingMessageId(messageId);
    setShowDeleteMenu(null);

    try {
      const response = await fetch(`/api/chat/messages?message_id=${messageId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("ลบข้อความสำเร็จ");
        // Remove message from local state
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      } else {
        const data = await response.json();
        const errorMsg = data.error || "เกิดข้อผิดพลาดในการลบข้อความ";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
      toast.error("เกิดข้อผิดพลาดในการลบข้อความ");
    } finally {
      setDeletingMessageId(null);
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return "เมื่อสักครู่";
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden flex justify-center">
        <div className="w-full max-w-[480px] min-h-screen bg-[#0f0f12] shadow-2xl relative flex flex-col border-x border-white/5">
          <div className="p-4 flex items-center border-b border-white/10">
            <h1 className="ml-2 text-lg font-bold">แชท (Chat)</h1>
          </div>
          <ChatSkeleton />
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
        <div className="p-4 flex items-center border-b border-white/10 bg-[#0f0f12]/80 backdrop-blur-md sticky top-0 z-10">
          <Link href="/" className="p-2 -ml-2 text-white/80 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="ml-2 text-lg font-bold">แชท (Chat)</h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">ออนไลน์</span>
          </div>
        </div>

        {/* Messages Container with Pull-to-Refresh */}
        <PullToRefresh onRefresh={fetchMessages}>
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 pb-24"
          >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <UserIcon className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-sm">ยังไม่มีข้อความ</p>
              <p className="text-xs mt-1">เริ่มต้นการสนทนาเลย!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = msg.userId === user.id;
              
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}
                >
                  {/* Profile Photo */}
                  <div className="flex-shrink-0">
                    {msg.profilePhoto ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                        <img
                          src={msg.profilePhoto}
                          alt={msg.username}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            e.currentTarget.style.display = "none";
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center"><svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>`;
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center border-2 border-white/20">
                        <UserIcon className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? "items-end" : "items-start"} relative group`}>
                    {!isOwnMessage && (
                      <span className="text-xs text-gray-400 mb-1 px-2">
                        {msg.username}
                      </span>
                    )}
                    <div className="flex items-start gap-2">
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isOwnMessage
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            : "bg-white/10 text-white border border-white/10"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.message}
                        </p>
                      </div>
                      {/* Delete Button - Only show for own messages */}
                      {isOwnMessage && (
                        <div className="relative">
                          <button
                            onClick={() => setShowDeleteMenu(showDeleteMenu === msg.id ? null : msg.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                            disabled={deletingMessageId === msg.id}
                          >
                            {deletingMessageId === msg.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <MoreVertical className="w-4 h-4" />
                            )}
                          </button>
                          {/* Delete Menu */}
                          {showDeleteMenu === msg.id && (
                            <div className="absolute right-0 top-8 bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl z-20 min-w-[120px]">
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-sm">ลบข้อความ</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 mt-1 px-2">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
          </div>
        </PullToRefresh>

        {/* Click outside to close delete menu */}
        {showDeleteMenu && (
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDeleteMenu(null)}
          />
        )}

        {/* Input Area */}
        <div className="sticky bottom-0 p-4 bg-[#0f0f12]/80 backdrop-blur-md border-t border-white/10">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="พิมพ์ข้อความ..."
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={sending}
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <Send className="w-5 h-5 text-white" />
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

