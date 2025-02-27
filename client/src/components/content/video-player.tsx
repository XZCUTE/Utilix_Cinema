import { useState, useRef } from "react";
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
}

interface ServerOption {
  name: string;
  getUrl: (ids: { tmdbId: string; imdbId?: string }) => string;
}

const servers: ServerOption[] = [
  {
    name: "VidSrc",
    getUrl: ({ tmdbId }) => `https://vidsrc.cc/v2/embed/movie/${tmdbId}`,
  },
  {
    name: "2Embed",
    getUrl: ({ tmdbId }) => `https://www.2embed.stream/embed/movie/${tmdbId}`,
  },
  {
    name: "AutoEmbed",
    getUrl: ({ tmdbId }) => `https://autoembed.co/movie/tmdb/${tmdbId}`,
  },
];

export default function VideoPlayer({ tmdbId, imdbId }: VideoPlayerProps) {
  const [selectedServer, setSelectedServer] = useState(servers[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  const videoUrl = selectedServer.getUrl({ tmdbId, imdbId });

  return (
    <div 
      className="relative aspect-video bg-black"
      onMouseEnter={() => setShowControls(true)}
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