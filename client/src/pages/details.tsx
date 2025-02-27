import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { getContentDetails, getContentRecommendations } from "@/lib/tmdb";
import VideoPlayer from "@/components/content/video-player";
import ContentGrid from "@/components/content/content-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function Details() {
  const { id } = useParams();

  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ["/api/content", id],
    queryFn: () => getContentDetails(id || "")
  });

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ["/api/content", id, "recommendations"],
    queryFn: () => getContentRecommendations(id || ""),
    enabled: !!id
  });

  if (contentLoading || recommendationsLoading) {
    return (
      <div className="pt-16 space-y-4">
        <Skeleton className="w-full aspect-video" />
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-full max-w-2xl mb-8" />
        </div>
      </div>
    );
  }

  if (!content) return <div>Content not found</div>;

  return (
    <div className="pt-16">
      <VideoPlayer tmdbId={content.id.toString()} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">{content.title || content.name}</h1>
        <div className="flex gap-4 text-sm text-gray-400 mb-6">
          <span>{new Date(content.release_date || content.first_air_date).getFullYear()}</span>
          {content.runtime && <span>{Math.floor(content.runtime / 60)}h {content.runtime % 60}m</span>}
          {content.vote_average && <span>Rating: {content.vote_average.toFixed(1)}</span>}
        </div>
        <p className="text-gray-200 max-w-2xl mb-12">{content.overview}</p>

        {recommendations?.results.length > 0 && (
          <ContentGrid
            title="More Like This"
            items={recommendations.results}
          />
        )}
      </div>
    </div>
  );
}