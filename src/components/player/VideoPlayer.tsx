import React, { useState, useEffect, useRef } from "react";
import ScreenshotButton from "@/components/layout/ScreenshotButton";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import { VideoServer } from "@/lib/videoServers";
import { Button } from "@/components/ui/button";
import { Loader, Maximize, Focus, AlertTriangle, Camera, RefreshCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWatchHistory } from "@/context/WatchHistoryContext";

interface VideoPlayerProps {
  contentId: string;
  mediaType: "movie" | "tv";
  seasonNumber?: number;
  episodeNumber?: number;
  title?: string;
  onFullscreen?: () => void;
  onFocusMode?: () => void;
}

const VideoPlayer = ({
  contentId,
  mediaType,
  seasonNumber,
  episodeNumber,
  title = "Video",
  onFullscreen = () => {},
  onFocusMode = () => {},
}: VideoPlayerProps) => {
  const {
    embedUrl,
    loading,
    error,
    currentServerId,
    servers,
    changeServer,
    updateProgress,
    isChangingServer,
  } = useVideoPlayer({
    contentId,
    mediaType,
    seasonNumber,
    episodeNumber,
    title,
  });

  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [iframeKey, setIframeKey] = useState(`${currentServerId}-${Date.now()}`);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const { addItem: addToHistory } = useWatchHistory();

  // Log component initialization
  useEffect(() => {
    console.log("VideoPlayer mounted:", {
      contentId,
      mediaType,
      seasonNumber,
      episodeNumber,
      hasSeasonEpisode: Boolean(seasonNumber && episodeNumber),
    });
  }, [contentId, mediaType, seasonNumber, episodeNumber]);

  // Handle iframe load events
  const handleIframeLoad = () => {
    console.log("Iframe loaded successfully");
    setIframeLoaded(true);
    setIframeError(false);
    
    // Add to watch history when video loads
    if (contentId && mediaType && title) {
      try {
        addToHistory({
          id: contentId,
          mediaType,
          title,
          posterPath: null,
          progress: 0,
          currentSeason: seasonNumber,
          currentEpisode: episodeNumber,
        });
        console.log("Added to watch history:", title);
      } catch (error) {
        console.error("Error adding to watch history:", error);
      }
    }
  };

  const handleIframeError = () => {
    console.error("Iframe failed to load");
    setIframeError(true);
    setIframeLoaded(false);
  };

  // Reset iframe when URL changes by creating a new iframe with a unique key
  useEffect(() => {
    console.log("Embed URL changed, resetting iframe state");
    setIframeLoaded(false);
    setIframeError(false);
    setIframeKey(`${currentServerId}-${Date.now()}`);
  }, [embedUrl, currentServerId]);

  // Handle server change with safety measures
  const handleServerChange = (serverId: string) => {
    console.log("Server change requested to:", serverId);
    if (serverId === currentServerId) {
      console.log("Already using this server, ignoring");
      return;
    }
    
    // Reset iframe state before changing server
    setIframeLoaded(false);
    setIframeError(false);
    
    // Use a small timeout to ensure UI updates before server change request
    setTimeout(() => {
      changeServer(serverId);
    }, 10);
  };

  // Periodically update watch progress (every 10 seconds)
  useEffect(() => {
    if (!iframeLoaded) return;

    const progressInterval = setInterval(() => {
      // In a real implementation, we would get the actual progress from the iframe
      // This is a simplified version that just updates with a placeholder value
      if (contentId && mediaType) {
        updateProgress(50); // 50% progress as a placeholder
        console.log("Updated watch progress to 50%");
      }
    }, 10000); // Changed from 30s to 10s to make updates more frequent for testing

    return () => clearInterval(progressInterval);
  }, [iframeLoaded, updateProgress, contentId, mediaType]);

  // Handle fullscreen
  const handleFullscreen = () => {
    if (playerContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        playerContainerRef.current.requestFullscreen();
      }
    }
    onFullscreen();
  };

  // Handle retry with different server
  const handleRetry = () => {
    const nextServer = servers.find(server => server.id !== currentServerId) || servers[0];
    console.log("Retrying with different server:", nextServer.id);
    handleServerChange(nextServer.id);
  };

  // Render loading state for both initial load and server changes
  const showLoading = loading || isChangingServer;
  
  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      <div className="relative" ref={playerContainerRef}>
        {/* Video Player */}
        <div className="aspect-video bg-black relative video-player">
          {showLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/90 z-10">
              <Loader className="w-10 h-10 text-primary animate-spin" />
              <span className="ml-3 text-foreground">
                {isChangingServer ? "Changing server..." : "Loading video..."}
              </span>
            </div>
          )}

          {error && !showLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 p-4 z-10">
              <AlertTriangle className="w-10 h-10 text-destructive mb-2" />
              <p className="text-foreground text-center mb-4">
                Failed to load video: {error.message}
              </p>
              <div className="flex flex-wrap gap-4 justify-center mb-4">
                <Button 
                  variant="outline" 
                  onClick={handleRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Try Another Server
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {servers.map((server) => (
                  <Button
                    key={server.id}
                    variant={
                      server.id === currentServerId ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleServerChange(server.id)}
                    disabled={isChangingServer}
                  >
                    {server.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {iframeError && !showLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 p-4 z-10">
              <AlertTriangle className="w-10 h-10 text-destructive mb-2" />
              <p className="text-foreground text-center mb-4">
                This server is currently unavailable. Please try another one.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {servers.map((server) => (
                  <Button
                    key={server.id}
                    variant={
                      server.id === currentServerId ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleServerChange(server.id)}
                    disabled={isChangingServer}
                  >
                    {server.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {embedUrl && !showLoading && (
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={embedUrl}
              className="w-full h-full absolute inset-0 bg-black"
              frameBorder="0"
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              referrerPolicy="strict-origin-when-cross-origin"
              allow="autoplay; encrypted-media; picture-in-picture"
            />
          )}
        </div>

        {/* Controls */}
        <div className="bg-card p-3 flex flex-wrap items-center justify-between gap-2 video-controls border-t border-border">
          <div className="flex items-center gap-2">
            <Select
              value={currentServerId}
              onValueChange={handleServerChange}
              disabled={isChangingServer}
            >
              <SelectTrigger className="w-[180px] bg-background border-border text-foreground">
                <SelectValue placeholder="Select Server" />
              </SelectTrigger>
              <SelectContent>
                {servers.map((server: VideoServer) => (
                  <SelectItem key={server.id} value={server.id}>
                    {server.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-muted-foreground text-sm hidden md:inline-block">
              {servers.find((s) => s.id === currentServerId)?.description}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFullscreen}
              className="text-foreground hover:bg-accent"
              disabled={isChangingServer}
            >
              <Maximize className="h-5 w-5" />
            </Button>

            <ScreenshotButton
              targetRef={playerContainerRef}
              contentTitle={title}
            />

            <Button
              variant="ghost"
              size="icon"
              onClick={onFocusMode}
              className="text-foreground hover:bg-accent"
              disabled={isChangingServer}
            >
              <Focus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
