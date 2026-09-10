import React from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle2, CloudUpload } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OfflineBanner({ isOnline, pendingCount, syncing, onSync }) {
  if (isOnline && pendingCount === 0) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
        <Wifi className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Synced</span>
      </div>
    );
  }
  if (!isOnline) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
        <WifiOff className="w-3.5 h-3.5" />
        <span>Offline · {pendingCount} queued</span>
      </div>
    );
  }
  return (
    <button
      onClick={onSync}
      disabled={syncing}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition",
        "bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-60"
      )}
    >
      {syncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CloudUpload className="w-3.5 h-3.5" />}
      <span>{pendingCount} to sync</span>
    </button>
  );
}