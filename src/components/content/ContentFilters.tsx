import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Filter, TrendingUp, ThumbsUp, Award } from "lucide-react";
import { useGenres } from "@/hooks/useTMDB";

interface ContentFiltersProps {
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  onGenreSelect?: (genre: string, genreId: number) => void;
  activeGenre?: string | null;
  contentType?: "movie" | "tv" | "all";
  showGenreFilters?: boolean;
  showFilterTabs?: boolean;
}

const ContentFilters = ({
  activeFilter = "popular",
  onFilterChange = () => {},
  onGenreSelect = () => {},
  activeGenre = null,
  contentType = "all",
  showGenreFilters = false,
  showFilterTabs = true,
}: ContentFiltersProps) => {
  const [showGenres, setShowGenres] = useState(true);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  // Fetch appropriate genres based on contentType
  const { data: movieGenres, loading: movieGenresLoading } = useGenres(
    contentType === "all" || contentType === "movie" ? "movie" : "tv",
  );
  const { data: tvGenres, loading: tvGenresLoading } = useGenres(
    contentType === "all" ? "tv" : contentType,
  );

  // Combine and deduplicate genres
  const allGenres = React.useMemo(() => {
    if (!movieGenres && !tvGenres) return [];

    const combinedGenres = [...(movieGenres || []), ...(tvGenres || [])];
    const uniqueGenres = Array.from(
      new Map(combinedGenres.map((genre) => [genre.name, genre])).values(),
    );
    return uniqueGenres.sort((a, b) => a.name.localeCompare(b.name));
  }, [movieGenres, tvGenres]);

  // Handle genre selection
  const handleGenreClick = (genreName: string) => {
    // Find the genre ID from the combined genres
    const genre = allGenres.find((g) => g.name === genreName);
    if (!genre) return;

    if (selectedGenres.includes(genreName)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genreName));
    } else {
      setSelectedGenres([...selectedGenres, genreName]);
    }
    onGenreSelect(genreName, genre.id);
  };

  // Clear all selected genres
  const clearGenres = () => {
    setSelectedGenres([]);
  };

  return (
    <div className="w-full bg-background/95 backdrop-blur-sm border-b border-border py-3 px-4 sticky top-0 z-10 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Primary Category Filter - Limited to 3 options */}
        {showFilterTabs && (
          <div className="mb-4 animate-fade-in">
            <Tabs 
              defaultValue={activeFilter} 
              onValueChange={onFilterChange}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 w-full bg-card text-card-foreground shadow-md">
                <TabsTrigger 
                  value="trending" 
                  className="flex items-center gap-2 transition-all duration-300 data-[state=active]:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <TrendingUp className="w-4 h-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger 
                  value="popular" 
                  className="flex items-center gap-2 transition-all duration-300 data-[state=active]:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Popular
                </TabsTrigger>
                <TabsTrigger 
                  value="top_rated" 
                  className="flex items-center gap-2 transition-all duration-300 data-[state=active]:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Award className="w-4 h-4" />
                  Top Rated
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
        
        {/* Genre section - only show if showGenreFilters is true */}
        {showGenreFilters && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">
                {contentType === "movie" ? "Movies" : contentType === "tv" ? "TV Shows" : "Content"} by Genre
              </h2>
              
              <div className="flex items-center gap-2">
                {selectedGenres.length > 0 && (
                  <div className="flex items-center gap-2 bg-card/50 px-2 py-1 rounded-md border border-border/50 animate-scale-in">
                    <div className="text-sm text-muted-foreground">
                      Filters:
                      <span className="font-medium text-foreground ml-1">
                        {selectedGenres.length} selected
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedGenres([]);
                        clearGenres();
                      }}
                      className="h-7 px-2 text-xs hover:bg-background hover:text-destructive transition-colors duration-200"
                    >
                      Clear
                    </Button>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 bg-card/50 hover:bg-card border-border/50 shadow-sm hover:shadow transition-all duration-200"
                  onClick={() => setShowGenres(!showGenres)}
                >
                  <Filter size={16} />
                  Genres
                  {showGenres ? (
                    <ChevronUp size={14} className="ml-1 transition-transform duration-200" />
                  ) : (
                    <ChevronDown size={14} className="ml-1 transition-transform duration-200" />
                  )}
                </Button>
              </div>
            </div>

            {/* Genre Filter Panel - Always visible by default */}
            {showGenres && (
              <div className="pb-2 max-w-7xl mx-auto animate-scale-in">
                <div className="flex flex-wrap gap-2">
                  {allGenres.map((genre) => (
                    <Badge
                      key={genre.id}
                      variant={
                        selectedGenres.includes(genre.name) ||
                        activeGenre === genre.name
                          ? "default"
                          : "outline"
                      }
                      className={`cursor-pointer transition-all duration-200 px-3 py-1 text-xs hover-lift ${
                        selectedGenres.includes(genre.name) || activeGenre === genre.name
                          ? "bg-primary shadow-md"
                          : "bg-card/50 hover:bg-card border-border/50 shadow-sm hover:shadow"
                      }`}
                      onClick={() => handleGenreClick(genre.name)}
                    >
                      {genre.name}
                    </Badge>
                  ))}

                  {(movieGenresLoading || tvGenresLoading) && (
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="inline-block h-4 w-4 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin"></span>
                      Loading genres...
                    </span>
                  )}

                  {!movieGenresLoading &&
                    !tvGenresLoading &&
                    allGenres.length === 0 && (
                      <span className="text-sm text-muted-foreground">
                        No genres available
                      </span>
                    )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentFilters;
