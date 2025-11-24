"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, Heart, MessageCircle, Share2, MoreVertical, 
  UserPlus, UserMinus, Loader2, Send, Camera, Image as ImageIcon,
  Search, Filter, TrendingUp, Star, Hash, X
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
  category?: string;
  tags?: string[];
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
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['ทั้งหมด', 'รูปภาพ', 'ข้อความ', 'วิดีโอ'];
  const popularTags = ['#trending', '#popular', '#new', '#featured'];

  useEffect(() => {
    if (user) {
      loadPosts();
    } else {
      router.push("/");
    }
  }, [user]);

  useEffect(() => {
    filterPosts();
  }, [searchQuery, selectedCategory, selectedTag, allPosts]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/social/posts", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setAllPosts(data.posts || []);
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
      toast.error("ไม่สามารถโหลดโพสต์ได้");
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = [...allPosts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.content?.toLowerCase().includes(query) ||
        post.username.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'ทั้งหมด') {
      if (selectedCategory === 'รูปภาพ') {
        filtered = filtered.filter(post => post.imageUrl);
      } else if (selectedCategory === 'ข้อความ') {
        filtered = filtered.filter(post => post.content && !post.imageUrl);
      }
    }

    // Tag filter
    if (selectedTag) {
      filtered = filtered.filter(post => 
        post.tags?.includes(selectedTag.replace('#', '')) ||
        post.content?.includes(selectedTag)
      );
    }

    setPosts(filtered);
  };

  const getTrendingPosts = () => {
    return [...allPosts]
      .sort((a, b) => (b.likesCount + b.commentsCount) - (a.likesCount + a.commentsCount))
      .slice(0, 5);
  };

  const getFeaturedPosts = () => {
    return allPosts.filter(post => post.likesCount > 10).slice(0, 5);
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
        setAllPosts(prev =>
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
        setAllPosts(prev =>
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

  const trendingPosts = getTrendingPosts();
  const featuredPosts = getFeaturedPosts();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen bg-[#0f0f12] shadow-2xl relative flex flex-col border-x border-white/5">
        
        {/* Header */}
        <div className="p-4 flex items-center border-b border-white/10 bg-[#0f0f12]/80 backdrop-blur-md sticky top-0 z-10">
          <Link href="/" className="p-2 -ml-2 text-white/80 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="ml-2 text-lg font-bold flex-1">หาเพื่อน (Dating)</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 space-y-3 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาโพสต์..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {showFilters && (
            <div className="space-y-3">
              {/* Categories */}
              <div>
                <p className="text-xs text-gray-400 mb-2">หมวดหมู่</p>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Tags */}
              <div>
                <p className="text-xs text-gray-400 mb-2">แท็กยอดนิยม</p>
                <div className="flex gap-2 flex-wrap">
                  {popularTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                        selectedTag === tag
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <Hash className="w-3 h-3" />
                      {tag.replace('#', '')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Trending Section */}
        {trendingPosts.length > 0 && (
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <h2 className="font-bold">กำลังฮิต</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {trendingPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`#post-${post.id}`}
                  className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-colors"
                >
                  {post.imageUrl ? (
                    <Image
                      src={post.imageUrl}
                      alt="Trending"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Featured Section */}
        {featuredPosts.length > 0 && (
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-yellow-400" />
              <h2 className="font-bold">แนะนำ</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {featuredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`#post-${post.id}`}
                  className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 border-yellow-500/30 hover:border-yellow-500/50 transition-colors"
                >
                  {post.imageUrl ? (
                    <Image
                      src={post.imageUrl}
                      alt="Featured"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Posts Feed */}
        <div className="flex-1 overflow-y-auto pb-20">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center">
              <UserPlus className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-sm">ไม่พบโพสต์</p>
              <p className="text-xs mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  id={`post-${post.id}`}
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
                      <ShareButton url={`${typeof window !== 'undefined' ? window.location.origin : ''}/post/${post.id}`} />
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
                                <Link
                                  key={idx}
                                  href={`/user/${part.content.replace('@', '')}`}
                                  className="text-purple-400 font-semibold hover:underline"
                                >
                                  {part.content}
                                </Link>
                              );
                            } else if (part.type === 'hashtag') {
                              return (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedTag(part.content)}
                                  className="text-blue-400 font-semibold hover:underline"
                                >
                                  {part.content}
                                </button>
                              );
                            } else if (part.type === 'link') {
                              return (
                                <a
                                  key={idx}
                                  href={part.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:underline"
                                >
                                  {part.content}
                                </a>
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
