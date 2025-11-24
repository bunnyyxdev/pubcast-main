"use client";

import Link from "next/link";
import { Plus, MessageSquare, Image, Video, Gift, Settings } from "lucide-react";

interface QuickAction {
  icon: any;
  label: string;
  href: string;
  color: string;
}

export function QuickActionsWidget() {
  const actions: QuickAction[] = [
    {
      icon: MessageSquare,
      label: "ส่งข้อความ",
      href: "/post?service=message",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Image,
      label: "ส่งรูป",
      href: "/post?service=image",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Video,
      label: "ส่งวิดีโอ",
      href: "/post?service=video",
      color: "from-red-500 to-orange-500",
    },
    {
      icon: Gift,
      label: "แจกของรางวัล",
      href: "/post",
      color: "from-yellow-500 to-amber-500",
    },
  ];

  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
      <h3 className="text-sm font-bold text-white mb-4">การกระทำด่วน</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, idx) => (
          <Link
            key={idx}
            href={action.href}
            className="group relative bg-gradient-to-br from-white/5 to-white/0 rounded-xl p-4 border border-white/5 hover:border-white/20 transition-all hover:scale-105"
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs font-medium text-white">{action.label}</p>
            <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity`}></div>
          </Link>
        ))}
      </div>
    </div>
  );
}

