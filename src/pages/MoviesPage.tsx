import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import ContentFilters from "@/components/content/ContentFilters";
import ContentGrid from "@/components/content/ContentGrid";
import { usePopularMovies, useContentByGenre } from "@/hooks/useTMDB";
import { getTMDBImageUrl } from "@/lib/tmdb";
import { useAuthContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const MoviesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { theme } = useTheme();
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [activeGenreId, setActiveGenreId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch popular movies
  const {
    data: moviesData,
    loading: moviesLoading,
    loadMore: loadMoreMovies,
    hasMore: hasMoreMovies,
  } = usePopularMovies();

  // Fetch movies by genre if a genre is selected
  const {
    data: genreMoviesData,
    loading: genreMoviesLoading,
    loadMore: loadMoreGenreMovies,
    hasMore: hasMoreGenreMovies,
  } = useContentByGenre("movie", activeGenreId || 0, page);

  // Format movie data for ContentGrid
  const formatMovieData = (movies: any[]) => {
    return movies.map((movie) => ({
      id: movie.id.toString(),
      title: movie.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
      rating: movie.adult ? "R" : "PG-13",
      posterUrl: movie.poster_path
        ? getTMDBImageUrl(movie.poster_path, "poster", "medium")
        : "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80",
      type: "movie" as "movie" | "series",
      mediaType: "movie",
    }));
  };

  // Get the appropriate data based on filters
  const getFilteredContent = () => {
    if (activeGenreId) {
      return genreMoviesData?.results
        ? formatMovieData(genreMoviesData.results)
        : [];
    }
    return moviesData?.results ? formatMovieData(moviesData.results) : [];
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

  // Handle load more
  const handleLoadMore = async () => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      if (activeGenreId) {
        if (hasMoreGenreMovies) {
          await loadMoreGenreMovies();
          setPage((prev) => prev + 1);
        }
      } else {
        if (hasMoreMovies) {
          await loadMoreMovies();
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
  }, [isLoadingMore, activeGenreId, hasMoreMovies, hasMoreGenreMovies]);

  // Handle play click
  const handlePlayClick = (id: string) => {
    navigate(`/watch/${id}/movie`);
  };

  // Handle info click
  const handleInfoClick = (id: string) => {
    navigate(`/details/${id}/movie`);
  };

  return (
    <MainLayout>
      <ContentFilters
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        onGenreSelect={(genreName, genreId) =>
          handleGenreSelect(genreName, genreId)
        }
        activeGenre={activeGenre}
        contentType="movie"
        showGenreFilters={true}
        showFilterTabs={false}
      />

      <ContentGrid
        items={getFilteredContent()}
        isLoading={moviesLoading || genreMoviesLoading}
        filter={activeFilter}
        genre={activeGenre || "all"}
        onPlayClick={handlePlayClick}
        onInfoClick={handleInfoClick}
      />

      {/* Infinite scroll loading indicator */}
      {(hasMoreMovies || hasMoreGenreMovies) && (
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

export default MoviesPage;
