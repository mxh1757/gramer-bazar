import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";

const QUEUE_KEY = "hatbazar_offline_queue";

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const syncingRef = useRef(false);

  const readQueue = () => {
    try {
      return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const refreshCount = useCallback(() => {
    setPendingCount(readQueue().length);
  }, []);

  const addToQueue = useCallback((product) => {
    const q = readQueue();
    q.push({ ...product, is_offline_queued: true, queuedAt: Date.now() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
    refreshCount();
  }, [refreshCount]);

  const syncQueue = useCallback(async () => {
    if (syncingRef.current) return;
    const q = readQueue();
    if (q.length === 0) return;
    syncingRef.current = true;
    setSyncing(true);
    const remaining = [];
    for (const item of q) {
      try {
        const { queuedAt, ...payload } = item;
        await base44.entities.Product.create(payload);
      } catch (e) {
        remaining.push(item);
      }
    }
    localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    setPendingCount(remaining.length);
    setSyncing(false);
    setLastSync(Date.now());
    syncingRef.current = false;
  }, []);

  useEffect(() => {
    const on = () => { setIsOnline(true); syncQueue(); };
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    refreshCount();
    if (navigator.onLine && readQueue().length > 0) syncQueue();
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [refreshCount, syncQueue]);

  return { isOnline, pendingCount, addToQueue, syncQueue, syncing, lastSync };
}