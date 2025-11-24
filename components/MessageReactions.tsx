"use client";

import { useState } from "react";
import { Heart, ThumbsUp, Laugh, Flame } from "lucide-react";

const REACTIONS = [
  { emoji: "❤️", icon: Heart, label: "Love" },
  { emoji: "👍", icon: ThumbsUp, label: "Like" },
  { emoji: "😂", icon: Laugh, label: "Laugh" },
  { emoji: "🔥", icon: Flame, label: "Fire" },
];

interface MessageReactionsProps {
  messageId: number;
  reactions?: { [key: string]: number };
  onReact: (messageId: number, reaction: string) => void;
}

export function MessageReactions({ messageId, reactions = {}, onReact }: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleReaction = (reaction: string) => {
    onReact(messageId, reaction);
    setShowPicker(false);
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      {/* Quick Reactions */}
      <div className="flex items-center gap-1">
        {REACTIONS.map((reaction) => {
          const count = reactions[reaction.emoji] || 0;
          if (count === 0) return null;
          return (
            <button
              key={reaction.emoji}
              onClick={() => handleReaction(reaction.emoji)}
              className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors"
            >
              <span>{reaction.emoji}</span>
              <span className="text-gray-400">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Add Reaction Button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <span className="text-lg">😀</span>
        </button>

        {showPicker && (
          <div className="absolute bottom-full left-0 mb-2 bg-[#1a1a2e] border border-white/10 rounded-xl p-2 flex gap-2 shadow-2xl z-10">
            {REACTIONS.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => handleReaction(reaction.emoji)}
                className="text-2xl hover:scale-125 transition-transform"
                title={reaction.label}
              >
                {reaction.emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

