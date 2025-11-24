"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Settings, LogOut, DollarSign, Tag, MessageSquare, Trash2, Loader2, 
  Users, BarChart3, FileText, Activity, Ban, CheckCircle, XCircle,
  Download, Search, Filter
} from "lucide-react";
import { useToastContext } from "@/components/ToastProvider";

interface ChatMessage {
  id: number;
  userId: string;
  username: string;
  message: string;
  createdAt: string;
}

interface User {
  id: number;
  username: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
  banned: boolean;
}

type Tab = 'settings' | 'users' | 'chat' | 'analytics' | 'revenue' | 'logs';

export default function AdminPage() {
  const router = useRouter();
  const toast = useToastContext();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('settings');

  // Settings state
  const [services, setServices] = useState<any>(null);
  const [promoText, setPromoText] = useState("");
  const [promoSubtext, setPromoSubtext] = useState("");
  const [saving, setSaving] = useState(false);

  // Chat messages state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<number | null>(null);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  // Analytics state
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Revenue state
  const [revenue, setRevenue] = useState<any>(null);
  const [loadingRevenue, setLoadingRevenue] = useState(false);

  // Logs state
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Check authentication
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/check", {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setAuthenticated(true);
          setShowLogin(false);
          loadSettings();
        } else {
          setAuthenticated(false);
          setShowLogin(true);
        }
      } else {
        setAuthenticated(false);
        setShowLogin(true);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuthenticated(false);
      setShowLogin(true);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setServices(data.settings.services || null);
          setPromoText(data.settings.promo_text || "");
          setPromoSubtext(data.settings.promo_subtext || "");
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAuthenticated(true);
        setShowLogin(false);
        loadSettings();
      } else {
        setLoginError(data.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      }
    } catch (error) {
      setLoginError("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: 'include',
      });
      setAuthenticated(false);
      setShowLogin(true);
      setServices(null);
      setPromoText("");
      setPromoSubtext("");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          services,
          promo_text: promoText,
          promo_subtext: promoSubtext,
        }),
      });

      if (response.ok) {
        toast.success("บันทึกการตั้งค่าสำเร็จ!");
      } else {
        toast.error("เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSaving(false);
    }
  };

  const updateServicePrice = (serviceId: string, variantId: string, price: number) => {
    if (!services) return;
    const updatedServices = { ...services };
    if (updatedServices[serviceId] && updatedServices[serviceId].variants) {
      const variant = updatedServices[serviceId].variants.find((v: any) => v.id === variantId);
      if (variant) {
        variant.price = price;
        const prices = updatedServices[serviceId].variants.map((v: any) => v.price);
        updatedServices[serviceId].minPrice = Math.min(...prices);
      }
    }
    setServices(updatedServices);
  };

  // Load chat messages
  const loadMessages = async () => {
    setLoadingMessages(true);
    try {
      const response = await fetch("/api/chat/messages?limit=100", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast.error("ไม่สามารถโหลดข้อความได้");
    } finally {
      setLoadingMessages(false);
    }
  };

  // Load users
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch(
        `/api/admin/users?page=${userPage}&limit=20&search=${encodeURIComponent(userSearch)}`,
        { credentials: "include" }
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setUserTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load analytics
  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const response = await fetch("/api/admin/analytics?period=7", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Failed to load analytics:", error);
      toast.error("ไม่สามารถโหลดข้อมูลสถิติได้");
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Load revenue
  const loadRevenue = async () => {
    setLoadingRevenue(true);
    try {
      const response = await fetch("/api/admin/revenue", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setRevenue(data);
      }
    } catch (error) {
      console.error("Failed to load revenue:", error);
      toast.error("ไม่สามารถโหลดข้อมูลรายได้ได้");
    } finally {
      setLoadingRevenue(false);
    }
  };

  // Load logs
  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await fetch("/api/admin/logs?limit=50", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error("Failed to load logs:", error);
      toast.error("ไม่สามารถโหลด logs ได้");
    } finally {
      setLoadingLogs(false);
    }
  };

  // Handle user action
  const handleUserAction = async (userId: number, action: 'ban' | 'unban' | 'delete') => {
    if (action === 'delete' && !confirm('คุณต้องการลบผู้ใช้นี้หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        toast.success(`ดำเนินการ${action === 'ban' ? 'แบน' : action === 'unban' ? 'ยกเลิกแบน' : 'ลบ'}สำเร็จ`);
        loadUsers();
      } else {
        toast.error("เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  // Bulk operations
  const handleBulkAction = async (action: 'ban' | 'unban' | 'delete') => {
    if (selectedUsers.length === 0) {
      toast.error("กรุณาเลือกผู้ใช้");
      return;
    }

    if (action === 'delete' && !confirm(`คุณต้องการลบผู้ใช้ ${selectedUsers.length} คนหรือไม่?`)) {
      return;
    }

    try {
      const response = await fetch("/api/admin/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          operation: action,
          target: 'users',
          ids: selectedUsers,
        }),
      });

      if (response.ok) {
        toast.success(`ดำเนินการ${action === 'ban' ? 'แบน' : action === 'unban' ? 'ยกเลิกแบน' : 'ลบ'}สำเร็จ`);
        setSelectedUsers([]);
        loadUsers();
      } else {
        toast.error("เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Failed to perform bulk action:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm('คุณต้องการลบข้อความนี้หรือไม่?')) {
      return;
    }

    setDeletingMessageId(messageId);

    try {
      const response = await fetch(`/api/admin/chat/delete?message_id=${messageId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("ลบข้อความสำเร็จ");
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      } else {
        const data = await response.json();
        toast.error(data.error || "เกิดข้อผิดพลาดในการลบข้อความ");
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
      toast.error("เกิดข้อผิดพลาดในการลบข้อความ");
    } finally {
      setDeletingMessageId(null);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (authenticated) {
      if (activeTab === 'chat') {
        loadMessages();
        const interval = setInterval(loadMessages, 5000);
        return () => clearInterval(interval);
      } else if (activeTab === 'users') {
        loadUsers();
      } else if (activeTab === 'analytics') {
        loadAnalytics();
      } else if (activeTab === 'revenue') {
        loadRevenue();
      } else if (activeTab === 'logs') {
        loadLogs();
      }
    }
  }, [authenticated, activeTab]);

  // Search users
  useEffect(() => {
    if (activeTab === 'users') {
      const timeout = setTimeout(() => {
        setUserPage(1);
        loadUsers();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [userSearch]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white font-sans flex items-center justify-center">
        <p className="text-gray-400">กำลังโหลด...</p>
      </main>
    );
  }

  if (showLogin) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white font-sans flex items-center justify-center">
        <div className="w-full max-w-md p-8">
          <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-purple-500/30">
            <h1 className="text-2xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              แผงควบคุมแอดมิน
            </h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">ชื่อผู้ใช้</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">รหัสผ่าน</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              {loginError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm text-red-300">
                  {loginError}
                </div>
              )}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-4 rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
              >
                {loginLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              แผงควบคุมแอดมิน
            </h1>
            <p className="text-gray-400 text-sm mt-1">จัดการระบบทั้งหมด</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-semibold py-2 px-4 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            ออกจากระบบ
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10 overflow-x-auto">
          {[
            { id: 'settings' as Tab, label: 'การตั้งค่า', icon: Settings },
            { id: 'users' as Tab, label: 'จัดการผู้ใช้', icon: Users },
            { id: 'chat' as Tab, label: 'จัดการแชท', icon: MessageSquare },
            { id: 'analytics' as Tab, label: 'สถิติ', icon: BarChart3 },
            { id: 'revenue' as Tab, label: 'รายได้', icon: DollarSign },
            { id: 'logs' as Tab, label: 'Logs', icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <>
              <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <Tag className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-bold">ข้อความโปรโมชั่น</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">หัวข้อโปรโมชั่น</label>
                    <input
                      type="text"
                      value={promoText}
                      onChange={(e) => setPromoText(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="ส่งรูปขึ้นจอ ฟรี!"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ข้อความย่อย</label>
                    <input
                      type="text"
                      value={promoSubtext}
                      onChange={(e) => setPromoSubtext(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="18:00 - 22:00 น. เท่านั้น"
                    />
                  </div>
                </div>
              </div>

              {services && (
                <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                    <h2 className="text-xl font-bold">จัดการราคาบริการ</h2>
                  </div>
                  <div className="space-y-6">
                    {Object.values(services).map((service: any) => (
                      <div key={service.id} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
                        <h3 className="text-lg font-semibold mb-4">{service.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {service.variants.map((variant: any) => (
                            <div key={variant.id} className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5">
                              <p className="text-sm text-gray-400 mb-2">{variant.name}</p>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={variant.price}
                                  onChange={(e) => updateServicePrice(service.id, variant.id, parseInt(e.target.value) || 0)}
                                  className="flex-1 bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  min="0"
                                />
                                <span className="text-gray-400">บาท</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Settings className="w-5 h-5" />
                {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
              </button>
            </>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  จัดการผู้ใช้
                </h2>
                {selectedUsers.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkAction('ban')}
                      className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-400 rounded-lg text-sm transition-colors"
                    >
                      แบน ({selectedUsers.length})
                    </button>
                    <button
                      onClick={() => handleBulkAction('unban')}
                      className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded-lg text-sm transition-colors"
                    >
                      ยกเลิกแบน ({selectedUsers.length})
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg text-sm transition-colors"
                    >
                      ลบ ({selectedUsers.length})
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="ค้นหาผู้ใช้..."
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {loadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>ไม่พบผู้ใช้</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user.id]);
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                              }
                            }}
                            className="w-4 h-4 rounded border-white/20"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{user.username}</span>
                              {user.banned && (
                                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">แบน</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400">{user.phoneNumber}</p>
                            <p className="text-xs text-gray-500">#{user.id} • {new Date(user.createdAt).toLocaleDateString('th-TH')}</p>
                          </div>
                          <div className="flex gap-2">
                            {user.banned ? (
                              <button
                                onClick={() => handleUserAction(user.id, 'unban')}
                                className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded-lg text-sm transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUserAction(user.id, 'ban')}
                                className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-400 rounded-lg text-sm transition-colors"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleUserAction(user.id, 'delete')}
                              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg text-sm transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {userTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <button
                        onClick={() => setUserPage(p => Math.max(1, p - 1))}
                        disabled={userPage === 1}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-50"
                      >
                        ก่อนหน้า
                      </button>
                      <span className="text-sm text-gray-400">
                        หน้า {userPage} / {userTotalPages}
                      </span>
                      <button
                        onClick={() => setUserPage(p => Math.min(userTotalPages, p + 1))}
                        disabled={userPage === userTotalPages}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-50"
                      >
                        ถัดไป
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                  จัดการแชท
                </h2>
                <button
                  onClick={loadMessages}
                  disabled={loadingMessages}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                >
                  {loadingMessages ? "กำลังโหลด..." : "รีเฟรช"}
                </button>
              </div>

              {loadingMessages && messages.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>ยังไม่มีข้อความ</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-white">
                              {msg.username}
                            </span>
                            <span className="text-xs text-gray-500">#{msg.userId}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(msg.createdAt).toLocaleString("th-TH")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">
                            {msg.message}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          disabled={deletingMessageId === msg.id}
                          className="flex-shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deletingMessageId === msg.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                สถิติระบบ
              </h2>
              {loadingAnalytics ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                </div>
              ) : analytics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5">
                    <p className="text-sm text-gray-400 mb-1">ผู้ใช้ทั้งหมด</p>
                    <p className="text-2xl font-bold">{analytics.overview?.totalUsers || 0}</p>
                  </div>
                  <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5">
                    <p className="text-sm text-gray-400 mb-1">ผู้ใช้ใหม่ (7 วัน)</p>
                    <p className="text-2xl font-bold">{analytics.overview?.newUsers || 0}</p>
                  </div>
                  <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5">
                    <p className="text-sm text-gray-400 mb-1">ข้อความทั้งหมด</p>
                    <p className="text-2xl font-bold">{analytics.overview?.totalMessages || 0}</p>
                  </div>
                  <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5">
                    <p className="text-sm text-gray-400 mb-1">ผู้ใช้ออนไลน์</p>
                    <p className="text-2xl font-bold text-green-400">{analytics.overview?.onlineUsers || 0}</p>
                  </div>
                  <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5">
                    <p className="text-sm text-gray-400 mb-1">รายได้ทั้งหมด</p>
                    <p className="text-2xl font-bold text-green-400">{analytics.overview?.totalRevenue?.toLocaleString() || 0} ฿</p>
                  </div>
                  <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5">
                    <p className="text-sm text-gray-400 mb-1">รายได้ (7 วัน)</p>
                    <p className="text-2xl font-bold text-green-400">{analytics.overview?.periodRevenue?.toLocaleString() || 0} ฿</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p>ไม่พบข้อมูล</p>
                </div>
              )}
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && (
            <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                <DollarSign className="w-5 h-5 text-purple-400" />
                รายงานรายได้
              </h2>
              {loadingRevenue ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                </div>
              ) : revenue ? (
                <div className="space-y-6">
                  <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5">
                    <p className="text-sm text-gray-400 mb-1">รายได้รวม</p>
                    <p className="text-3xl font-bold text-green-400">{revenue.summary?.totalRevenue?.toLocaleString() || 0} ฿</p>
                  </div>
                  {revenue.byService && revenue.byService.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">รายได้ตามประเภทบริการ</h3>
                      <div className="space-y-2">
                        {revenue.byService.map((item: any, idx: number) => (
                          <div key={idx} className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{item.serviceType}</span>
                              <span className="text-green-400">{item.revenue?.toLocaleString()} ฿ ({item.count} รายการ)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p>ไม่พบข้อมูล</p>
                </div>
              )}
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-purple-400" />
                System Logs
              </h2>
              {loadingLogs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>ไม่มี logs</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {logs.map((log, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              log.type === 'payment' ? 'bg-green-500/20 text-green-400' :
                              log.type === 'user_registration' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {log.type}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleString('th-TH')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{log.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
