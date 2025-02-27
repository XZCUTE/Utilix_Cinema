import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { searchContent } from "@/lib/tmdb";
import ContentGrid from "@/components/content/content-grid";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TMDBContent } from "@shared/schema";

type MediaType = "all" | "movie" | "tv" | "anime";

export default function Search() {
  const [location] = useLocation();
  const [mediaFilter, setMediaFilter] = useState<MediaType>("all");

  // Get search query from URL
  const searchParams = new URLSearchParams(location.split("?")[1]);
  const query = searchParams.get("q") || "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/search", query],
    queryFn: () => searchContent(query),
    enabled: !!query.trim(),
  });

  const filteredResults = data?.results?.filter(item => {
    if (mediaFilter === "all") return true;
    if (mediaFilter === "movie") return item.media_type === "movie";
    if (mediaFilter === "tv") return item.media_type === "tv";
    if (mediaFilter === "anime") {
      return (
        item.title?.toLowerCase().includes("anime") ||
        item.name?.toLowerCase().includes("anime") ||
        (item.genre_ids && item.genre_ids.includes(16)) // Animation genre ID
      );
    }
    return true;
  }) || [];

  if (!query.trim()) {
    return (
      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        <p className="text-gray-400">Enter a search term in the search bar above to find movies, TV shows, and anime.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-2xl font-bold mb-8">Searching for "{query}"...</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500">An error occurred while searching. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            Search Results for "{query}"
          </h1>
          <p className="text-gray-400">
            Found {filteredResults.length} results
          </p>
        </div>

        <Select
          value={mediaFilter}
          onValueChange={(value) => setMediaFilter(value as MediaType)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Content</SelectItem>
            <SelectItem value="movie">Movies</SelectItem>
            <SelectItem value="tv">TV Shows</SelectItem>
            <SelectItem value="anime">Anime</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredResults.length > 0 ? (
        <ContentGrid
          title=""
          items={filteredResults}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-2">No results found for "{query}"</p>
          <p className="text-sm text-gray-500">Try different keywords or remove some filters</p>
        </div>
      )}
    </div>
  );
}