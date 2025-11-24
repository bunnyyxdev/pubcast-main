"use client";

import { useRef, useState } from "react";
import { Camera, X, Upload } from "lucide-react";
import { useToastContext } from "@/components/ToastProvider";

interface CameraButtonProps {
  onCapture: (file: File) => void;
  disabled?: boolean;
}

export function CameraButton({ onCapture, disabled }: CameraButtonProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToastContext();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
      });
      setStream(mediaStream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("ไม่สามารถเข้าถึงกล้องได้");
      // Fallback to file input
      fileInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
    }
  };

  return (
    <>
      <button
        onClick={startCamera}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 rounded-lg transition-colors disabled:opacity-50"
      >
        <Camera className="w-4 h-4" />
        <span className="text-sm font-medium">ถ่ายรูป</span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex-1 relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="p-4 bg-black/80 flex items-center justify-center gap-4">
            <button
              onClick={stopCamera}
              className="p-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-full"
            >
              <X className="w-6 h-6 text-red-400" />
            </button>
            <button
              onClick={capturePhoto}
              className="p-4 bg-white rounded-full"
            >
              <div className="w-12 h-12 bg-white rounded-full border-4 border-gray-300"></div>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-full"
            >
              <Upload className="w-6 h-6 text-purple-400" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

