import { useQuery } from "@tanstack/react-query";
import HeroSection from "@/components/content/hero-section";
import ContentGrid from "@/components/content/content-grid";
import { getTrendingAnime, getPopularAnime, getTopRatedAnime, getSeasonalAnime } from "@/lib/tmdb";
import { Skeleton } from "@/components/ui/skeleton";

export default function Anime() {
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ["/api/anime/trending"],
    queryFn: getTrendingAnime
  });

  const { data: popularData, isLoading: popularLoading } = useQuery({
    queryKey: ["/api/anime/popular"],
    queryFn: getPopularAnime
  });

  const { data: topRatedData, isLoading: topRatedLoading } = useQuery({
    queryKey: ["/api/anime/top-rated"],
    queryFn: getTopRatedAnime
  });

  const { data: seasonalData, isLoading: seasonalLoading } = useQuery({
    queryKey: ["/api/anime/seasonal"],
    queryFn: getSeasonalAnime
  });

  if (trendingLoading || popularLoading || topRatedLoading || seasonalLoading) {
    return (
      <div className="space-y-8 pt-16">
        <Skeleton className="w-full h-[60vh]" />
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const featuredAnime = trendingData?.results[0];

  return (
    <div className="space-y-8 pt-16">
      {featuredAnime && <HeroSection content={featuredAnime} />}
      
      <div className="container mx-auto px-4 space-y-8">
        <ContentGrid
          title="Trending Anime"
          items={trendingData?.results.slice(1) || []}
        />
        
        <ContentGrid
          title="Popular This Season"
          items={seasonalData?.results || []}
        />
        
        <ContentGrid
          title="All-Time Popular"
          items={popularData?.results || []}
        />
        
        <ContentGrid
          title="Top Rated Anime"
          items={topRatedData?.results || []}
        />
      </div>
    </div>
  );
}
