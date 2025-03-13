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
  addToLibrary,
  removeFromLibrary,
  getUserLibrary,
  LibraryItem,
  isInLibrary as checkIsInLibrary,
  auth,
} from "@/lib/firebase";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

// Cache keys
const LIBRARY_CACHE_KEY = "cinema_library_cache";

// Cache data interface
interface CachedLibrary {
  movies: LibraryItem[];
  series: LibraryItem[];
  timestamp: number;
  userId: string;
}

// Context interface
interface LibraryContextType {
  libraryItems: {
    movies: LibraryItem[];
    series: LibraryItem[];
  };
  loading: boolean;
  error: Error | null;
  addItem: (item: Omit<LibraryItem, "addedAt">) => Promise<void>;
  removeItem: (id: string, mediaType: "movie" | "tv") => Promise<void>;
  refreshLibrary: () => Promise<void>;
  isInLibrary: (id: string, mediaType: "movie" | "tv") => boolean;
  isOffline: boolean;
}

// Create context
const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

// Helper functions for caching
const cacheLibraryItems = (data: { movies: LibraryItem[]; series: LibraryItem[] }, userId: string) => {
  const cache: CachedLibrary = {
    ...data,
    timestamp: Date.now(),
    userId,
  };
  localStorage.setItem(LIBRARY_CACHE_KEY, JSON.stringify(cache));
};

const getCachedLibrary = (userId: string, maxAge = 3600000): { movies: LibraryItem[]; series: LibraryItem[] } | null => {
  const cacheJson = localStorage.getItem(LIBRARY_CACHE_KEY);
  if (!cacheJson) return null;

  try {
    const cache = JSON.parse(cacheJson) as CachedLibrary;
    // Validate cache
    if (
      cache.userId !== userId ||
      Date.now() - cache.timestamp > maxAge
    ) {
      return null;
    }
    return { movies: cache.movies, series: cache.series };
  } catch (e) {
    console.error("Error parsing library cache:", e);
    return null;
  }
};

