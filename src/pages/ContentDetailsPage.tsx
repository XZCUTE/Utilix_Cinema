import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { useMovieDetails, useTVShowDetails } from "@/hooks/useTMDB";
import { getTMDBImageUrl } from "@/lib/tmdb";
import { useAuthContext } from "@/context/AuthContext";
import { useLibrary } from "@/context/LibraryContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Play, 
  Calendar, 
  Clock, 
  Star, 
  Plus, 
  Check, 
  Info, 
  Film, 
  Users, 
  Tag, 
  AlertTriangle 
} from "lucide-react";
import { Toast } from "@/components/ui/toast";

interface ContentData {
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  vote_average?: number;
  genres?: Array<{ name: string }>;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  credits?: {
    cast?: Array<{ name: string }>;
    crew?: Array<{ name: string; job: string }>;
  };
  videos?: {
    results?: Array<any>;
  };
}

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

const ContentDetailsPage = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthContext();
  const { addItem, removeItem, isInLibrary, refreshLibrary } = useLibrary();
  const { isOnline } = useOnlineStatus();

  // UI state
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [showOfflineToast, setShowOfflineToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Content type and ID
  const mediaType = type === "movie" ? "movie" : "tv";
  const contentId = id || "";

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
  const contentData = (mediaType === "movie" ? movieData : tvData) as ContentData;

  // Content details
  const contentTitle = mediaType === "movie" ? movieData?.title : tvData?.name;
  const releaseDate = mediaType === "movie" ? movieData?.release_date : tvData?.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const runtime = mediaType === "movie" && movieData?.runtime ? formatRuntime(movieData.runtime) : null;
  const rating = contentData?.vote_average ? contentData.vote_average.toFixed(1) : null;
  const genres = contentData?.genres?.map((genre: any) => genre.name) || [];
  const overview = contentData?.overview || "No description available.";
  const posterPath = contentData?.poster_path;
  const backdropPath = contentData?.backdrop_path;

  // TV show specific data
  const numberOfSeasons = tvData?.number_of_seasons;
  const numberOfEpisodes = tvData?.number_of_episodes;
  const status = contentData?.status;

  // Cast & crew
  const cast = contentData?.credits?.cast?.slice(0, 10)?.map((person: any) => person.name) || [];
  const director = contentData?.credits?.crew?.find((person: any) => person.job === "Director")?.name;
  const producers = contentData?.credits?.crew?.filter((person: any) => person.job === "Producer").map((producer: any) => producer.name) || [];

  // Debug information
  useEffect(() => {
    console.log("ContentDetailsPage loaded:", {
      id: contentId,
      type: mediaType,
      title: contentTitle,
      inLibrary: isInLibrary(contentId, mediaType as "movie" | "tv")
    });
  }, [contentId, mediaType, contentTitle, isInLibrary]);

  // Handle adding/removing from library
  const handleLibraryAction = async () => {
    try {
      console.log("Library action clicked for:", {contentId, mediaType, title: contentTitle});
      
      if (!isOnline) {
        console.log("User is offline, showing offline toast");
        setShowOfflineToast(true);
        setTimeout(() => setShowOfflineToast(false), 3000);
        return;
      }

      if (!contentId || !mediaType || !contentTitle) {
        console.error("Missing required data for library action:", {contentId, mediaType, title: contentTitle});
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 3000);
        return;
      }

      // Check if the item is already in the library
      const inLibrary = isInLibrary(contentId, mediaType as "movie" | "tv");
      console.log("Is item in library?", inLibrary);
      
      if (inLibrary) {
        // If it's in the library, remove it
        console.log("Removing item from library:", contentId, mediaType);
        await removeItem(contentId, mediaType as "movie" | "tv");
        console.log("Removed from library:", contentTitle);
      } else {
        // Otherwise add it
        console.log("Adding item to library:", {
          id: contentId,
          mediaType,
          title: contentTitle,
          posterPath
        });
        
        await addItem({
          id: contentId,
          mediaType: mediaType as "movie" | "tv",
          title: contentTitle,
          posterPath: posterPath || null,
        });
        
        // Show success toast
        setShowAddedToast(true);
        setTimeout(() => setShowAddedToast(false), 3000);
        console.log("Added to library:", contentTitle);
      }
      
      // Refresh library to update UI
      console.log("Refreshing library");
      await refreshLibrary();
      console.log("Library refreshed, inLibrary now:", isInLibrary(contentId, mediaType as "movie" | "tv"));
    } catch (error) {
      console.error("Error with library action:", error);
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    }
  };

  // Handle play button click
  const handlePlayClick = () => {
    if (mediaType === "movie") {
      navigate(`/watch/${contentId}/movie`);
    } else {
      navigate(`/watch/${contentId}/tv/1/1`); // Default to season 1, episode 1
    }
  };

  // Get poster URL
  const getPosterUrl = () => {
    if (!posterPath) return "https://via.placeholder.com/300x450?text=No+Poster";
    return getTMDBImageUrl(posterPath, "poster", "medium");
  };

  // Get backdrop URL
  const getBackdropUrl = () => {
    if (!backdropPath) return "";
    return getTMDBImageUrl(backdropPath, "backdrop", "large");
  };

  return (
    <MainLayout>
      {/* Hero section with backdrop */}
      <div 
        className="relative bg-cover bg-center bg-no-repeat h-[400px] md:h-[500px]" 
        style={{ 
          backgroundImage: backdropPath ? `url(${getBackdropUrl()})` : undefined,
          backgroundPosition: "top center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        
        {/* Content */}
        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8 relative z-10">
          <Button
            variant="outline"
            size="sm"
            className="absolute top-4 left-4 bg-black/60 hover:bg-black/80"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            {contentTitle}
            {year && <span className="text-2xl text-gray-400 ml-3">({year})</span>}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {rating && (
              <Badge variant="secondary" className="flex items-center bg-amber-600/20 border-amber-500/40 text-amber-400">
                <Star className="mr-1 h-4 w-4 fill-amber-400 text-amber-400" /> {rating}
              </Badge>
            )}
            {runtime && (
              <div className="flex items-center text-gray-400">
                <Clock className="mr-1 h-4 w-4" /> {runtime}
              </div>
            )}
            {releaseDate && (
              <div className="flex items-center text-gray-400">
                <Calendar className="mr-1 h-4 w-4" /> {formatDate(releaseDate)}
              </div>
            )}
            {status && (
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                {status}
              </Badge>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {genres.map((genre, index) => (
              <Badge key={index} variant="outline" className="border-primary/50">
                {genre}
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-3 mt-2">
            <Button
              onClick={handlePlayClick}
              className="gap-2"
              size="lg"
            >
              <Play className="h-5 w-5" /> 
              {mediaType === "movie" ? "Watch Movie" : "Watch Episodes"}
            </Button>
            
            {/* Calculate the library status once to ensure consistency */}
            {(() => {
              const inLibrary = isInLibrary(contentId, mediaType as "movie" | "tv");
              console.log("Button render - is in library?", inLibrary, {contentId, mediaType});
              return (
                <Button 
                  variant="outline" 
                  size="lg"
                  className={`gap-2 ${inLibrary ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`} 
                  onClick={handleLibraryAction}
                  disabled={isLoading}
                >
                  {inLibrary ? (
                    <>
                      <Check className="h-5 w-5" /> In Library
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" /> Add to Library
                    </>
                  )}
                </Button>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Content details */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Left Column - Poster and basic info */}
          <div className="md:col-span-1">
            <img 
              src={getPosterUrl()} 
              alt={contentTitle || "Content poster"}
              className="w-full rounded-lg shadow-lg"
            />
            
            <div className="mt-6 space-y-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div>
                <h3 className="text-gray-400 font-medium mb-1">Type</h3>
                <p>{mediaType === "movie" ? "Movie" : "TV Series"}</p>
              </div>
              
              {mediaType === "tv" && (
                <>
                  <div>
                    <h3 className="text-gray-400 font-medium mb-1">Seasons</h3>
                    <p>{numberOfSeasons}</p>
                  </div>
                  <div>
                    <h3 className="text-gray-400 font-medium mb-1">Episodes</h3>
                    <p>{numberOfEpisodes}</p>
                  </div>
                </>
              )}
              
              {director && (
                <div>
                  <h3 className="text-gray-400 font-medium mb-1">Director</h3>
                  <p>{director}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Tabs with details */}
          <div className="md:col-span-3">
            <Tabs defaultValue="overview" onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {mediaType === "tv" && <TabsTrigger value="episodes">Episodes</TabsTrigger>}
                <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
                {contentData?.videos?.results?.length > 0 && (
                  <TabsTrigger value="videos">Videos</TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                  <p className="text-gray-300 leading-relaxed">{overview}</p>
                </div>
                
                {/* Additional details could go here */}
              </TabsContent>
              
              <TabsContent value="episodes">
                <h2 className="text-2xl font-semibold mb-4">Episodes</h2>
                {/* Episode selection would go here */}
                <p className="text-gray-400">
                  Select an episode to watch from the player screen.
                </p>
                <Button
                  onClick={handlePlayClick}
                  className="mt-4 gap-2"
                >
                  <Play className="h-4 w-4" /> 
                  Watch Episodes
                </Button>
              </TabsContent>
              
              <TabsContent value="cast">
                <h2 className="text-2xl font-semibold mb-4">Cast & Crew</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {cast.map((actor, index) => (
                    <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-gray-400" />
                        <span>{actor}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="videos">
                <h2 className="text-2xl font-semibold mb-4">Videos</h2>
                {/* Videos would go here */}
                <p className="text-gray-400">
                  Trailers and clips coming soon.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
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
    </MainLayout>
  );
};

export default ContentDetailsPage; 