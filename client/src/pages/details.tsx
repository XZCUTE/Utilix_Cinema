import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { getContentDetails } from "@/lib/tmdb";
import VideoPlayer from "@/components/content/video-player";
import { Skeleton } from "@/components/ui/skeleton";

export default function Details() {
  const { id } = useParams();

  const { data: content, isLoading } = useQuery({
    queryKey: ["/api/content", id],
    queryFn: () => getContentDetails(id)
  });

  if (isLoading) {
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

  const videoUrl = `https://vidsrc.cc/v2/embed/movie/${content.id}`;

  return (
    <div className="pt-16">
      <VideoPlayer src={videoUrl} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">{content.title || content.name}</h1>
        <div className="flex gap-4 text-sm text-gray-400 mb-6">
          <span>{new Date(content.release_date || content.first_air_date).getFullYear()}</span>
          {content.runtime && <span>{Math.floor(content.runtime / 60)}h {content.runtime % 60}m</span>}
          {content.vote_average && <span>Rating: {content.vote_average.toFixed(1)}</span>}
        </div>
        <p className="text-gray-200 max-w-2xl">{content.overview}</p>
      </div>
    </div>
  );
}
