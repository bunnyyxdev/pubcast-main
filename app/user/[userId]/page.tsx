"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, UserPlus, UserMinus, Grid, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToastContext } from "@/components/ToastProvider";

interface ProfileData {
  user: {
    id: number;
    username: string;
    profilePhoto?: string;
    createdAt: string;
  };
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
  isFollowing: boolean;
  isOwnProfile: boolean;
}

export default function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    params.then((p) => setUserId(p.userId));
  }, [params]);
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const toast = useToastContext();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadUserPosts();
    }
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/social/profile/${userId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFollowing(data.isFollowing);
      } else {
        toast.error("ไม่พบผู้ใช้");
        router.push("/dating");
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async () => {
    try {
      const response = await fetch(`/api/social/posts?user_id=${userId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;

    const action = following ? 'unfollow' : 'follow';
    try {
      const response = await fetch("/api/social/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ followingId: profile.user.id, action }),
      });

      if (response.ok) {
        setFollowing(!following);
        setProfile(prev => prev ? {
          ...prev,
          stats: {
            ...prev.stats,
            followers: following ? prev.stats.followers - 1 : prev.stats.followers + 1,
          },
        } : null);
        toast.success(following ? "เลิกติดตามแล้ว" : "ติดตามแล้ว");
      }
    } catch (error) {
      console.error("Failed to follow:", error);
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden flex justify-center">
        <div className="w-full max-w-[480px] min-h-screen bg-[#0f0f12] shadow-2xl relative flex flex-col border-x border-white/5 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen bg-[#0f0f12] shadow-2xl relative flex flex-col border-x border-white/5">
        
        {/* Header */}
        <div className="p-4 flex items-center border-b border-white/10 bg-[#0f0f12]/80 backdrop-blur-md sticky top-0 z-10">
          <Link href="/dating" className="p-2 -ml-2 text-white/80 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="ml-2 text-lg font-bold">{profile.user.username}</h1>
        </div>

        {/* Profile Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile Header */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-6">
              {/* Profile Photo */}
              {profile.user.profilePhoto ? (
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20">
                  <Image
                    src={profile.user.profilePhoto}
                    alt={profile.user.username}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center border-4 border-white/20">
                  <span className="text-4xl font-bold text-white">{profile.user.username[0]}</span>
                </div>
              )}

              {/* Stats */}
              <div className="flex-1 flex justify-around">
                <div className="text-center">
                  <p className="text-2xl font-bold">{profile.stats.posts}</p>
                  <p className="text-xs text-gray-400">โพสต์</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{profile.stats.followers}</p>
                  <p className="text-xs text-gray-400">ผู้ติดตาม</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{profile.stats.following}</p>
                  <p className="text-xs text-gray-400">กำลังติดตาม</p>
                </div>
              </div>
            </div>

            {/* Username */}
            <div>
              <h2 className="text-xl font-bold">{profile.user.username}</h2>
            </div>

            {/* Follow Button */}
            {!profile.isOwnProfile && (
              <button
                onClick={handleFollow}
                className={`w-full py-2 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                  following
                    ? 'bg-white/10 hover:bg-white/20 border border-white/20'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {following ? (
                  <>
                    <UserMinus className="w-4 h-4" />
                    เลิกติดตาม
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    ติดตาม
                  </>
                )}
              </button>
            )}

            {profile.isOwnProfile && (
              <Link
                href="/profile"
                className="w-full py-2 px-4 rounded-xl font-semibold bg-white/10 hover:bg-white/20 border border-white/20 transition-colors flex items-center justify-center"
              >
                แก้ไขโปรไฟล์
              </Link>
            )}
          </div>

          {/* Posts Grid */}
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-center gap-8 mb-4">
              <button className="flex items-center gap-2 text-sm font-semibold border-b-2 border-white pb-2">
                <Grid className="w-4 h-4" />
                โพสต์
              </button>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>ยังไม่มีโพสต์</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    className="aspect-square relative bg-black"
                  >
                    {post.imageUrl ? (
                      <Image
                        src={post.imageUrl}
                        alt="Post"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <span className="text-xs">{post.content?.substring(0, 20)}...</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

