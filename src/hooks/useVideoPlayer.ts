import { useState, useCallback, useEffect } from "react";
import {
  loadVideo,
  videoServers,
  getFallbackServer,
  VideoServer,
} from "@/lib/videoServers";
import { useWatchHistory } from "@/context/WatchHistoryContext";

interface UseVideoPlayerProps {
  contentId: string;
  mediaType: "movie" | "tv";
  initialServerId?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  title?: string;
  posterPath?: string | null;
}

export function useVideoPlayer({
  contentId,
  mediaType,
  initialServerId = "vidsrcXyz",
  seasonNumber,
  episodeNumber,
  title,
  posterPath = null,
}: UseVideoPlayerProps) {
  const [currentServerId, setCurrentServerId] = useState(initialServerId);
  const [embedUrl, setEmbedUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [servers] = useState(videoServers);
  const { updateProgress: updateWatchProgress, addItem } = useWatchHistory();
  const [isChangingServer, setIsChangingServer] = useState(false);

  // Load video from selected server
  const loadVideoFromServer = useCallback(
    async (serverId: string) => {
      console.log("Starting to load video from server:", serverId);
      setLoading(true);
      setError(null);
      setIsChangingServer(true);
      
      try {
        // Validate parameters
        if (!contentId) {
          throw new Error("Missing content ID");
        }

        // Log details for debugging
        console.log("Loading video with params:", {
          contentId,
          mediaType,
          serverId,
          seasonNumber,
          episodeNumber,
          isTVShow: mediaType === "tv",
        });

        const url = loadVideo(
          contentId,
          mediaType,
          serverId,
          seasonNumber,
          episodeNumber,
        );

        // Ensure URL is properly formed
        if (!url) {
          throw new Error("Generated URL is empty");
        }

        console.log("Generated video URL:", url);

        // Update state in this order
        setCurrentServerId(serverId);
        setEmbedUrl(url);
        
        // Add to watch history when video loads
        if (title) {
          addItem({
            id: contentId,
            mediaType,
            title,
            posterPath,
            progress: 0,
            currentSeason: seasonNumber,
            currentEpisode: episodeNumber,
          });
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to load video");
        console.error("Video loading error:", error);
        setError(error);
        
        // Only try fallback server if not already changing server
        if (!isChangingServer) {
          const fallbackServer = getFallbackServer(serverId);
          if (fallbackServer.id !== serverId) {
            console.log(`Trying fallback server: ${fallbackServer.id}`);
            // Use timeout to prevent stack overflow
            setTimeout(() => {
              loadVideoFromServer(fallbackServer.id);
            }, 100);
          }
        }
      } finally {
        setLoading(false);
        setIsChangingServer(false);
      }
    },
    [contentId, mediaType, seasonNumber, episodeNumber, title, posterPath, addItem, isChangingServer],
  );

  // Change server - now with debounce protection
  const changeServer = useCallback(
    (serverId: string) => {
      if (serverId === currentServerId || isChangingServer) {
        console.log("Skipping change to same server or already changing");
        return;
      }
      console.log("Changing server to:", serverId);
      loadVideoFromServer(serverId);
    },
    [loadVideoFromServer, currentServerId, isChangingServer],
  );

  // Update watch progress
  const updateProgress = useCallback(
    (progress: number) => {
      try {
        updateWatchProgress(contentId, {
          progress,
          currentSeason: mediaType === "tv" ? seasonNumber : undefined,
          currentEpisode: mediaType === "tv" ? episodeNumber : undefined,
        });
      } catch (error) {
        console.error("Error updating watch progress:", error);
      }
    },
    [contentId, mediaType, seasonNumber, episodeNumber, updateWatchProgress],
  );

  // Load video when component mounts or content changes, but NOT when server ID changes
  // as that's handled by the changeServer function
  useEffect(() => {
    if (!isChangingServer) {
      console.log("Initial video load or content changed, loading video");
      loadVideoFromServer(currentServerId);
    }
  }, [
    loadVideoFromServer,
    contentId,
    mediaType,
    seasonNumber,
    episodeNumber,
    // Remove currentServerId from dependencies to avoid loops
  ]);

  return {
    embedUrl,
    loading,
    error,
    currentServerId,
    servers,
    changeServer,
    updateProgress,
    isChangingServer,
  };
}
