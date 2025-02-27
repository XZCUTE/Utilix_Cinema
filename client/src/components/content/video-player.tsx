import { useState, useRef } from "react";
import { Play, Pause, Maximize, SkipForward } from "lucide-react";
import { motion } from "framer-motion";

interface VideoPlayerProps {
  src: string;
}

export default function VideoPlayer({ src }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Send message to iframe to play/pause
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

  return (
    <div 
      className="relative aspect-video bg-black"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <iframe
        ref={iframeRef}
        src={src}
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

          <button
            onClick={handleFullscreen}
            className="p-2 hover:text-primary transition-colors ml-auto"
          >
            <Maximize className="h-6 w-6" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
