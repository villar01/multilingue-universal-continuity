/**
 * useOfflineSyncDB — IndexedDB-based offline persistence for conversations and lesson data
 * Stores pending interactions locally and syncs when back online
 */
import { useState, useEffect, useCallback } from "react";

const DB_NAME = "multilingue-offline";
const DB_VERSION = 1;
const STORE_CONVERSATIONS = "conversations";
const STORE_LESSONS = "lessons";
const STORE_PENDING = "pending-sync";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_CONVERSATIONS)) {
        db.createObjectStore(STORE_CONVERSATIONS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_LESSONS)) {
        db.createObjectStore(STORE_LESSONS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_PENDING)) {
        db.createObjectStore(STORE_PENDING, { keyPath: "id", autoIncrement: true });
      }
    };
  });
}

export interface OfflineConversation {
  id: string;
  messages: Array<{ role: "user" | "assistant"; content: string; timestamp: number }>;
  language: string;
  createdAt: number;
}

export interface OfflineLesson {
  id: string;
  data: unknown;
  cachedAt: number;
}

export interface PendingSync {
  id?: number;
  type: "conversation" | "progress" | "lesson_completion";
  data: unknown;
  createdAt: number;
}

export function useOfflineSyncDB() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Count pending items on mount
  useEffect(() => {
    refreshPendingCount();
  }, []);

  const refreshPendingCount = useCallback(async () => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_PENDING, "readonly");
      const store = tx.objectStore(STORE_PENDING);
      const countReq = store.count();
      countReq.onsuccess = () => setPendingCount(countReq.result);
    } catch {
      // IndexedDB might not be available
    }
  }, []);

  // Save conversation locally
  const saveConversation = useCallback(async (conversation: OfflineConversation) => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_CONVERSATIONS, "readwrite");
      const store = tx.objectStore(STORE_CONVERSATIONS);
      store.put(conversation);
    } catch {
      // Silently fail
    }
  }, []);

  // Get all saved conversations
  const getConversations = useCallback(async (): Promise<OfflineConversation[]> => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_CONVERSATIONS, "readonly");
      const store = tx.objectStore(STORE_CONVERSATIONS);
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }, []);

  // Cache lesson data for offline access
  const cacheLesson = useCallback(async (lesson: OfflineLesson) => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_LESSONS, "readwrite");
      const store = tx.objectStore(STORE_LESSONS);
      store.put(lesson);
    } catch {
      // Silently fail
    }
  }, []);

  // Get cached lessons
  const getCachedLessons = useCallback(async (): Promise<OfflineLesson[]> => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_LESSONS, "readonly");
      const store = tx.objectStore(STORE_LESSONS);
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }, []);

  // Add pending sync item (will be synced when online)
  const addPendingSync = useCallback(async (item: Omit<PendingSync, "id">) => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_PENDING, "readwrite");
      const store = tx.objectStore(STORE_PENDING);
      store.add(item);
      await refreshPendingCount();
    } catch {
      // Silently fail
    }
  }, [refreshPendingCount]);

  // Get and clear pending sync items
  const getPendingSync = useCallback(async (): Promise<PendingSync[]> => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_PENDING, "readonly");
      const store = tx.objectStore(STORE_PENDING);
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }, []);

  const clearPendingSync = useCallback(async () => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_PENDING, "readwrite");
      const store = tx.objectStore(STORE_PENDING);
      store.clear();
      await refreshPendingCount();
    } catch {
      // Silently fail
    }
  }, [refreshPendingCount]);

  return {
    isOnline,
    pendingCount,
    saveConversation,
    getConversations,
    cacheLesson,
    getCachedLessons,
    addPendingSync,
    getPendingSync,
    clearPendingSync,
  };
}
