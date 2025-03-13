import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getTrending, getPopularMovies, getPopularTVShows } from "@/lib/tmdb";

interface ContentContextType {
  trendingContent: any[];
  popularMovies: any[];
  popularTVShows: any[];
  featuredContent: any[];
  loadingTrending: boolean;
  loadingMovies: boolean;
  loadingTVShows: boolean;
  refreshContent: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [trendingContent, setTrendingContent] = useState<any[]>([]);
  const [popularMovies, setPopularMovies] = useState<any[]>([]);
  const [popularTVShows, setPopularTVShows] = useState<any[]>([]);
  const [featuredContent, setFeaturedContent] = useState<any[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingTVShows, setLoadingTVShows] = useState(true);

  const fetchContent = async () => {
    try {
      // Fetch trending content
      setLoadingTrending(true);
      const trendingData = await getTrending();
      setTrendingContent(trendingData.results || []);
      setLoadingTrending(false);

      // Fetch popular movies
      setLoadingMovies(true);
      const moviesData = await getPopularMovies();
      setPopularMovies(moviesData.results || []);
      setLoadingMovies(false);

      // Fetch popular TV shows
      setLoadingTVShows(true);
      const tvData = await getPopularTVShows();
      setPopularTVShows(tvData.results || []);
      setLoadingTVShows(false);

      // Set featured content from trending
      if (trendingData.results && trendingData.results.length > 0) {
        // Debug: Check if titles exist in the trending data
        console.log("Trending data title check:", trendingData.results.slice(0, 3).map(item => {
          // Use type assertion to access properties based on presence of media_type
          const anyItem = item as any;
          return {
            id: anyItem.id,
            mediaType: anyItem.media_type || "unknown",
            title: anyItem.media_type === "movie" ? anyItem.title : anyItem.name,
            rawMovie: anyItem.title,
            rawTV: anyItem.name
          };
        }));
        
        // Get top 5 trending items for featured carousel
        const featured = trendingData.results.slice(0, 5).map((item) => {
          // Use type assertion
          const anyItem = item as any;
          
          // Determine if it's a movie or TV show
          const mediaType = anyItem.media_type || '';
          const hasTitle = Boolean(anyItem.title);
          const hasName = Boolean(anyItem.name);
          
          // Better determination of content type
          const isMovie = mediaType === 'movie' || (hasTitle && !hasName);
          
          // Get the appropriate title based on content type
          let itemTitle = '';
          if (isMovie) {
            itemTitle = anyItem.title || '';
          } else {
            itemTitle = anyItem.name || '';
          }
          
          // Add fallback for missing titles
          if (!itemTitle) {
            itemTitle = isMovie ? `Movie #${anyItem.id}` : `TV Show #${anyItem.id}`;
            console.warn(`Missing title for featured ${isMovie ? 'movie' : 'TV show'} ID: ${anyItem.id}`);
          }
          
          // Log for debugging
          console.log("Featured item details:", {
            id: anyItem.id,
            mediaType,
            isMovie,
            finalTitle: itemTitle,
            originalTitle: anyItem.title,
            originalName: anyItem.name
          });
          
          return {
            id: anyItem.id.toString(),
            title: itemTitle,
            description: anyItem.overview || "No description available",
            backdropUrl: `https://image.tmdb.org/t/p/original${anyItem.backdrop_path || ''}`,
            year: isMovie
              ? (anyItem.release_date ? new Date(anyItem.release_date).getFullYear() : new Date().getFullYear())
              : (anyItem.first_air_date ? new Date(anyItem.first_air_date).getFullYear() : new Date().getFullYear()),
            rating: anyItem.adult ? "R" : isMovie ? "PG-13" : "TV-MA",
            genre:
              anyItem.genre_ids && anyItem.genre_ids.length > 0
                ? anyItem.genre_ids[0].toString()
                : "Drama",
            type: isMovie ? "movie" : "series",
            mediaType: anyItem.media_type,
          };
        });
        setFeaturedContent(featured);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const refreshContent = () => {
    fetchContent();
  };

  return (
    <ContentContext.Provider
      value={{
        trendingContent,
        popularMovies,
        popularTVShows,
        featuredContent,
        loadingTrending,
        loadingMovies,
        loadingTVShows,
        refreshContent,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export const useContent = (): ContentContextType => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
};
