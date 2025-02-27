import { useState, useRef, useEffect } from "react";
import { Play, Pause, Maximize, SkipForward, Server } from "lucide-react";
import { motion } from "framer-motion";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VideoPlayerProps {
  tmdbId: string;
  imdbId?: string;
  type?: string;
  season?: number;
  episode?: number;
}

interface ServerOption {
  name: string;
  getUrl: (params: { 
    tmdbId: string; 
    imdbId?: string;
    type?: string;
    season?: number;
    episode?: number;
  }) => string;
}

const servers: ServerOption[] = [
  {
    name: "VidSrc",
    getUrl: ({ tmdbId, type, season, episode }) => {
      if (type === "tv" && season && episode) {
        return `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`;
      } else if (type === "tv") {
        return `https://vidsrc.cc/v2/embed/tv/${tmdbId}`;
      } else if (type === "anime" && episode) {
        return `https://vidsrc.cc/v2/embed/anime/${tmdbId}/${episode}/sub`;
      }
      return `https://vidsrc.cc/v2/embed/movie/${tmdbId}`;
    },
  },
  {
    name: "2Embed",
    getUrl: ({ tmdbId, type, season, episode }) => {
      if (type === "tv" && season && episode) {
        return `https://www.2embed.stream/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://www.2embed.stream/embed/movie/${tmdbId}`;
    },
  },
  {
    name: "AutoEmbed",
    getUrl: ({ tmdbId, imdbId, type, season, episode }) => {
      const id = imdbId || tmdbId;
      const idType = imdbId ? "imdb" : "tmdb";

      if (type === "tv" && season && episode) {
        return `https://autoembed.co/tv/${idType}/${id}-${season}-${episode}`;
      }
      return `https://autoembed.co/movie/${idType}/${id}`;
    },
  },
  {
    name: "VidSrc v3",
    getUrl: ({ tmdbId, type, season, episode }) => {
      if (type === "tv" && season && episode) {
        return `https://vidsrc.cc/v3/embed/tv/${tmdbId}/${season}/${episode}?autoPlay=false`;
      } else if (type === "tv") {
        return `https://vidsrc.cc/v3/embed/tv/${tmdbId}?autoPlay=false`;
      }
      return `https://vidsrc.cc/v3/embed/movie/${tmdbId}?autoPlay=false`;
    },
  },
];

export default function VideoPlayer({ tmdbId, imdbId, type = "movie", season, episode }: VideoPlayerProps) {
  const [selectedServer, setSelectedServer] = useState(servers[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout>();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    return () => {
      if (controlsTimeout) clearTimeout(controlsTimeout);
    };
  }, [controlsTimeout]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);
    const timeout = setTimeout(() => setShowControls(false), 3000);
    setControlsTimeout(timeout);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    iframeRef.current?.contentWindow?.postMessage(
      { action: isPlaying ? "pause" : "play" },
      "*"
    );
  };

  const handleSkipForward = () => {
    iframeRef.current?.contentWindow?.postMessage(
      { action: "seek", value: 5 },
      "*"
    );
  };

  const handleFullscreen = () => {
    iframeRef.current?.requestFullscreen();
  };

  const handleServerChange = (serverName: string) => {
    const server = servers.find(s => s.name === serverName);
    if (server) {
      setSelectedServer(server);
      setIsPlaying(false);
    }
  };

  const videoUrl = selectedServer.getUrl({ tmdbId, imdbId, type, season, episode });

  return (
    <div 
      className="relative aspect-video bg-black"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <iframe
        ref={iframeRef}
        src={videoUrl}
        className="w-full h-full"
        allowFullScreen
      />

      <motion.div 
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayPause}
              className="p-2 hover:text-primary transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </button>

            <button
              onClick={handleSkipForward}
              className="p-2 hover:text-primary transition-colors"
            >
              <SkipForward className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 flex items-center">
            <Select
              value={selectedServer.name}
              onValueChange={handleServerChange}
            >
              <SelectTrigger className="w-[180px] bg-black/50">
                <Server className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {servers.map((server) => (
                  <SelectItem key={server.name} value={server.name}>
                    {server.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={handleFullscreen}
            className="p-2 hover:text-primary transition-colors"
          >
            <Maximize className="h-6 w-6" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}