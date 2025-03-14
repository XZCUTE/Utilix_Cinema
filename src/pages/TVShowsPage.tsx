import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import ContentFilters from "@/components/content/ContentFilters";
import ContentGrid from "@/components/content/ContentGrid";
import { usePopularTVShows, useContentByGenre } from "@/hooks/useTMDB";
import { getTMDBImageUrl } from "@/lib/tmdb";
import { useAuthContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const TVShowsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { theme } = useTheme();
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [activeGenreId, setActiveGenreId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch popular TV shows
  const {
    data: tvShowsData,
    loading: tvShowsLoading,
    loadMore: loadMoreTVShows,
    hasMore: hasMoreTVShows,
  } = usePopularTVShows();

  // Fetch TV shows by genre if a genre is selected
  const {
    data: genreTVShowsData,
    loading: genreTVShowsLoading,
    loadMore: loadMoreGenreTVShows,
    hasMore: hasMoreGenreTVShows,
  } = useContentByGenre("tv", activeGenreId || 0, page);

  // Format TV show data for ContentGrid
  const formatTVShowData = (tvShows: any[]) => {
    return tvShows.map((show) => ({
      id: show.id.toString(),
      title: show.name,
      year: show.first_air_date
        ? new Date(show.first_air_date).getFullYear()
        : 0,
      rating: "TV-MA",
      posterUrl: show.poster_path
        ? getTMDBImageUrl(show.poster_path, "poster", "medium")
        : "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80",
      type: "series" as "movie" | "series",
      mediaType: "tv",
    }));
  };

  // Get the appropriate data based on filters
  const getFilteredContent = () => {
    if (activeGenreId) {
      return genreTVShowsData?.results
        ? formatTVShowData(genreTVShowsData.results)
        : [];
    }
    return tvShowsData?.results ? formatTVShowData(tvShowsData.results) : [];
  };

  // Handle filter changes
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  // Handle genre selection
  const handleGenreSelect = (genreName: string, genreId: number) => {
    if (activeGenre === genreName) {
      // Deselect genre
      setActiveGenre(null);
      setActiveGenreId(null);
    } else {
      // Select genre
      setActiveGenre(genreName);
      setActiveGenreId(genreId);
      setPage(1); // Reset page when changing genre
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Navigate to the main search page
      navigate(`/search?q=${encodeURIComponent(query)}`);
    } else {
      setSearchQuery("");
    }
  };

  // Handle load more
  const handleLoadMore = async () => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      if (activeGenreId) {
        if (hasMoreGenreTVShows) {
          await loadMoreGenreTVShows();
          setPage((prev) => prev + 1);
        }
      } else {
        if (hasMoreTVShows) {
          await loadMoreTVShows();
        }
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isLoadingMore, activeGenreId, hasMoreTVShows, hasMoreGenreTVShows]);

  // Handle play click
  const handlePlayClick = (id: string) => {
    navigate(`/watch/${id}/tv`);
  };

  // Handle info click
  const handleInfoClick = (id: string) => {
    navigate(`/details/${id}/tv`);
  };

  return (
    <MainLayout>
      <ContentFilters
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        onGenreSelect={(genreName, genreId) =>
          handleGenreSelect(genreName, genreId)
        }
        onSearch={handleSearch}
        searchQuery={searchQuery}
        activeGenre={activeGenre}
        contentType="tv"
        showGenreFilters={true}
        showFilterTabs={false}
      />

      <ContentGrid
        items={getFilteredContent()}
        isLoading={tvShowsLoading || genreTVShowsLoading}
        filter={activeFilter}
        genre={activeGenre || "all"}
        onPlayClick={handlePlayClick}
        onInfoClick={handleInfoClick}
      />

      {/* Infinite scroll loading indicator */}
      {(hasMoreTVShows || hasMoreGenreTVShows) && (
        <div
          ref={loadMoreRef}
          className="flex justify-center items-center py-8"
        >
          {isLoadingMore ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mr-2"></div>
              <span>Loading more...</span>
            </div>
          ) : (
            <div className="h-8"></div> // Invisible element for intersection observer
          )}
        </div>
      )}
    </MainLayout>
  );
};

export default TVShowsPage;
