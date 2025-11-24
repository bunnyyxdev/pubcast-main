"use client";

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen bg-[#0f0f12] shadow-2xl relative flex flex-col border-x border-white/5">
        <div className="p-6 space-y-6 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 bg-white/10 rounded-lg"></div>
            <div className="h-8 w-24 bg-white/10 rounded-lg"></div>
          </div>

          {/* Logo Skeleton */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 bg-white/10 rounded-full"></div>
            <div className="h-6 w-40 bg-white/10 rounded-lg"></div>
            <div className="h-4 w-32 bg-white/10 rounded-lg"></div>
          </div>

          {/* Promo Banner Skeleton */}
          <div className="h-24 w-full bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl"></div>

          {/* Services Grid Skeleton */}
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-white/5 rounded-2xl border border-white/5"
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-20 bg-white/10 rounded"></div>
            <div className="h-12 w-3/4 bg-white/10 rounded-2xl"></div>
            <div className="h-3 w-16 bg-white/10 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex-1 p-6 space-y-6 animate-pulse">
      {/* Profile Header Skeleton */}
      <div className="flex flex-col items-center space-y-4">
        <div className="w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="h-6 w-32 bg-white/10 rounded-lg"></div>
        <div className="h-4 w-24 bg-white/10 rounded-lg"></div>
      </div>

      {/* Details Card Skeleton */}
      <div className="bg-white/5 rounded-2xl p-6 space-y-4 border border-white/10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 pb-4 border-b border-white/10">
            <div className="w-10 h-10 bg-white/10 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 bg-white/10 rounded"></div>
              <div className="h-4 w-32 bg-white/10 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="h-32 bg-white/5 rounded-2xl border border-white/5 animate-pulse">
      <div className="h-full flex flex-col items-center justify-center space-y-2">
        <div className="w-14 h-14 bg-white/10 rounded-full"></div>
        <div className="h-4 w-20 bg-white/10 rounded"></div>
      </div>
    </div>
  );
}

