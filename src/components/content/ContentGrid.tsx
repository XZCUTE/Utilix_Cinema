import React, { useState, useEffect, useRef } from "react";
import { Loader } from "lucide-react";
import ContentCard from "./ContentCard";
import { useLibrary } from "@/context/LibraryContext";

interface ContentItem {
  id: string;
  title: string;
  year: number;
  rating: string;
  posterUrl: string;
  type: "movie" | "series";
  mediaType?: string;
}

interface ContentGridProps {
  items?: ContentItem[];
  isLoading?: boolean;
  filter?: string;
  genre?: string;
  onLoadMore?: () => void;
  onPlayClick?: (id: string) => void;
  onInfoClick?: (id: string) => void;
}

const ContentGrid = ({
  items = [],
  isLoading = false,
  filter = "popular",
  genre = "all",
  onPlayClick = (id: string) => {},
  onInfoClick = (id: string) => {},
}: ContentGridProps) => {
  const [loading, setLoading] = useState(isLoading);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const { isInLibrary } = useLibrary();

  // Update loading state when prop changes
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  // Filter items based on filter and genre
  const filteredItems = items.filter((item) => {
    if (filter === "movies" && item.type !== "movie") return false;
    if (filter === "series" && item.type !== "series") return false;
    // Additional genre filtering would go here if implemented
    return true;
  });

  // Removed infinite scroll functionality as per requirements

  return (
    <div className="w-full min-h-screen bg-background p-6 transition-colors duration-500">
      {/* Content grid with staggered animation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        {filteredItems.map((item, index) => {
          // Add validation for missing titles with detailed logging
          const validatedItem = { ...item };
          if (!validatedItem.title || validatedItem.title.trim() === '') {
            validatedItem.title = item.type === 'movie' 
              ? `Movie #${item.id}` 
              : `TV Show #${item.id}`;
          }
          
          // Convert type to mediaType for library functions
          const mediaType = (item.mediaType || (item.type === "series" ? "tv" : "movie")) as "movie" | "tv";
          
          return (
            <div 
              key={item.id} 
              className="w-full" 
              style={{ 
                animationDelay: `${index * 0.05}s`,
                opacity: 0,
                animation: 'fadeIn 0.5s ease forwards'
              }}
            >
              <ContentCard
                id={item.id}
                title={validatedItem.title}
                year={item.year}
                rating={item.rating}
                posterUrl={item.posterUrl}
                type={item.type}
                isInLibrary={isInLibrary(item.id, mediaType)}
                onPlayClick={() => onPlayClick(item.id)}
                onInfoClick={() => onInfoClick(item.id)}
              />
            </div>
          );
        })}
      </div>

      {/* Empty state with improved visuals */}
      {filteredItems.length === 0 && !loading && (
        <div className="w-full flex flex-col justify-center items-center py-16 animate-fade-in">
          <div className="w-16 h-16 mb-4 rounded-full bg-card flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-muted-foreground" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <p className="text-muted-foreground text-center">
            No content found matching your filters
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1 text-center">
            Try changing your filters or check back later
          </p>
        </div>
      )}
      
      {/* Loading state with improved animation */}
      {loading && (
        <div className="w-full flex justify-center items-center py-16">
          <div className="flex flex-col items-center animate-pulse">
            <Loader className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading content...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGrid;
