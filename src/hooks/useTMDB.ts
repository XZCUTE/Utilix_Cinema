import { useState, useEffect, useCallback } from "react";
import {
  getTrending,
  getPopularMovies,
  getPopularTVShows,
  getMovieDetails,
  getTVShowDetails,
  getTVShowSeasonDetails,
  searchContent,
  getMovieGenres,
  getTVGenres,
  getMoviesByGenre,
  getTVShowsByGenre,
  TMDBMovie,
  TMDBTVShow,
  TMDBGenre,
  TMDBPaginatedResponse,
  TMDBMovieDetails,
  TMDBTVShowDetails,
} from "@/lib/tmdb";

// Hook for fetching trending content
export const useTrending = (
  mediaType: "all" | "movie" | "tv" = "all",
  timeWindow: "day" | "week" = "week",
) => {
  const [data, setData] = useState<TMDBPaginatedResponse<
    TMDBMovie | TMDBTVShow
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getTrending(mediaType, timeWindow);
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mediaType, timeWindow]);

  return { data, loading, error };
};

// Hook for fetching popular movies with pagination
export const usePopularMovies = (initialPage = 1) => {
  const [data, setData] = useState<TMDBPaginatedResponse<TMDBMovie> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);

  const fetchPage = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      const result = await getPopularMovies(pageNum);
      setData((prevData) => {
        if (prevData && pageNum > 1) {
          return {
            ...result,
            results: [...prevData.results, ...result.results],
          };
        }
        return result;
      });
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred"),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(page);
  }, [fetchPage, page]);

  const loadMore = useCallback(() => {
    if (data && page < data.total_pages) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [data, page]);

  return {
    data,
    loading,
    error,
    loadMore,
    hasMore: data ? page < data.total_pages : false,
  };
};

// Hook for fetching popular TV shows with pagination
export const usePopularTVShows = (initialPage = 1) => {
  const [data, setData] = useState<TMDBPaginatedResponse<TMDBTVShow> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);

  const fetchPage = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      const result = await getPopularTVShows(pageNum);
      setData((prevData) => {
        if (prevData && pageNum > 1) {
          return {
            ...result,
            results: [...prevData.results, ...result.results],
          };
        }
        return result;
      });
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred"),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(page);
  }, [fetchPage, page]);

  const loadMore = useCallback(() => {
    if (data && page < data.total_pages) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [data, page]);

  return {
    data,
    loading,
    error,
    loadMore,
    hasMore: data ? page < data.total_pages : false,
  };
};

// Hook for fetching movie details
export const useMovieDetails = (movieId: number) => {
  const [data, setData] = useState<TMDBMovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getMovieDetails(movieId);
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred"),
        );
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchData();
    }
  }, [movieId]);

  return { data, loading, error };
};

// Hook for fetching TV show details
export const useTVShowDetails = (tvId: number) => {
  const [data, setData] = useState<TMDBTVShowDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getTVShowDetails(tvId);
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred"),
        );
      } finally {
        setLoading(false);
      }
    };

    if (tvId) {
      fetchData();
    }
  }, [tvId]);

  return { data, loading, error };
};

// Hook for fetching TV show season details
export const useSeasonDetails = (tvId: number, seasonNumber: number) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getTVShowSeasonDetails(tvId, seasonNumber);
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred"),
        );
      } finally {
        setLoading(false);
      }
    };

    if (tvId && seasonNumber) {
      fetchData();
    }
  }, [tvId, seasonNumber]);

  return { data, loading, error };
};

// Hook for searching content
export const useSearch = (query: string, initialPage = 1) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);

  const fetchPage = useCallback(
    async (pageNum: number, searchQuery: string) => {
      if (!searchQuery.trim()) {
        setData(null);
        return;
      }

      try {
        setLoading(true);
        const result = await searchContent(searchQuery, pageNum);
        setData((prevData) => {
          if (prevData && pageNum > 1) {
            return {
              ...result,
              results: [...prevData.results, ...result.results],
            };
          }
          return result;
        });
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred"),
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    // Reset page when query changes
    setPage(1);

    // Only fetch if there's a query
    if (query.trim()) {
      fetchPage(1, query);
    } else {
      setData(null);
    }
  }, [fetchPage, query]);

  const loadMore = useCallback(() => {
    if (data && page < data.total_pages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPage(nextPage, query);
    }
  }, [data, fetchPage, page, query]);

  return {
    data,
    loading,
    error,
    loadMore,
    hasMore: data ? page < data.total_pages : false,
  };
};

// Hook for fetching genres
export const useGenres = (type: "movie" | "tv" = "movie") => {
  const [data, setData] = useState<TMDBGenre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result =
          type === "movie" ? await getMovieGenres() : await getTVGenres();
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

  return { data, loading, error };
};

// Hook for fetching content by genre with pagination
export const useContentByGenre = (
  type: "movie" | "tv",
  genreId: number,
  initialPage = 1,
) => {
  const [data, setData] = useState<TMDBPaginatedResponse<
    TMDBMovie | TMDBTVShow
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);

  const fetchPage = useCallback(
    async (pageNum: number) => {
      try {
        setLoading(true);
        const result =
          type === "movie"
            ? await getMoviesByGenre(genreId, pageNum)
            : await getTVShowsByGenre(genreId, pageNum);

        setData((prevData) => {
          if (prevData && pageNum > 1) {
            return {
              ...result,
              results: [...prevData.results, ...result.results],
            };
          }
          return result;
        });
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred"),
        );
      } finally {
        setLoading(false);
      }
    },
    [genreId, type],
  );

  useEffect(() => {
    // Reset page when genre or type changes
    setPage(1);
    fetchPage(1);
  }, [fetchPage, genreId, type]);

  const loadMore = useCallback(() => {
    if (data && page < data.total_pages) {
      setPage((prevPage) => prevPage + 1);
      fetchPage(page + 1);
    }
  }, [data, fetchPage, page]);

  return {
    data,
    loading,
    error,
    loadMore,
    hasMore: data ? page < data.total_pages : false,
  };
};

// Hook for fetching similar content
export const useSimilarContent = (id: number, mediaType: 'movie' | 'tv') => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSimilarContent = async () => {
      try {
        setLoading(true);
        console.log(`Fetching similar content for ${mediaType} ID: ${id}`);
        
        let result;
        if (mediaType === 'movie') {
          const movieDetails = await getMovieDetails(id);
          result = movieDetails.similar?.results || [];
        } else {
          const tvDetails = await getTVShowDetails(id);
          result = tvDetails.similar?.results || [];
        }
        
        console.log(`Found ${result.length} similar items for ${mediaType} ID: ${id}`);
        setData(result);
        setError(null);
      } catch (err) {
        console.error(`Error fetching similar ${mediaType} content:`, err);
        setError(err instanceof Error ? err : new Error('Failed to fetch similar content'));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSimilarContent();
    }
  }, [id, mediaType]);

  return { data, loading, error };
};
