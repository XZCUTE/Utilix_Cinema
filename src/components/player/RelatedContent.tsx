import React from "react";
import { getTMDBImageUrl } from "@/lib/tmdb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Play, Info, Loader } from "lucide-react";
import { useSimilarContent } from "@/hooks/useTMDB";

interface ContentItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  media_type?: "movie" | "tv";
}

interface RelatedContentProps {
  id: number;
  mediaType: "movie" | "tv";
  onPlayClick: (id: number, type: "movie" | "tv") => void;
  onInfoClick: (id: number, type: "movie" | "tv") => void;
}

const RelatedContent = ({
  id,
  mediaType,
  onPlayClick,
  onInfoClick,
}: RelatedContentProps) => {
  const { data: items, loading, error } = useSimilarContent(id, mediaType);
  
  if (loading) {
    return (
      <div className="bg-card rounded-lg p-4 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Related Content
        </h3>
        <div className="flex justify-center items-center py-8">
          <Loader className="h-8 w-8 text-primary animate-spin" />
          <span className="ml-2 text-muted-foreground">Loading similar content...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-card rounded-lg p-4 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Related Content
        </h3>
        <p className="text-muted-foreground text-center py-8">
          Error loading related content.
        </p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="bg-card rounded-lg p-4 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Related Content
        </h3>
        <p className="text-muted-foreground text-center py-8">
          No related content available.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg overflow-hidden border border-border">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">You May Also Like</h3>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="p-4 grid grid-cols-1 gap-4">
          {items.map((item) => {
            const itemType = item.media_type || mediaType;
            const title = item.title || item.name || "Unknown Title";

            return (
              <div
                key={item.id}
                className="flex gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex-shrink-0 w-16 h-24 relative rounded overflow-hidden bg-muted">
                  {item.poster_path ? (
                    <img
                      src={getTMDBImageUrl(item.poster_path, "poster", "small")}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-foreground truncate">
                      {title}
                    </h4>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs font-medium">
                        ★ {item.vote_average.toFixed(1)}
                      </span>
                      <span className="ml-2 capitalize">{itemType}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="h-8 px-2 text-xs flex-1"
                      onClick={() => onPlayClick(item.id, itemType)}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Play
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 text-xs flex-1"
                      onClick={() => onInfoClick(item.id, itemType)}
                    >
                      <Info className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RelatedContent;
