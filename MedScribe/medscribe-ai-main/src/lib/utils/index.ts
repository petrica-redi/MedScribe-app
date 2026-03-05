import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function formatDate(dateString: string): string {
  const d = new Date(dateString);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatDateTime(dateString: string): string {
  const d = new Date(dateString);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}, ${h12.toString().padStart(2, "0")}:${m} ${ampm}`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    scheduled: "bg-gray-100 text-gray-700",
    recording: "bg-red-100 text-red-700",
    transcribed: "bg-blue-100 text-blue-700",
    note_generated: "bg-amber-100 text-amber-700",
    reviewed: "bg-emerald-100 text-emerald-700",
    finalized: "bg-green-100 text-green-700",
    draft: "bg-gray-100 text-gray-700",
  };
  return colors[status] ?? "bg-gray-100 text-gray-700";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    scheduled: "Scheduled",
    recording: "Recording",
    transcribed: "Transcribed",
    note_generated: "Note Generated",
    reviewed: "Reviewed",
    finalized: "Finalized",
    draft: "Draft",
  };
  return labels[status] ?? status;
}
