import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useAuthContext } from "./AuthContext";
import {
  addToWatchHistory,
  updateWatchProgress,
  getUserWatchHistory,
  WatchHistoryItem,
} from "@/lib/firebase";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

// Cache key
const HISTORY_CACHE_KEY = "cinema_history_cache";

// Cache data interface
interface CachedHistory {
  items: WatchHistoryItem[];
  timestamp: number;
  userId: string;
}

// Context interface
interface WatchHistoryContextType {
  historyItems: WatchHistoryItem[];
  loading: boolean;
  error: Error | null;
  addItem: (item: Omit<WatchHistoryItem, "watchedAt">) => Promise<void>;
  updateProgress: (
    itemId: string,
    updates: Partial<WatchHistoryItem>
  ) => Promise<void>;
  refreshHistory: () => Promise<void>;
  isOffline: boolean;
}

// Helper functions for caching
const cacheHistoryItems = (items: WatchHistoryItem[], userId: string) => {
  const cache: CachedHistory = {
    items,
    timestamp: Date.now(),
    userId,
  };
  localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(cache));
};

const getCachedHistory = (userId: string, maxAge = 3600000): WatchHistoryItem[] | null => {
  const cacheJson = localStorage.getItem(HISTORY_CACHE_KEY);
  if (!cacheJson) return null;

  try {
    const cache = JSON.parse(cacheJson) as CachedHistory;
    // Validate cache
    if (
      cache.userId !== userId ||
      Date.now() - cache.timestamp > maxAge
    ) {
      return null;
    }
    return cache.items;
  } catch (e) {
    console.error("Error parsing history cache:", e);
    return null;
  }
};

// Create context
const WatchHistoryContext = createContext<WatchHistoryContextType | undefined>(
  undefined
);

export function WatchHistoryProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuthContext();
  const { isOnline } = useOnlineStatus();
  
  const [historyItems, setHistoryItems] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Fetch watch history
  const fetchHistory = async () => {
    if (!isAuthenticated || !user) {
      setHistoryItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try to use cached data if offline
      if (!isOnline) {
        const cachedData = getCachedHistory(user.uid);
        if (cachedData) {
          setHistoryItems(cachedData);
          console.log("Using cached history data");
          return;
        } else {
          console.log("No cached history data available while offline");
          setError(new Error("You are offline and no cached data is available"));
          return;
        }
      }

      // Fetch from Firebase if online
      const historyData = await getUserWatchHistory(user.uid);
      setHistoryItems(historyData);
      
      // Cache the data for offline use
      cacheHistoryItems(historyData, user.uid);
      console.log("Watch history fetched and cached");
    } catch (err) {
      console.error("Error fetching watch history:", err);
      
      // Try to use cached data when there's an error
      const cachedData = getCachedHistory(user.uid);
      if (cachedData) {
        setHistoryItems(cachedData);
        console.log("Error fetching history, using cached data");
      } else {
        setError(err instanceof Error ? err : new Error("Failed to fetch watch history"));
      }
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  // Add item to watch history
  const addItem = async (item: Omit<WatchHistoryItem, "watchedAt">) => {
    if (!isAuthenticated || !user) {
      throw new Error("You must be logged in to add items to your watch history");
    }

    setError(null);

    try {
      // Optimistically update UI
      const newItem: WatchHistoryItem = {
        ...item,
        watchedAt: new Date().toISOString(),
      };
      
      // Add to state - removing any existing item with same ID
      setHistoryItems(prev => [
        newItem,
        ...prev.filter(existing => existing.id !== item.id)
      ]);

      // If offline, just cache the updated state
      if (!isOnline) {
        cacheHistoryItems(historyItems, user.uid);
        return;
      }

      // Add to Firebase
      await addToWatchHistory(user.uid, item);
      
      // No need to refresh as we've already updated the UI
    } catch (err) {
      console.error("Error adding to watch history:", err);
      setError(err instanceof Error ? err : new Error("Failed to add to watch history"));
      
      // Revert the optimistic update if there was an error
      await fetchHistory();
      throw err;
    }
  };

  // Update progress
  const updateProgress = async (
    itemId: string,
    updates: Partial<WatchHistoryItem>
  ) => {
    if (!isAuthenticated || !user) {
      throw new Error("You must be logged in to update your watch history");
    }

    setError(null);

    try {
      // Find the item to update
      const existingItemIndex = historyItems.findIndex(item => item.id === itemId);
      
      if (existingItemIndex === -1 && !updates.title) {
        // If we don't have the item and don't have enough info to create it, throw error
        throw new Error("Cannot update non-existent history item without title");
      }
      
      // Optimistically update UI
      setHistoryItems(prev => {
        const newItems = [...prev];
        
        if (existingItemIndex !== -1) {
          // Update existing item
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            ...updates,
            watchedAt: new Date().toISOString()
          };
        } else if (updates.title && updates.mediaType) {
          // Create new item if we have enough info
          newItems.unshift({
            id: itemId,
            title: updates.title,
            mediaType: updates.mediaType,
            posterPath: updates.posterPath || null,
            watchedAt: new Date().toISOString(),
            progress: updates.progress || 0,
            currentSeason: updates.currentSeason,
            currentEpisode: updates.currentEpisode
          });
        }
        
        return newItems;
      });

      // If offline, just cache the updated state
      if (!isOnline) {
        cacheHistoryItems(historyItems, user.uid);
        return;
      }

      // Update in Firebase
      await updateWatchProgress(user.uid, itemId, updates);
    } catch (err) {
      console.error("Error updating watch progress:", err);
      setError(err instanceof Error ? err : new Error("Failed to update watch progress"));
      
      // Revert the optimistic update if there was an error
      await fetchHistory();
      throw err;
    }
  };

  // Refresh history (used for force refresh)
  const refreshHistory = async () => {
    if (!isOnline) {
      throw new Error("Cannot refresh watch history while offline");
    }
    await fetchHistory();
  };

  // Fetch history when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    } else {
      setHistoryItems([]);
      setInitialized(true);
    }
  }, [isAuthenticated, user?.uid]);

  return (
    <WatchHistoryContext.Provider
      value={{
        historyItems,
        loading,
        error,
        addItem,
        updateProgress,
        refreshHistory,
        isOffline: !isOnline,
      }}
    >
      {children}
    </WatchHistoryContext.Provider>
  );
}

export function useWatchHistory(): WatchHistoryContextType {
  const context = useContext(WatchHistoryContext);
  if (context === undefined) {
    throw new Error("useWatchHistory must be used within a WatchHistoryProvider");
  }
  return context;
} 