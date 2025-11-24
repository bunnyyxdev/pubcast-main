"use client";

import { Share2 } from "lucide-react";
import { useToastContext } from "@/components/ToastProvider";

interface ShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
}

export function ShareButton({ title = "PubCast", text = "ส่งข้อความขึ้นจอ", url }: ShareButtonProps) {
  const toast = useToastContext();

  const handleShare = async () => {
    const shareUrl = url || window.location.href;
    const shareData = {
      title,
      text,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("แชร์สำเร็จ!");
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast.success("คัดลอกลิงก์แล้ว!");
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast.success("คัดลอกลิงก์แล้ว!");
        } catch (clipboardError) {
          toast.error("ไม่สามารถแชร์ได้");
        }
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 rounded-lg transition-colors"
    >
      <Share2 className="w-4 h-4" />
      <span className="text-sm font-medium">แชร์</span>
    </button>
  );
}

