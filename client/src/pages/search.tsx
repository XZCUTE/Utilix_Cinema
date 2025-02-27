import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { searchContent } from "@/lib/tmdb";
import ContentGrid from "@/components/content/content-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function Search() {
  const [location] = useLocation();
  const query = new URLSearchParams(location.split("?")[1]).get("q") || "";

  const { data, isLoading } = useQuery({
    queryKey: ["/api/search", query],
    queryFn: () => searchContent(query),
    enabled: !!query
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
      <h1 className="text-2xl font-bold mb-8">
        Search Results for "{query}"
      </h1>
      
      {data?.results.length ? (
        <ContentGrid
          title=""
          items={data.results}
        />
      ) : (
        <p className="text-gray-400">No results found</p>
      )}
    </div>
  );
}
