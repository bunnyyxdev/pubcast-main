"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Moon, Sun, Globe, Bell, Eye, EyeOff, Trash2, User, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToastContext } from "@/components/ToastProvider";
import { ProfileSkeleton } from "@/components/LoadingSkeleton";

interface UserSettings {
  theme: 'dark' | 'light';
  language: 'th' | 'en';
  notificationsEnabled: boolean;
  privacyShowProfile: boolean;
  privacyShowActivity: boolean;
}

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const toast = useToastContext();
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
    language: 'th',
    notificationsEnabled: true,
    privacyShowProfile: true,
    privacyShowActivity: true,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    } else if (user) {
      setNewUsername(user.username);
      loadSettings();
    }
  }, [user, loading, router]);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/user/settings", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success("บันทึกการตั้งค่าสำเร็จ");
        // Apply theme
        if (settings.theme === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          document.documentElement.classList.add('dark');
        }
      } else {
        toast.error("เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSaving(false);
    }
  };

  const updateUsername = async () => {
    if (!newUsername.trim() || newUsername === user?.username) return;

    setSaving(true);
    try {
      const response = await fetch("/api/user/username", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: newUsername.trim() }),
      });

      if (response.ok) {
        toast.success("เปลี่ยนชื่อผู้ใช้สำเร็จ");
        window.location.reload();
      } else {
        const data = await response.json();
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('คุณแน่ใจหรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("ลบบัญชีสำเร็จ");
        logout();
        router.push("/");
      } else {
        const data = await response.json();
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden flex justify-center">
        <div className="w-full max-w-[480px] min-h-screen bg-[#0f0f12] shadow-2xl relative flex flex-col border-x border-white/5">
          <ProfileSkeleton />
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
          <h1 className="ml-2 text-lg font-bold">การตั้งค่า</h1>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Username */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              ชื่อผู้ใช้
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={updateUsername}
                disabled={saving || newUsername.trim() === user.username}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl disabled:opacity-50 transition-colors"
              >
                บันทึก
              </button>
            </div>
          </div>

          {/* Theme */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              {settings.theme === 'dark' ? (
                <Moon className="w-5 h-5 text-purple-400" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
              โหมดการแสดงผล
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSettings({ ...settings, theme: 'dark' })}
                className={`flex-1 py-3 rounded-xl transition-colors ${
                  settings.theme === 'dark'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Moon className="w-5 h-5 mx-auto mb-1" />
                ดาร์ก
              </button>
              <button
                onClick={() => setSettings({ ...settings, theme: 'light' })}
                className={`flex-1 py-3 rounded-xl transition-colors ${
                  settings.theme === 'light'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Sun className="w-5 h-5 mx-auto mb-1" />
                ไลท์
              </button>
            </div>
          </div>

          {/* Language */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              ภาษา
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSettings({ ...settings, language: 'th' })}
                className={`flex-1 py-3 rounded-xl transition-colors ${
                  settings.language === 'th'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                ไทย
              </button>
              <button
                onClick={() => setSettings({ ...settings, language: 'en' })}
                className={`flex-1 py-3 rounded-xl transition-colors ${
                  settings.language === 'en'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-400" />
              การแจ้งเตือน
            </h3>
            <label className="flex items-center justify-between cursor-pointer">
              <span>เปิดการแจ้งเตือน</span>
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) => setSettings({ ...settings, notificationsEnabled: e.target.checked })}
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500"
              />
            </label>
          </div>

          {/* Privacy */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold mb-4">ความเป็นส่วนตัว</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span>แสดงโปรไฟล์สาธารณะ</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.privacyShowProfile}
                  onChange={(e) => setSettings({ ...settings, privacyShowProfile: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-gray-400" />
                  <span>แสดงกิจกรรม</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.privacyShowActivity}
                  onChange={(e) => setSettings({ ...settings, privacyShowActivity: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500"
                />
              </label>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              "บันทึกการตั้งค่า"
            )}
          </button>

          {/* Delete Account */}
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                กำลังลบ...
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                ลบบัญชี
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}

