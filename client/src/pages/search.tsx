import { useState } from "react";
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

type MediaType = "all" | "movie" | "tv";

export default function Search() {
  const [location] = useLocation();
  const [mediaFilter, setMediaFilter] = useState<MediaType>("all");

  // Get search query from URL
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") || "";

  const { data, isLoading } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchContent(query),
    enabled: !!query
  });

  const filteredResults = data?.results?.filter(item => {
    if (mediaFilter === "all") return true;
    return item.media_type === mediaFilter;
  }) || [];

  if (!query) {
    return (
      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        <p className="text-gray-400">Enter a search term to find movies and TV shows.</p>
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
          <p className="text-sm text-gray-500">Try different keywords or remove filters</p>
        </div>
      )}
    </div>
  );
}