"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, Heart, MessageCircle, Share2, MoreVertical, 
  UserPlus, UserMinus, Loader2, Send, Camera, Image as ImageIcon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToastContext } from "@/components/ToastProvider";
import { ShareButton } from "@/components/ShareButton";
import { formatTextWithLinks, type TextPart } from "@/utils/textParser";

interface Post {
  id: number;
  userId: number;
  username: string;
  profilePhoto?: string;
  content?: string;
  imageUrl?: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}

interface Comment {
  id: number;
  userId: number;
  username: string;
  profilePhoto?: string;
  content: string;
  createdAt: string;
}

export default function DatingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToastContext();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadPosts();
    } else {
      router.push("/");
    }
  }, [user]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/social/posts", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
      toast.error("ไม่สามารถโหลดโพสต์ได้");
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (postId: number) => {
    try {
      const response = await fetch(`/api/social/comments?post_id=${postId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const response = await fetch("/api/social/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(prev =>
          prev.map(post =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: data.liked,
                  likesCount: data.liked ? post.likesCount + 1 : post.likesCount - 1,
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Failed to like:", error);
    }
  };

  const handleFollow = async (userId: number, username: string) => {
    const isFollowing = followingUsers.has(userId);
    const action = isFollowing ? 'unfollow' : 'follow';

    try {
      const response = await fetch("/api/social/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ followingId: userId, action }),
      });

      if (response.ok) {
        if (isFollowing) {
          setFollowingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
          toast.success(`เลิกติดตาม ${username} แล้ว`);
        } else {
          setFollowingUsers(prev => new Set(prev).add(userId));
          toast.success(`ติดตาม ${username} แล้ว`);
        }
      }
    } catch (error) {
      console.error("Failed to follow:", error);
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleAddComment = async () => {
    if (!selectedPost || !newComment.trim() || sendingComment) return;

    setSendingComment(true);
    try {
      const response = await fetch("/api/social/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ postId: selectedPost.id, content: newComment }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => [...prev, data.comment]);
        setNewComment("");
        setPosts(prev =>
          prev.map(post =>
            post.id === selectedPost.id
              ? { ...post, commentsCount: post.commentsCount + 1 }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("เกิดข้อผิดพลาดในการเพิ่มความคิดเห็น");
    } finally {
      setSendingComment(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "เมื่อสักครู่";
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} ชั่วโมงที่แล้ว`;
    return date.toLocaleDateString("th-TH");
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

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen bg-[#0f0f12] shadow-2xl relative flex flex-col border-x border-white/5">
        
        {/* Header */}
        <div className="p-4 flex items-center border-b border-white/10 bg-[#0f0f12]/80 backdrop-blur-md sticky top-0 z-10">
          <Link href="/" className="p-2 -ml-2 text-white/80 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="ml-2 text-lg font-bold">หาเพื่อน (Dating)</h1>
        </div>

        {/* Posts Feed */}
        <div className="flex-1 overflow-y-auto pb-20">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center">
              <UserPlus className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-sm">ยังไม่มีโพสต์</p>
              <p className="text-xs mt-1">เริ่มติดตามผู้ใช้เพื่อดูโพสต์</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-[#1a1a2e] rounded-2xl overflow-hidden border border-white/10"
                >
                  {/* Post Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Link href={`/user/${post.userId}`}>
                        {post.profilePhoto ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                            <Image
                              src={post.profilePhoto}
                              alt={post.username}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center border-2 border-white/20">
                            <span className="text-white font-bold">{post.username[0]}</span>
                          </div>
                        )}
                      </Link>
                      <div>
                        <Link href={`/user/${post.userId}`} className="font-semibold hover:underline">
                          {post.username}
                        </Link>
                        <p className="text-xs text-gray-400">{formatTime(post.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.userId.toString() !== user?.id && (
                        <button
                          onClick={() => handleFollow(post.userId, post.username)}
                          className={`p-2 rounded-lg transition-colors ${
                            followingUsers.has(post.userId)
                              ? 'bg-purple-600/20 text-purple-400'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {followingUsers.has(post.userId) ? (
                            <UserMinus className="w-4 h-4" />
                          ) : (
                            <UserPlus className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <button className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Post Image */}
                  {post.imageUrl && (
                    <div className="w-full aspect-square relative bg-black">
                      <Image
                        src={post.imageUrl}
                        alt="Post"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`transition-colors ${
                          post.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-6 h-6 ${post.isLiked ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setShowComments(true);
                          loadComments(post.id);
                        }}
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <MessageCircle className="w-6 h-6" />
                      </button>
                      <ShareButton url={`${window.location.origin}/post/${post.id}`} />
                    </div>

                    {/* Likes Count */}
                    {post.likesCount > 0 && (
                      <p className="text-sm font-semibold">{post.likesCount} ถูกใจ</p>
                    )}

                    {/* Post Content */}
                    {post.content && (
                      <div className="text-sm">
                        <Link href={`/user/${post.userId}`} className="font-semibold mr-2">
                          {post.username}
                        </Link>
                        <span>
                          {formatTextWithLinks(post.content).map((part: TextPart, idx: number) => {
                            if (part.type === 'mention') {
                              return (
                                <span key={idx} className="text-purple-400 font-semibold">
                                  {part.content}
                                </span>
                              );
                            } else if (part.type === 'hashtag') {
                              return (
                                <span key={idx} className="text-blue-400 font-semibold">
                                  {part.content}
                                </span>
                              );
                            }
                            return <span key={idx}>{part.content}</span>;
                          })}
                        </span>
                      </div>
                    )}

                    {/* Comments Count */}
                    {post.commentsCount > 0 && (
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setShowComments(true);
                          loadComments(post.id);
                        }}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        ดูความคิดเห็น {post.commentsCount} รายการ
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comments Modal */}
        {showComments && selectedPost && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-md mx-auto bg-[#1a1a2e] rounded-2xl border border-white/10">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="font-bold">ความคิดเห็น</h3>
                  <button
                    onClick={() => {
                      setShowComments(false);
                      setSelectedPost(null);
                      setComments([]);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      {comment.profilePhoto ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                          <Image
                            src={comment.profilePhoto}
                            alt={comment.username}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{comment.username[0]}</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold mr-2">{comment.username}</span>
                          {comment.content}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{formatTime(comment.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-white/10 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="เพิ่มความคิดเห็น..."
                    className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || sendingComment}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl disabled:opacity-50 transition-colors"
                  >
                    {sendingComment ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
