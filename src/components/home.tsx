import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import HeroCarousel from "./hero/HeroCarousel";
import ContentFilters from "./content/ContentFilters";
import ContentGrid from "./content/ContentGrid";
import { useAuthContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useContent } from "@/context/ContentContext";
import { getTMDBImageUrl } from "@/lib/tmdb";
import { Loader, Film, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { theme } = useTheme();
  const [activeFilter, setActiveFilter] = useState("popular");
  const [activeGenre, setActiveGenre] = useState("all");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  // Get content from context
  const {
    featuredContent,
    trendingContent,
    popularMovies,
    popularTVShows,
    loadingTrending,
    refreshContent,
  } = useContent();

  // Format content items for the grid
  const formatContentItems = (items: any[]) => {
    return items.map((item) => {
      // Determine if item is a movie based on media_type or other properties
      const mediaType = item.media_type || ''; 
      const hasTitle = Boolean(item.title);
      const hasName = Boolean(item.name);
      
      // More reliable way to determine if it's a movie
      // If it has a title property, it's likely a movie
      // If it has a name property but no title, it's likely a TV show
      const isMovie = mediaType === 'movie' || (hasTitle && !mediaType);
      
      // Extract the correct title field based on content type
      // For movies, use 'title'; for TV shows, use 'name'
      let itemTitle = '';
      if (isMovie) {
        itemTitle = item.title || '';
      } else {
        itemTitle = item.name || '';
      }
      
      // If still no title, use a placeholder with ID
      if (!itemTitle) {
        itemTitle = isMovie ? `Movie #${item.id}` : `TV Show #${item.id}`;
        console.warn(`Missing title for ${isMovie ? 'movie' : 'TV show'} ID: ${item.id}`);
      }
      
      // Log detailed info for debugging
      console.log("Content item details:", { 
        id: item.id, 
        mediaType,
        hasTitle,
        hasName,
        isMovie, 
        finalTitle: itemTitle,
        originalTitle: item.title,
        originalName: item.name,
        rawData: item
      });
      
      return {
        id: item.id.toString(),
        title: itemTitle,
        year: isMovie
          ? item.release_date
            ? new Date(item.release_date).getFullYear()
            : 2023
          : item.first_air_date
            ? new Date(item.first_air_date).getFullYear()
            : 2023,
        rating: item.adult ? "R" : isMovie ? "PG-13" : "TV-14",
        posterUrl: getTMDBImageUrl(item.poster_path, "poster", "medium"),
        type: isMovie ? "movie" : "series" as "movie" | "series",
        mediaType: item.media_type || (isMovie ? "movie" : "tv"),
      };
    });
  };

  // Filter content based on active filter and genre
  const getFilteredContent = () => {
    let filteredItems = [];

    if (activeFilter === "popular") {
      // Convert popular movies to formatted items with explicit type indicators
      const formattedMovies = popularMovies.map(movie => ({
        ...movie,
        media_type: "movie"  // Ensure media_type is set
      }));
      
      // Convert popular TV shows to formatted items with explicit type indicators
      const formattedTVShows = popularTVShows.map(tvShow => ({
        ...tvShow,
        media_type: "tv"  // Ensure media_type is set
      }));
      
      // Combine and sort by popularity
      filteredItems = [...formattedMovies, ...formattedTVShows]
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 20);
    } else if (activeFilter === "trending") {
      filteredItems = trendingContent;
    } else if (activeFilter === "top_rated") {
      // Sort by vote average for top rated
      filteredItems = [...popularMovies, ...popularTVShows]
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 20);
    }

    // Apply genre filter if selected
    if (selectedGenres.length > 0) {
      // In a real implementation, we would filter by genre ID
      // This is a simplified version
      return formatContentItems(filteredItems.slice(0, 10));
    }

    return formatContentItems(filteredItems);
  };

  // Handler functions
  const handlePlayClick = (id: string, type?: string) => {
    const mediaType = type || "movie";
    navigate(`/watch/${id}/${mediaType}`);
  };

  const handleInfoClick = (id: string, type?: string) => {
    const mediaType = type || "movie";
    navigate(`/details/${id}/${mediaType}`);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleGenreSelect = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
    setActiveGenre(genre);
  };

  // Refresh content when component mounts
  useEffect(() => {
    refreshContent();
  }, []);

  const contentItems = getFilteredContent();

  return (
    <MainLayout>
      {/* Hero Section - Full Width */}
      {featuredContent.length > 0 ? (
        <HeroCarousel
          items={featuredContent}
          onPlayClick={(id) => {
            const item = featuredContent.find((item) => item.id === id);
            handlePlayClick(id, item?.mediaType || item?.type);
          }}
          onInfoClick={(id) => {
            const item = featuredContent.find((item) => item.id === id);
            handleInfoClick(id, item?.mediaType || item?.type);
          }}
        />
      ) : (
        <div className="h-[500px] bg-card flex items-center justify-center">
          <Loader className="h-10 w-10 text-primary animate-spin" />
        </div>
      )}
      
      {/* Content Section with Padding */}
      <div className="px-6 py-8">
        {/* Content Filters - Updated to use the three main filter options */}
        <ContentFilters
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          onGenreSelect={handleGenreSelect}
          showGenreFilters={false}
        />

        {/* Content Grid */}
        {loadingTrending && contentItems.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 text-primary animate-spin" />
            <span className="ml-2">Loading content...</span>
          </div>
        ) : (
          <ContentGrid
            items={contentItems}
            filter={activeFilter}
            genre={activeGenre}
            onPlayClick={(id) => {
              const item = contentItems.find((item) => item.id === id);
              handlePlayClick(id, item?.mediaType || item?.type);
            }}
            onInfoClick={(id) => {
              const item = contentItems.find((item) => item.id === id);
              handleInfoClick(id, item?.mediaType || item?.type);
            }}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Home;
