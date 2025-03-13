import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMovieDetails, useTVShowDetails } from "@/hooks/useTMDB";
import { getTMDBImageUrl } from "@/lib/tmdb";
import MainLayout from "@/components/layout/MainLayout";
import VideoPlayer from "@/components/player/VideoPlayer";
import EpisodeSelector from "@/components/player/EpisodeSelector";
import RelatedContent from "@/components/player/RelatedContent";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Star,
  Plus,
  Share,
  Users,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useLibrary } from "@/context/LibraryContext";
import { useWatchHistory } from "@/context/WatchHistoryContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Toast } from "@/components/ui/toast";
import WatchRoomButton from "@/components/player/WatchRoomButton";

// Format runtime (for movies)
const formatRuntime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const VideoPlayerPage = () => {
  const { id, type, season, episode } = useParams<{
    id: string;
    type: string;
    season?: string;
    episode?: string;
  }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthContext();
  const { theme } = useTheme();
  const { addItem, isInLibrary, libraryItems } = useLibrary();
  const { addItem: addToHistory, updateProgress } = useWatchHistory();
  const { isFullyConnected: isOnline } = useOnlineStatus();

  const [focusMode, setFocusMode] = useState(false);
  const [currentSeason, setCurrentSeason] = useState(parseInt(season || "1"));
  const [currentEpisode, setCurrentEpisode] = useState(
    parseInt(episode || "1"),
  );

  const [showShareToast, setShowShareToast] = useState(false);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [showOfflineToast, setShowOfflineToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  const mediaType = type === "movie" ? "movie" : "tv";
  const contentId = id || "";

  // Log route parameters for debugging
  useEffect(() => {
    console.log("VideoPlayerPage params:", {
      id,
      type,
      season,
      episode,
      parsedSeason: currentSeason,
      parsedEpisode: currentEpisode,
    });
  }, [id, type, season, episode, currentSeason, currentEpisode]);

  // Fetch content details
  const {
    data: movieData,
    loading: movieLoading,
    error: movieError,
  } = mediaType === "movie"
    ? useMovieDetails(parseInt(contentId))
    : { data: null, loading: false, error: null };

  const {
    data: tvData,
    loading: tvLoading,
    error: tvError,
  } = mediaType === "tv"
    ? useTVShowDetails(parseInt(contentId))
    : { data: null, loading: false, error: null };

  const isLoading = movieLoading || tvLoading;
  const error = movieError || tvError;
  const contentData = mediaType === "movie" ? movieData : tvData;

  // Get content title based on media type
  const contentTitle = mediaType === "movie" 
    ? movieData?.title 
    : tvData?.name;

  // Get content year
  const contentYear = mediaType === "movie"
    ? movieData?.release_date
      ? new Date(movieData.release_date).getFullYear()
      : null
    : tvData?.first_air_date
      ? new Date(tvData.first_air_date).getFullYear()
      : null;

  // Get content duration (for movies)
  const contentDuration = mediaType === "movie" && movieData?.runtime
    ? formatRuntime(movieData.runtime)
    : null;

  // Get content rating
  const contentRating = contentData?.vote_average
    ? contentData.vote_average.toFixed(1)
    : null;

  // Get content overview
  const contentOverview = contentData?.overview || "No description available.";

  // Get genres
  const genres = contentData?.genres?.map((genre: any) => genre.name) || [];

  // Get cast - handle potential absence of credits property
  const cast = contentData?.credits?.cast?.map((person: any) => person.name) || [];

  // Handle episode selection
  const handleEpisodeSelect = (seasonNumber: number, episodeNumber: number) => {
    console.log("Episode selected:", seasonNumber, episodeNumber);
    setCurrentSeason(seasonNumber);
    setCurrentEpisode(episodeNumber);
    navigate(`/watch/${contentId}/tv/${seasonNumber}/${episodeNumber}`);
  };

  // Improved check for items in library that works with the new structure
  const checkIsInLibrary = (itemId: string, mediaType: "movie" | "tv"): boolean => {
    const items = mediaType === "movie" ? libraryItems.movies : libraryItems.series;
    return items.some(item => item.id === itemId);
  };

  // Handle add to library
  const handleAddToLibrary = async () => {
    try {
      if (!isOnline) {
        setShowOfflineToast(true);
        setTimeout(() => setShowOfflineToast(false), 3000);
        return;
      }

      if (!contentId || !mediaType || !contentTitle) {
        console.error("Missing required data for adding to library");
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 3000);
        return;
      }

      await addItem({
        id: contentId,
        mediaType: mediaType as "movie" | "tv",
        title: contentTitle,
        posterPath: contentData.poster_path,
      });

      setShowAddedToast(true);
      setTimeout(() => setShowAddedToast(false), 3000);
    } catch (error) {
      console.error("Error adding to library:", error);
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    }
  };

  // Update watch history on play
  const handlePlayStart = () => {
    if (!isAuthenticated || !user || !contentData) return;

    try {
      addToHistory({
        id: contentId,
        mediaType,
        title: mediaType === "movie" 
          ? movieData?.title 
          : tvData?.name,
        posterPath: contentData.poster_path,
        progress: 0,
        currentSeason: mediaType === "tv" ? currentSeason : undefined,
        currentEpisode: mediaType === "tv" ? currentEpisode : undefined,
      });
    } catch (error) {
      console.error("Error adding to watch history:", error);
    }
  };

  // Update watch progress
  const handleProgressUpdate = (progress: number) => {
    if (!isAuthenticated || !user || !contentData) return;

    try {
      updateProgress(contentId, {
        progress,
        currentSeason: mediaType === "tv" ? currentSeason : undefined,
        currentEpisode: mediaType === "tv" ? currentEpisode : undefined,
      });
    } catch (error) {
      console.error("Error updating watch progress:", error);
    }
  };

  // Get poster URL
  const getPosterUrl = () => {
    if (!contentData?.poster_path) return "https://via.placeholder.com/300x450?text=No+Poster";
    return getTMDBImageUrl(contentData.poster_path, "poster", "medium");
  };

  // Share functionality
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  // Debug content data for movie player issues
  useEffect(() => {
    if (mediaType === "movie" && movieData) {
      console.log("Movie data loaded:", {
        id: movieData.id,
        title: movieData.title,
        hasData: Boolean(movieData),
      });
    }
  }, [mediaType, movieData]);

  return (
    <MainLayout>
      {/* Video Player Section */}
      <div className={`w-full ${focusMode ? "h-screen bg-black" : ""}`}>
        <VideoPlayer
          contentId={contentId}
          mediaType={mediaType}
          seasonNumber={mediaType === "tv" ? currentSeason : undefined}
          episodeNumber={mediaType === "tv" ? currentEpisode : undefined}
          title={contentTitle || ""}
          onFocusMode={() => setFocusMode(!focusMode)}
        />
      </div>

      {/* Content Details */}
      {!focusMode && (
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          {/* Content Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Poster and Actions */}
            <div className="md:col-span-1">
              <img
                src={getPosterUrl()}
                alt={contentTitle || "Content"}
                className="w-full rounded-lg shadow-lg"
              />

              <div className="mt-4 flex flex-col gap-2">
                      <Button
                        variant="outline"
                  className="w-full"
                  onClick={handleShare}
                      >
                  <Share className="mr-2 h-4 w-4" /> Share
                      </Button>

                      <WatchRoomButton
                        contentId={contentId}
                        mediaType={mediaType}
                  title={contentTitle || "Content"}
                />
                    </div>
                  </div>

            {/* Right Column - Details and Episodes */}
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold mb-2">{contentTitle}</h1>

              {/* Metadata */}
              <div className="flex flex-wrap gap-3 mb-4">
                {contentYear && (
                  <Badge variant="outline" className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" /> {contentYear}
                  </Badge>
                )}
                {contentDuration && (
                  <Badge variant="outline" className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" /> {contentDuration}
                  </Badge>
                )}
                {contentRating && (
                  <Badge variant="outline" className="flex items-center">
                    <Star className="mr-1 h-3 w-3" /> {contentRating}
                  </Badge>
                )}
                {genres.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
                </div>

              {/* Overview */}
              <p className="text-gray-400 mb-6">{contentOverview}</p>

              {/* Episode Selector for TV Shows */}
              {mediaType === "tv" && tvData?.seasons && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Episodes</h2>
                    <EpisodeSelector
                      tvId={parseInt(contentId)}
                      seasons={tvData.seasons}
                      currentSeason={currentSeason}
                      currentEpisode={currentEpisode}
                      onEpisodeSelect={handleEpisodeSelect}
                    />
                  </div>
                )}

              {/* Cast */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Cast</h2>
                <div className="flex flex-wrap gap-2">
                  {cast.slice(0, 10).map((actor, index) => (
                    <Badge key={index} variant="outline">
                      <Users className="mr-1 h-3 w-3" /> {actor}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Related Content */}
              {contentData && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">
                    More Like This
                  </h2>
                  <RelatedContent
                    id={parseInt(contentId)}
                    mediaType={mediaType}
                    onPlayClick={(id, type) => navigate(`/watch/${id}/${type}`)}
                    onInfoClick={(id, type) => navigate(`/details/${id}/${type}`)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Share Toast */}
          {showShareToast && (
            <div className="fixed bottom-6 right-6 bg-card text-card-foreground border border-border px-4 py-2 rounded-md shadow-lg">
              Link copied to clipboard!
            </div>
          )}

          {/* Toast Notifications */}
          {showAddedToast && (
            <Toast variant="default">
              <p>Added to your library!</p>
            </Toast>
          )}

          {showOfflineToast && (
            <Toast variant="destructive">
              <AlertTriangle className="mr-2 h-4 w-4" />
              <p>You're offline. Please connect to add to library.</p>
            </Toast>
          )}

          {showErrorToast && (
            <Toast variant="destructive">
              <p>Failed to add to library. Please try again.</p>
            </Toast>
          )}
        </div>
      )}
    </MainLayout>
  );
};

export default VideoPlayerPage;
