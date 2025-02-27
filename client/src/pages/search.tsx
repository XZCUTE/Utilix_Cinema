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
import { TMDBContent } from "@shared/schema";

type MediaType = "all" | "movie" | "tv" | "anime";

export default function Search() {
  const [location] = useLocation();
  const query = new URLSearchParams(location.split("?")[1]).get("q") || "";
  const [mediaFilter, setMediaFilter] = useState<MediaType>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["/api/search", query],
    queryFn: () => searchContent(query),
    enabled: !!query
  });

  const filteredResults = data?.results.filter(item => {
    if (mediaFilter === "all") return true;
    if (mediaFilter === "movie") return item.media_type === "movie";
    if (mediaFilter === "tv") return item.media_type === "tv";
    if (mediaFilter === "anime") return item.title?.toLowerCase().includes("anime");
    return true;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 pt-24">
        <Skeleton className="h-8 w-64 mb-8" />
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
        <h1 className="text-2xl font-bold">
          Search Results for "{query}"
        </h1>

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

      {filteredResults?.length ? (
        <ContentGrid
          title=""
          items={filteredResults}
        />
      ) : (
        <p className="text-gray-400">No results found</p>
      )}
    </div>
  );
}