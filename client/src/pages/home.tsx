import { useQuery } from "@tanstack/react-query";
import HeroSection from "@/components/content/hero-section";
import ContentGrid from "@/components/content/content-grid";
import { getTrending, getPopularMovies, getPopularTVShows } from "@/lib/tmdb";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ["/api/trending"],
    queryFn: getTrending
  });

  const { data: moviesData, isLoading: moviesLoading } = useQuery({
    queryKey: ["/api/movies/popular"],
    queryFn: getPopularMovies
  });

  const { data: tvShowsData, isLoading: tvShowsLoading } = useQuery({
    queryKey: ["/api/tv/popular"],
    queryFn: getPopularTVShows
  });

  if (trendingLoading || moviesLoading || tvShowsLoading) {
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

  const featuredContent = trendingData?.results[0];

  return (
    <div className="space-y-8 pt-16">
      {featuredContent && <HeroSection content={featuredContent} />}
      
      <div className="container mx-auto px-4 space-y-8">
        <ContentGrid
          title="Trending Now"
          items={trendingData?.results.slice(1) || []}
        />
        
        <ContentGrid
          title="Popular Movies"
          items={moviesData?.results || []}
        />
        
        <ContentGrid
          title="Popular TV Shows"
          items={tvShowsData?.results || []}
        />
      </div>
    </div>
  );
}
