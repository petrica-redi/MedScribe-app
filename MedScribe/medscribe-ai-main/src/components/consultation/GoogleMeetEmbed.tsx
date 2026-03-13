"use client";

import { useRef, useEffect } from "react";

interface VideoCallPanelProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMultichannel: boolean;
  duration: string;
  streamingActive: boolean;
}

export function GoogleMeetEmbed({
  localStream,
  remoteStream,
  isMultichannel,
  duration,
  streamingActive,
}: VideoCallPanelProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = localVideoRef.current;
    if (el && localStream) {
      el.srcObject = localStream;
      el.play().catch(() => {});
    }
    return () => {
      if (el) el.srcObject = null;
    };
  }, [localStream]);

  useEffect(() => {
    const el = remoteVideoRef.current;
    if (el && remoteStream) {
      el.srcObject = remoteStream;
      el.play().catch(() => {});
    }
    return () => {
      if (el) el.srcObject = null;
    };
  }, [remoteStream]);

  const hasRemote = remoteStream && remoteStream.getVideoTracks().length > 0;
  const hasLocal = localStream && localStream.getVideoTracks().length > 0;

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-gray-900 shadow-lg">
      {/* Main video area */}
      <div className="relative aspect-video">
        {hasRemote ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-contain bg-gray-900"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center">
              <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <p className="text-sm text-gray-400">Patient video</p>
            <p className="text-xs text-gray-500">Share your meeting tab to see the patient here</p>
          </div>
        )}

        {/* Doctor's webcam — picture-in-picture overlay */}
        {hasLocal && (
          <div className="absolute bottom-3 right-3 w-36 aspect-video rounded-lg overflow-hidden shadow-xl border-2 border-white/20 bg-gray-800">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
              style={{ transform: "scaleX(-1)" }}
            />
            <div className="absolute bottom-1 left-1.5">
              <span className="text-[9px] font-medium text-white/80 bg-black/50 px-1.5 py-0.5 rounded">You</span>
            </div>
          </div>
        )}

        {/* Top-left: Recording indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-xs font-semibold text-white tracking-wide">REC</span>
            <span className="text-xs font-mono text-white/80">{duration}</span>
          </div>
        </div>

        {/* Top-right: Capture status */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          {streamingActive && (
            <div className="flex items-center gap-1.5 rounded-full bg-green-500/80 backdrop-blur-sm px-2.5 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] font-medium text-white">Live transcription</span>
            </div>
          )}
          {isMultichannel && (
            <div className="flex items-center gap-1.5 rounded-full bg-purple-500/80 backdrop-blur-sm px-2.5 py-1">
              <span className="text-[10px] font-medium text-white">Stereo capture</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
