"use client";

import { useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface GoogleMeetEmbedProps {
  videoStream: MediaStream;
  isMultichannel: boolean;
}

export function GoogleMeetEmbed({ videoStream, isMultichannel }: GoogleMeetEmbedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (el && videoStream) {
      el.srcObject = videoStream;
      el.play().catch(() => {});
    }
    return () => {
      if (el) el.srcObject = null;
    };
  }, [videoStream]);

  return (
    <Card className="overflow-hidden border-green-200">
      <CardContent className="p-0">
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full aspect-video bg-black object-contain"
          />
          <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-[10px] font-medium text-white">LIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border-t border-green-200">
          <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
          <span className="text-[10px] text-green-700">
            {isMultichannel
              ? "Stereo — Doctor (mic) + Patient (tab audio)"
              : "Video captured — audio via microphone"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
