import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import ContentGrid from "@/components/content/ContentGrid";
import { usePopularMovies, usePopularTVShows } from "@/hooks/useTMDB";
import { getTMDBImageUrl } from "@/lib/tmdb";
import { Loader } from "lucide-react";

// Define the ContentItem type to match what ContentGrid expects
interface ContentItem {
  id: string;
  title: string;
  year: number | null;
  rating: string;
  posterUrl: string;
  type: "movie" | "series";
  mediaType?: string;
}

const PopularPage = () => {
  const navigate = useNavigate();
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [combinedItems, setCombinedItems] = useState<ContentItem[]>([]);
  
  // Fetch popular movies and TV shows
  const { data: popularMoviesData, loading: moviesLoading } = usePopularMovies();
  const { data: popularTVShowsData, loading: tvShowsLoading } = usePopularTVShows();
  
  // Format movies for the grid
  const formatMovieItems = useCallback((movies: any[]): ContentItem[] => {
    return movies.map((movie) => {
      return {
        id: movie.id.toString(),
        title: movie.title || `Movie #${movie.id}`,
        year: movie.release_date
          ? new Date(movie.release_date).getFullYear()
          : null,
        rating: movie.adult ? "R" : "PG-13",
        posterUrl: getTMDBImageUrl(movie.poster_path, "poster", "medium"),
        type: "movie",
        mediaType: "movie",
      };
    });
  }, []);
  
  // Format TV shows for the grid
  const formatTVShowItems = useCallback((tvShows: any[]): ContentItem[] => {
    return tvShows.map((show) => {
      return {
        id: show.id.toString(),
        title: show.name || `TV Show #${show.id}`,
        year: show.first_air_date
          ? new Date(show.first_air_date).getFullYear()
          : null,
        rating: "TV-14",
        posterUrl: getTMDBImageUrl(show.poster_path, "poster", "medium"),
        type: "series",
        mediaType: "tv",
      };
    });
  }, []);
  
  // Combine and sort popular content
  useEffect(() => {
    if (popularMoviesData?.results && popularTVShowsData?.results) {
      const formattedMovies = formatMovieItems(popularMoviesData.results);
      const formattedTVShows = formatTVShowItems(popularTVShowsData.results);
      
      // Add popularity values to help with sorting
      const moviesWithPopularity = formattedMovies.map((movie, index) => ({
        ...movie,
        popularity: popularMoviesData.results[index].popularity || 0
      }));
      
      const tvShowsWithPopularity = formattedTVShows.map((show, index) => ({
        ...show,
        popularity: popularTVShowsData.results[index].popularity || 0
      }));
      
      // Combine and sort by popularity
      const combined = [...moviesWithPopularity, ...tvShowsWithPopularity]
        .sort((a: any, b: any) => b.popularity - a.popularity)
        .slice(0, 40); // Limit to 40 items total
      
      setCombinedItems(combined);
    }
  }, [popularMoviesData, popularTVShowsData, formatMovieItems, formatTVShowItems]);

  // Handle play click
  const handlePlayClick = (id: string, type?: string) => {
    const mediaType = type || "movie";
    navigate(`/watch/${id}/${mediaType}`);
  };

  // Handle info click
  const handleInfoClick = (id: string, type?: string) => {
    const mediaType = type || "movie";
    navigate(`/details/${id}/${mediaType}`);
  };

  const isLoading = moviesLoading || tvShowsLoading;

  return (
    <MainLayout>
      <div className="py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Popular Content</h1>
        <p className="text-gray-400 mb-8">
          Discover the most popular movies and TV shows that everyone is watching right now.
        </p>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 text-primary animate-spin" />
            <span className="ml-2">Loading popular content...</span>
          </div>
        ) : (
          <ContentGrid
            items={combinedItems}
            filter="popular"
            genre={activeGenre || "all"}
            onPlayClick={(id) => {
              const item = combinedItems.find((item) => item.id === id);
              handlePlayClick(id, item?.mediaType);
            }}
            onInfoClick={(id) => {
              const item = combinedItems.find((item) => item.id === id);
              handleInfoClick(id, item?.mediaType);
            }}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default PopularPage; 