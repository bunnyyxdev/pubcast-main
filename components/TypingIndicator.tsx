"use client";

export function TypingIndicator({ usernames }: { usernames: string[] }) {
  if (usernames.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span>
        {usernames.length === 1 
          ? `${usernames[0]} กำลังพิมพ์...`
          : `${usernames.length} คนกำลังพิมพ์...`}
      </span>
    </div>
  );
}

