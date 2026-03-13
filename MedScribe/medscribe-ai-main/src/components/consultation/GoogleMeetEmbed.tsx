"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GoogleMeetEmbedProps {
  isRecording: boolean;
  videoStream?: MediaStream | null;
  phase?: "pre" | "recording" | "post";
}

export function GoogleMeetEmbed({ isRecording, videoStream, phase }: GoogleMeetEmbedProps) {
  const [inputUrl, setInputUrl] = useState("");
  const [meetingOpened, setMeetingOpened] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
      videoRef.current.play().catch(() => {});
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [videoStream]);

  const handleOpenMeeting = useCallback((url: string) => {
    window.open(url, "_blank");
    setMeetingOpened(true);
  }, []);

  const handleCreateMeeting = () => {
    handleOpenMeeting("https://meet.google.com/new");
  };

  const handleJoinMeeting = () => {
    const url = inputUrl.trim();
    if (!url) return;
    let normalized = url;
    if (!normalized.startsWith("http")) {
      normalized = `https://meet.google.com/${normalized}`;
    }
    if (!normalized.includes("meet.google.com") && !normalized.includes("zoom.us")) {
      return;
    }
    handleOpenMeeting(normalized);
  };

  const hasVideo = videoStream && videoStream.getVideoTracks().length > 0;

  // Pre-recording phase: show instructions to open meeting FIRST
  if (phase === "pre" || !isRecording) {
    return (
      <Card className="overflow-hidden border-blue-200 bg-blue-50/30">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.5 8.5v7l4.5 2.5V6l-4.5 2.5zM2 6.5v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-11c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2z" />
            </svg>
            <h3 className="text-sm font-semibold text-blue-900">Remote Consultation Setup</h3>
          </div>

          <div className="rounded-lg bg-white border border-blue-200 p-3 text-xs text-blue-800 leading-relaxed space-y-2">
            <p className="font-semibold text-blue-900">Step 1: Open your video call first</p>
            <p>Open Google Meet or Zoom in a separate browser tab before starting the recording.</p>
            <p className="font-semibold text-blue-900 pt-1">Step 2: Start recording</p>
            <p>When you click &quot;Start Recording&quot;, you will be asked to <strong>share the meeting tab</strong>. Select the tab with your video call and check <strong>&quot;Also share tab audio&quot;</strong>.</p>
            <p className="font-semibold text-blue-900 pt-1">Step 3: See it all</p>
            <p>The meeting video will appear inline here, and both doctor &amp; patient audio will be captured for live transcription.</p>
          </div>

          <div className="space-y-2">
            <Button onClick={handleCreateMeeting} variant="primary" size="sm" className="w-full">
              <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Open New Google Meet
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-blue-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-blue-50 px-2 text-blue-500">or paste a link</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoinMeeting()}
                placeholder="meet.google.com/abc-defg-hij"
                className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-medical-text placeholder-medical-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <Button onClick={handleJoinMeeting} disabled={!inputUrl.trim()} variant="outline" size="sm">
                Open
              </Button>
            </div>
          </div>

          {meetingOpened && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-2 text-xs text-green-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Meeting tab opened — now click &quot;Start Recording&quot; and share that tab
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Recording phase: show inline video or instructions
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {hasVideo ? (
          <div className="relative">
            {/* Inline video display of the captured meeting */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-video bg-black rounded-t-lg object-contain"
            />
            <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-[10px] font-medium text-white">LIVE — Patient video captured</span>
            </div>
            <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1">
              <span className="text-[10px] text-green-400 font-medium">Audio captured for transcription</span>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.5 8.5v7l4.5 2.5V6l-4.5 2.5zM2 6.5v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-11c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2z" />
              </svg>
              <h3 className="text-sm font-semibold text-medical-text">Video Call</h3>
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 leading-relaxed space-y-1">
              <p className="font-semibold">Tab sharing was skipped or cancelled</p>
              <p>Only your microphone is being captured. The patient&apos;s audio from the video call will <strong>not</strong> appear in the transcript.</p>
              <p className="pt-1">To capture both voices, stop the recording, then restart and select the meeting tab when prompted.</p>
            </div>

            {!meetingOpened && (
              <div className="space-y-2">
                <Button onClick={handleCreateMeeting} variant="primary" size="sm" className="w-full">
                  Open Google Meet
                </Button>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleJoinMeeting()}
                    placeholder="Paste meeting link"
                    className="flex-1 rounded-lg border border-medical-border bg-white px-3 py-2 text-sm placeholder-medical-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <Button onClick={handleJoinMeeting} disabled={!inputUrl.trim()} variant="outline" size="sm">
                    Open
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-medical-border">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${hasVideo ? "bg-green-500" : "bg-amber-400"}`} />
            <span className="text-[10px] text-medical-muted">
              {hasVideo ? "Multichannel capture active (Doctor mic + Patient tab audio)" : "Single mic capture (doctor only)"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