// Provider component
export function LibraryProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthContext();
  const { isOnline } = useOnlineStatus();
  
  const [libraryItems, setLibraryItems] = useState<{
    movies: LibraryItem[];
    series: LibraryItem[];
  }>({
    movies: [],
    series: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Fetch library items
  const fetchLibrary = async () => {
    if (!isAuthenticated || !user) {
      setLibraryItems({ movies: [], series: [] });
      setLoading(false);
      setInitialized(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try to use cached data if offline
      if (!isOnline) {
        const cachedData = getCachedLibrary(user.uid);
        if (cachedData) {
          setLibraryItems(cachedData);
          console.log("Using cached library data");
        } else {
          console.log("No cached library data available while offline");
          setError(new Error("You are offline and no cached data is available"));
        }
        setLoading(false);
        setInitialized(true);
        return;
      }

      // Fetch from Firebase if online
      console.log("Fetching library from Firebase for user:", user.uid);
      const libraryData = await getUserLibrary(user.uid);
      console.log("Library data returned:", libraryData);
      setLibraryItems(libraryData);
      
      // Cache the data for offline use
      cacheLibraryItems(libraryData, user.uid);
      console.log("Library items fetched and cached, items count:", 
        libraryData.movies.length + libraryData.series.length);
    } catch (err) {
      console.error("Error fetching library:", err);
      
      // Try to use cached data when there's an error
      const cachedData = getCachedLibrary(user.uid);
      if (cachedData) {
        setLibraryItems(cachedData);
        console.log("Error fetching library, using cached data");
      } else {
        setError(err instanceof Error ? err : new Error("Failed to fetch library"));
      }
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  // Fetch library when authentication state changes
  useEffect(() => {
    console.log("Auth state changed, isAuthenticated:", isAuthenticated, "user:", user?.uid);
    if (isAuthenticated && user) {
      console.log("Fetching library for user:", user.uid);
      fetchLibrary();
    } else {
      console.log("User not authenticated, clearing library");
      setLibraryItems({ movies: [], series: [] });
      setLoading(false);
      setInitialized(true);
    }
  }, [isAuthenticated, user?.uid]);

  // Check if item is in library
  const checkIsInLibrary = useCallback((id: string, mediaType: "movie" | "tv"): boolean => {
    if (!id) return false;
    
    // Debug logging to trace issues
    console.log("Checking library for:", { id, mediaType });
    
    // Convert media type from "tv" to "series" for checking
    const type = mediaType === "tv" ? "series" : "movies";
    const items = type === "movies" ? libraryItems.movies : libraryItems.series;
    
    // Ensure we compare strings to handle numeric IDs correctly
    const result = items.some(item => String(item.id) === String(id));
    console.log("Library check result:", result);
    return result;
  }, [libraryItems]);

  // Add item to library
  const addItem = async (item: Omit<LibraryItem, "addedAt">) => {
    if (!isAuthenticated || !user) {
      throw new Error("You must be logged in to add items to your library");
    }

    setError(null);
    console.log("Adding item to library:", item);

    try {
      // Optimistically update UI
      const newItem: LibraryItem = {
        ...item,
        addedAt: new Date().toISOString(),
      };

      // Add to the appropriate array based on mediaType
      setLibraryItems(prev => {
        const updatedItems = item.mediaType === "movie" 
          ? { ...prev, movies: [...prev.movies, newItem] }
          : { ...prev, series: [...prev.series, newItem] };
        
        // Cache the updated state immediately
        if (!isOnline) {
          console.log("Offline - caching updated library state");
          cacheLibraryItems(updatedItems, user.uid);
        }
        
        return updatedItems;
      });

      // If offline, we're done
      if (!isOnline) {
        console.log("Offline - changes cached locally");
        return;
      }

      // Add to server
      console.log("Adding to server with addToLibrary function");
      await addToLibrary(user.uid, item);
      console.log("Successfully added to server library");
      
      // Refresh library to ensure we have the latest data
      await fetchLibrary();
    } catch (error) {
      console.error("Error adding item to library:", error);
      setError(error instanceof Error ? error : new Error("Failed to add item to library"));
      throw error;
    }
  };

  // Remove item from library
  const removeItem = async (id: string, mediaType: "movie" | "tv") => {
    if (!isAuthenticated || !user) {
      throw new Error("You must be logged in to remove items from your library");
    }
    
    setError(null);
    console.log("Removing item from library:", {id, mediaType});
    
    try {
      // Optimistically update UI
      setLibraryItems(prev => {
        const updatedItems = mediaType === "movie"
          ? { ...prev, movies: prev.movies.filter(item => String(item.id) !== String(id)) }
          : { ...prev, series: prev.series.filter(item => String(item.id) !== String(id)) };
        
        // Cache the updated state immediately
        if (!isOnline) {
          console.log("Offline - caching updated library state");
          cacheLibraryItems(updatedItems, user.uid);
        }
        
        return updatedItems;
      });
      
      // If offline, we're done
      if (!isOnline) {
        console.log("Offline - changes cached locally");
        return;
      }
      
      // Remove from Firebase
      console.log("Removing from server with removeFromLibrary function");
      await removeFromLibrary(user.uid, id, mediaType);
      console.log("Successfully removed from server library");
      
      // Refresh library to ensure we have the latest data
      await fetchLibrary();
    } catch (err) {
      console.error("Error removing from library:", err);
      setError(err instanceof Error ? err : new Error("Failed to remove from library"));
      
      // Revert the optimistic update if there was an error
      await fetchLibrary();
      throw err;
    }
  };

  // Refresh library (used for force refresh)
  const refreshLibrary = async () => {
    if (!isOnline) {
      throw new Error("Cannot refresh library while offline");
    }
    await fetchLibrary();
  };

  return (
    <LibraryContext.Provider
      value={{
        libraryItems,
        loading,
        error,
        addItem,
        removeItem,
        refreshLibrary,
        isInLibrary: checkIsInLibrary,
        isOffline: !isOnline,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

// Custom hook to use the library context
export function useLibrary() {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return context;
}
