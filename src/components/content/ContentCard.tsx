import React, { useState } from "react";
import { Play, Info, Plus, Check, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLibrary } from "@/context/LibraryContext";
import { getTMDBImageUrl } from "@/lib/tmdb";
import { useAuthContext } from "@/context/AuthContext";

interface ContentCardProps {
  id?: string;
  title?: string;
  year?: number;
  rating?: string;
  posterUrl?: string;
  type?: "movie" | "series";
  isInLibrary?: boolean;
  onClick?: () => void;
  onPlayClick?: () => void;
  onInfoClick?: () => void;
}

const ContentCard = ({
  id = "default-id",
  title = "",
  year = new Date().getFullYear(),
  rating = "PG-13",
  posterUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80",
  type = "movie",
  isInLibrary = false,
  onClick = () => {},
  onPlayClick = () => {},
  onInfoClick = () => {},
}: ContentCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem, removeItem, isInLibrary: checkIsInLibrary, refreshLibrary } = useLibrary();
  const [inLibrary, setInLibrary] = useState(isInLibrary);
  const [isAddingToLibrary, setIsAddingToLibrary] = useState(false);
  const { isAuthenticated } = useAuthContext();

  // Convert type to mediaType for library functions
  const mediaType = type === "series" ? "tv" : "movie";

  // Handle library toggle
  const handleLibraryToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;

    try {
      setIsAddingToLibrary(true);
      if (inLibrary) {
        // Remove from library
        await removeItem(id, mediaType);
        setInLibrary(false);
      } else {
        // Add to library
        await addItem({
          id,
          title,
          mediaType,
          posterPath: posterUrl,
        });
        setInLibrary(true);
      }
      
      // Refresh library to ensure UI is in sync
      await refreshLibrary();
      
      // Double-check the library status
      const currentStatus = checkIsInLibrary(id, mediaType);
      setInLibrary(currentStatus);
    } catch (error) {
      console.error("Error toggling library status:", error);
      // Revert state on error
      setInLibrary(!inLibrary);
    } finally {
      setIsAddingToLibrary(false);
    }
  };

  // Check if item is in library
  React.useEffect(() => {
    const checkLibraryStatus = async () => {
      if (isAuthenticated && id) {
        const isIn = checkIsInLibrary(id, mediaType);
        setInLibrary(isIn);
      }
    };

    checkLibraryStatus();
  }, [id, mediaType, checkIsInLibrary, isAuthenticated, refreshLibrary]);

  // Use fixed aspect ratio for cards
  return (
    <div className="flex flex-col group hover-lift animate-fade-in">
      {/* Card with poster and hover overlay */}
      <div
        className="relative cursor-pointer"
        onClick={() => {
          // Use onPlayClick instead of onClick for main card click
          onPlayClick();
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden rounded-lg aspect-[2/3] bg-card shadow-md transition-all duration-300 group-hover:shadow-xl">
          {/* Poster Image */}
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-card">
              <span className="text-muted-foreground">{title || "No Image"}</span>
            </div>
          )}

          {/* Badge for rating */}
          <div className="absolute top-2 right-2 scale-90 group-hover:scale-100 transition-transform">
            <Badge variant="secondary" className="text-xs font-medium shadow-sm">
              {rating}
            </Badge>
          </div>

          {/* Hover Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/70 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <h3 className="text-foreground font-bold truncate">
                  {title || `[Untitled ${type}]`}
                </h3>
              </div>

              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <span>{year}</span>
                <span className="mx-1">•</span>
                <span className="capitalize">{type}</span>
              </div>

              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  className="w-full gap-1 theme-gradient-primary hover:brightness-110 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayClick();
                  }}
                >
                  <Play size={16} />
                  Play
                </Button>
              </div>

              {/* Library button */}
              <Button
                size="sm"
                variant={inLibrary ? "default" : "outline"}
                className={`mt-2 gap-1 transition-all duration-300 ${
                  inLibrary 
                    ? "bg-primary/80 hover:bg-primary/90" 
                    : "bg-background/70 backdrop-blur-sm border-border hover:bg-accent/30"
                }`}
                onClick={handleLibraryToggle}
                disabled={isAddingToLibrary || !isAuthenticated}
              >
                {isAddingToLibrary ? (
                  <Loader size={16} className="animate-spin" />
                ) : inLibrary ? (
                  <Check size={16} className="text-primary-foreground" />
                ) : (
                  <Plus size={16} />
                )}
                {inLibrary ? "In Library" : "Add to Library"}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content title - always visible */}
      <div className="mt-2 px-1 transition-all duration-150 group-hover:translate-y-[-2px]">
        <h3 className="font-medium text-sm truncate text-foreground">
          {title || `[Untitled ${type}]`}
        </h3>
        <div className="flex items-center text-xs text-muted-foreground">
          <span>{year}</span>
          <span className="mx-1">•</span>
          <span className="capitalize">{type}</span>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
