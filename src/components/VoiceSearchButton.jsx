import React from "react";
import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VoiceSearchButton({ listening, onToggle, size = "default", className }) {
  const sizes = {
    default: "w-12 h-12",
    large: "w-16 h-16",
    pill: "h-11 px-5"
  };
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative flex items-center justify-center rounded-full font-semibold text-white shadow-lg transition active:scale-95",
        listening ? "bg-rose-600" : "bg-emerald-600 hover:bg-emerald-700",
        sizes[size],
        className
      )}
      aria-label={listening ? "Stop voice search" : "Start voice search"}
    >
      {listening && (
        <span className="absolute inset-0 rounded-full bg-rose-500 animate-pulse-ring" />
      )}
      {listening && (
        <span className="absolute inset-0 rounded-full bg-rose-400 animate-pulse-ring" style={{ animationDelay: "0.4s" }} />
      )}
      <span className="relative flex items-center gap-2">
        {listening ? <Square className="w-5 h-5 fill-white" /> : <Mic className="w-5 h-5" />}
        {size === "pill" && (
          <span className="text-sm">{listening ? "Listening…" : "Voice Search"}</span>
        )}
      </span>
    </button>
  );
}