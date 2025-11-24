"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, User, Phone, Calendar, LogOut, Camera, X, Loader2, Settings, BarChart3, DollarSign, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToastContext } from "@/components/ToastProvider";
import { ProfileSkeleton } from "@/components/LoadingSkeleton";

export default function ProfilePage() {
  const { user, loading, logout, refreshUser } = useAuth();
  const toast = useToastContext();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(user?.profilePhoto || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.profilePhoto) {
      const photo = user.profilePhoto;
      // Simple validation: check if it's a valid data URL or HTTP URL
      if (photo && typeof photo === 'string' && photo.trim().length > 0) {
        // Check for truncated images (TEXT column limit)
        if (photo.length === 65535) {
          setProfilePhoto(null);
          setError('รูปภาพถูกตัดทอน กรุณาอัพโหลดใหม่ (ภาพอาจใหญ่เกินไป)');
          return;
        }
        // Set photo if it looks valid (data URL or HTTP URL)
        if (photo.startsWith('data:image/') || photo.startsWith('http://') || photo.startsWith('https://')) {
          setProfilePhoto(photo);
        } else {
          setProfilePhoto(null);
        }
      } else {
        setProfilePhoto(null);
      }
    } else {
      setProfilePhoto(null);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const errorMsg = 'กรุณาเลือกรูปภาพเท่านั้น';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      const errorMsg = 'ขนาดรูปภาพต้องไม่เกิน 2MB';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Validate the base64 string before uploading
        if (!base64String || typeof base64String !== 'string') {
          setError('เกิดข้อผิดพลาดในการอ่านไฟล์');
          setUploading(false);
          return;
        }
        
        // Ensure it's a valid data URL
        if (!base64String.startsWith('data:image/')) {
          setError('รูปแบบไฟล์ไม่ถูกต้อง');
          setUploading(false);
          return;
        }
        
        // Basic validation: check if base64 data exists
        const parts = base64String.split(',');
        if (parts.length !== 2 || !parts[1] || parts[1].length < 100) {
          setError('ข้อมูลรูปภาพไม่สมบูรณ์');
          setUploading(false);
          return;
        }
        
        try {
          const response = await fetch('/api/profile/photo', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              profilePhoto: base64String,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ');
          }

          // Update local state
          setProfilePhoto(base64String);
          // Refresh user data
          await refreshUser();
          toast.success('อัพโหลดรูปโปรไฟล์สำเร็จ');
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ';
          setError(errorMsg);
          toast.error(errorMsg);
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        setError('เกิดข้อผิดพลาดในการอ่านไฟล์');
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ');
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setUploading(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/photo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profilePhoto: null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการลบรูปภาพ');
      }

      setProfilePhoto(null);
      await refreshUser();
      toast.success('ลบรูปโปรไฟล์สำเร็จ');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบรูปภาพ';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden flex justify-center">
        <div className="w-full max-w-[480px] min-h-screen bg-[#0f0f12] shadow-2xl relative flex flex-col border-x border-white/5">
          <div className="p-4 flex items-center border-b border-white/10">
            <h1 className="ml-2 text-lg font-bold">โปรไฟล์</h1>
          </div>
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
          <Link href="/" className="p-2 -ml-2 text-white/80 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="ml-2 text-lg font-bold">โปรไฟล์</h1>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div 
                className={`w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden ${
                  profilePhoto ? 'bg-transparent' : 'bg-gradient-to-br from-purple-600 to-pink-600'
                } flex items-center justify-center cursor-pointer group relative`}
                onClick={handleImageClick}
              >
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => {
                      console.error('Image load error: Failed to load profile photo', {
                        srcLength: profilePhoto?.length,
                        srcPrefix: profilePhoto?.substring(0, 50),
                      });
                      // Clear the invalid photo from local state only
                      // Don't automatically remove from server to avoid loops
                      setProfilePhoto(null);
                    }}
                    onLoad={() => {
                      // Image loaded successfully
                      setError(null);
                    }}
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
              {profilePhoto && !uploading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePhoto();
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-1">{user.username}</h2>
              <p className="text-sm text-gray-400 mb-2">สมาชิก</p>
              <button
                onClick={handleImageClick}
                disabled={uploading}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
              >
                {profilePhoto ? 'เปลี่ยนรูปโปรไฟล์' : 'เพิ่มรูปโปรไฟล์'}
              </button>
            </div>
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm text-red-300">
                {error}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* User Details Card */}
          <div className="bg-white/5 rounded-2xl p-6 space-y-4 border border-white/10">
            <h3 className="text-lg font-bold mb-4">ข้อมูลส่วนตัว</h3>
            
            {/* Username */}
            <div className="flex items-center gap-4 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">ชื่อบัญชี</p>
                <p className="text-white font-semibold">{user.username}</p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex items-center gap-4 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Phone className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">เบอร์โทรศัพท์</p>
                <p className="text-white font-semibold">{user.phoneNumber}</p>
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">รหัสผู้ใช้</p>
                <p className="text-white font-semibold text-sm">#{user.id}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/dashboard"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              สถิติ
            </Link>
            <Link
              href="/payment-history"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <DollarSign className="w-5 h-5" />
              ประวัติ
            </Link>
            <Link
              href="/queue"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Clock className="w-5 h-5" />
              คิว
            </Link>
            <Link
              href="/settings"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Settings className="w-5 h-5" />
              ตั้งค่า
            </Link>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            ออกจากระบบ
          </button>
        </div>
      </div>
    </main>
  );
}
