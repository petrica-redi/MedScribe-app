"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface GoogleMeetEmbedProps {
  consultationId: string;
  /** When true, shows compact draggable overlay instead of the inline launcher. */
  floating?: boolean;
  isRecording?: boolean;
  duration?: string;
  streamingActive?: boolean;
  isMultichannel?: boolean;
  /** The captured tab video stream (Google Meet tab shared via getDisplayMedia). */
  remoteStream?: MediaStream | null;
}

const POPUP_W = 700;
const POPUP_H = 500;

export function GoogleMeetEmbed({
  consultationId,
  floating = false,
  isRecording = false,
  duration,
  streamingActive,
  isMultichannel,
  remoteStream,
}: GoogleMeetEmbedProps) {
  const [meetUrl, setMeetUrl] = useState("");
  const [popupAlive, setPopupAlive] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // ---------- Draggable state (floating mode only) ----------
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragOrigin = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const [dragging, setDragging] = useState(false);

  // Attach remote stream to video element
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

  const hasRemoteVideo = remoteStream && remoteStream.getVideoTracks().length > 0;

  // Poll popup status
  useEffect(() => {
    if (!popupAlive) return;
    const id = setInterval(() => {
      if (!popupRef.current || popupRef.current.closed) {
        setPopupAlive(false);
        popupRef.current = null;
      }
    }, 800);
    return () => clearInterval(id);
  }, [popupAlive]);

  const openPopup = useCallback(
    (url: string) => {
      const left = Math.max(0, window.screenX + window.outerWidth - POPUP_W - 30);
      const top = window.screenY + 60;
      const win = window.open(
        url,
        `MedScribe-Meet-${consultationId.substring(0, 8)}`,
        `width=${POPUP_W},height=${POPUP_H},left=${left},top=${top},resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=yes,status=no`
      );
      if (win) {
        popupRef.current = win;
        setPopupAlive(true);
        setMeetUrl(url);
      }
    },
    [consultationId]
  );

  const handleNewMeeting = useCallback(() => {
    openPopup("https://meet.google.com/new");
  }, [openPopup]);

  const handleJoinMeeting = useCallback(() => {
    const link = prompt("Paste Google Meet link:");
    if (!link?.trim()) return;
    const url = link.trim().startsWith("http") ? link.trim() : `https://${link.trim()}`;
    openPopup(url);
  }, [openPopup]);

  const focusPopup = useCallback(() => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus();
    } else if (meetUrl) {
      openPopup(meetUrl);
    }
  }, [meetUrl, openPopup]);

  // ---------- Drag handlers ----------
  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragOrigin.current = { mx: e.clientX, my: e.clientY, px: rect.left, py: rect.top };
    setDragging(true);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const { mx, my, px, py } = dragOrigin.current;
      setPos({ x: px + (e.clientX - mx), y: py + (e.clientY - my) });
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  // =====================================================================
  // FLOATING MODE — during recording: shows live Google Meet tab capture
  // or compact bar if no tab video
  // =====================================================================
  if (floating) {
    // If we have the captured tab video, show it as a resizable floating panel
    if (hasRemoteVideo) {
      const style: React.CSSProperties = pos
        ? { position: "fixed", left: pos.x, top: pos.y, zIndex: 50 }
        : { position: "fixed", top: 12, right: 12, zIndex: 50 };

      return (
        <div ref={panelRef} style={style} className="select-none">
          <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-700 bg-gray-900">
            {/* Drag handle bar */}
            <div
              onMouseDown={onDragStart}
              className="flex items-center justify-between px-3 py-1.5 bg-gray-800 cursor-grab active:cursor-grabbing"
            >
              <div className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
                  <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                  <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
                </svg>
                <span className="text-[10px] font-medium text-gray-400">Google Meet — Patient view</span>
              </div>
              <div className="flex items-center gap-1.5">
                {isRecording && (
                  <div className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[9px] font-semibold text-red-400">REC {duration}</span>
                  </div>
                )}
                {isMultichannel && (
                  <div className="rounded-full bg-purple-500/20 px-2 py-0.5">
                    <span className="text-[9px] font-medium text-purple-400">Stereo</span>
                  </div>
                )}
                {streamingActive && (
                  <div className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5">
                    <span className="h-1 w-1 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[9px] font-medium text-green-400">Live</span>
                  </div>
                )}
              </div>
            </div>

            {/* Video feed */}
            <div className="relative" style={{ width: 420, maxWidth: "90vw" }}>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-video object-contain bg-black"
              />
              <button
                type="button"
                onClick={focusPopup}
                className="absolute bottom-2 right-2 rounded-md bg-black/50 hover:bg-black/70 text-white text-[10px] font-medium px-2 py-1 transition-colors backdrop-blur-sm"
              >
                Focus Meet
              </button>
            </div>
          </div>
        </div>
      );
    }

    // No tab video captured — compact status bar
    const style: React.CSSProperties = pos
      ? { position: "fixed", left: pos.x, top: pos.y, zIndex: 50 }
      : { position: "fixed", top: 12, right: 12, zIndex: 50 };

    return (
      <div ref={panelRef} style={style} className="select-none">
        <div
          className={`flex items-center gap-2 rounded-xl shadow-2xl border px-3 py-2 ${
            popupAlive
              ? "bg-gray-900/95 border-gray-700 text-white backdrop-blur-md"
              : "bg-white border-gray-200 text-gray-700"
          }`}
        >
          <div onMouseDown={onDragStart} className="cursor-grab active:cursor-grabbing p-0.5 -ml-1" title="Drag to reposition">
            <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
              <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
              <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
            </svg>
          </div>

          <svg className="h-4 w-4 shrink-0 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.5 8.5v7l4.5 2.5V6l-4.5 2.5zM2 6.5v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-11c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2z" />
          </svg>

          {popupAlive ? (
            <span className="text-xs font-medium text-green-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Google Meet active
            </span>
          ) : (
            <span className="text-xs text-gray-400">Meet not connected</span>
          )}

          {isRecording && (
            <div className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 ml-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-red-400">REC {duration}</span>
            </div>
          )}

          {streamingActive && (
            <div className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5">
              <span className="text-[10px] font-medium text-green-400">Transcribing</span>
            </div>
          )}

          <button
            type="button"
            onClick={popupAlive ? focusPopup : handleNewMeeting}
            className={`ml-1 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
              popupAlive
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {popupAlive ? "Focus" : "Open Meet"}
          </button>
        </div>
      </div>
    );
  }

  // =====================================================================
  // INLINE MODE — pre-recording setup
  // =====================================================================
  return (
    <div className="w-full rounded-xl border border-blue-200 bg-gradient-to-b from-blue-50/60 to-white overflow-hidden shadow-sm">
      <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center gap-5 px-6">
        {popupAlive ? (
          <>
            <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.5 8.5v7l4.5 2.5V6l-4.5 2.5zM2 6.5v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-11c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2z" />
              </svg>
            </div>
            <div className="text-center space-y-2">
              <p className="text-base font-semibold text-white flex items-center gap-2 justify-center">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                Google Meet is running
              </p>
              <p className="text-xs text-gray-400 max-w-sm">
                Your meeting is open in a separate window. When you click
                <strong className="text-gray-300"> Start Recording</strong>, the browser will ask you to
                share the Google Meet tab — select it and check
                <strong className="text-gray-300"> &quot;Also share tab audio&quot;</strong> so
                the patient&apos;s voice is captured on a separate channel.
              </p>
            </div>
            <button
              type="button"
              onClick={focusPopup}
              className="rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-5 py-2 transition-colors"
            >
              Focus Google Meet window
            </button>
          </>
        ) : (
          <>
            <div className="h-16 w-16 rounded-full bg-gray-700/60 flex items-center justify-center">
              <svg className="h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.5 8.5v7l4.5 2.5V6l-4.5 2.5zM2 6.5v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-11c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2z" />
              </svg>
            </div>
            <div className="text-center space-y-1.5">
              <p className="text-sm font-semibold text-gray-200">Start a video call with your patient</p>
              <p className="text-xs text-gray-500 max-w-xs">
                Google Meet opens in a separate window. When you start recording, the browser asks you to share that tab — the patient&apos;s video and audio will appear directly in MedScribe.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleNewMeeting}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 transition-colors shadow-lg shadow-blue-600/30"
              >
                New meeting
              </button>
              <button
                type="button"
                onClick={handleJoinMeeting}
                className="rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-5 py-2.5 transition-colors border border-white/10"
              >
                Join with link
              </button>
            </div>
          </>
        )}
      </div>

      {meetUrl && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-blue-100 bg-white">
          <div className="flex items-center gap-2 text-xs text-gray-500 min-w-0">
            <span className={`h-2 w-2 rounded-full shrink-0 ${popupAlive ? "bg-green-500" : "bg-gray-300"}`} />
            <span className="truncate font-mono">{meetUrl}</span>
          </div>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(meetUrl)}
            className="shrink-0 ml-3 rounded-md bg-gray-100 hover:bg-gray-200 px-3 py-1 text-[11px] font-medium text-gray-600 transition-colors"
          >
            Copy link
          </button>
        </div>
      )}

      <div className="px-4 py-2 bg-amber-50 border-t border-amber-100">
        <p className="text-[11px] text-amber-700 leading-relaxed">
          <strong>How it works:</strong> Open your Google Meet call first. When you click Record, the browser
          asks which tab to share — pick the Google Meet tab and check <strong>&quot;Also share tab audio&quot;</strong>.
          Your mic captures your voice (Channel 1) and the tab captures the patient&apos;s voice (Channel 2) for accurate transcription.
        </p>
      </div>
    </div>
  );
}
