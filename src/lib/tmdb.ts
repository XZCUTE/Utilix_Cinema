// TMDB API integration

const TMDB_API_KEY = "43e5f570f85114b7a746c37aa6307b25";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export const TMDB_IMAGE_SIZES = {
  poster: {
    small: "w185",
    medium: "w342",
    large: "w500",
    original: "original",
  },
  backdrop: {
    small: "w300",
    medium: "w780",
    large: "w1280",
    original: "original",
  },
  profile: {
    small: "w45",
    medium: "w185",
    large: "h632",
    original: "original",
  },
};

// Helper function to build image URLs
export const getTMDBImageUrl = (
  path: string | null,
  type: "poster" | "backdrop" | "profile" = "poster",
  size: "small" | "medium" | "large" | "original" = "medium",
): string => {
  if (!path) return "";
  return `${TMDB_IMAGE_BASE_URL}/${TMDB_IMAGE_SIZES[type][size]}${path}`;
};

// Types for API responses
export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  media_type?: string;
  popularity?: number;
}

export interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  media_type?: string;
  popularity?: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  episode_number: number;
  season_number: number;
  vote_average: number;
}

export interface TMDBSeason {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  air_date: string;
  season_number: number;
  episode_count: number;
}

export interface TMDBTVShowDetails extends TMDBTVShow {
  seasons: TMDBSeason[];
  number_of_seasons: number;
  number_of_episodes: number;
  genres: TMDBGenre[];
  status: string;
  type: string;
  created_by: {
    id: number;
    name: string;
    profile_path: string | null;
  }[];
  similar?: {
    results: TMDBTVShow[];
    page: number;
    total_pages: number;
    total_results: number;
  };
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
      profile_path: string | null;
    }[];
  };
}

export interface TMDBMovieDetails extends TMDBMovie {
  budget: number;
  revenue: number;
  runtime: number;
  status: string;
  tagline: string;
  genres: TMDBGenre[];
  production_companies: {
    id: number;
    name: string;
    logo_path: string | null;
  }[];
  similar?: {
    results: TMDBMovie[];
    page: number;
    total_pages: number;
    total_results: number;
  };
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
      profile_path: string | null;
    }[];
  };
}

// API functions

// Get trending movies and TV shows
export const getTrending = async (
  mediaType: "all" | "movie" | "tv" = "all",
  timeWindow: "day" | "week" = "week",
) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/${mediaType}/${timeWindow}?api_key=${TMDB_API_KEY}&language=en-US`,
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data: TMDBPaginatedResponse<TMDBMovie | TMDBTVShow> =
      await response.json();
    
    // Enhanced logging for debugging
    console.log("TMDB Trending API - Raw Response Sample:", {
      endpoint: `trending/${mediaType}/${timeWindow}`,
      total_results: data.total_results,
      total_pages: data.total_pages,
      sample_items: data.results.slice(0, 2).map(item => ({
        id: (item as any).id,
        media_type: (item as any).media_type,
        title_field: (item as any).title,
        name_field: (item as any).name,
        is_movie: (item as any).media_type === 'movie',
        poster_path: (item as any).poster_path,
      }))
    });
    
    return data;
  } catch (error) {
    console.error("Error fetching trending content:", error);
    throw error;
  }
};

// Get popular movies
export const getPopularMovies = async (page = 1) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`,
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data: TMDBPaginatedResponse<TMDBMovie> = await response.json();
    
    // Add media_type to each movie for consistency
    data.results = data.results.map(movie => ({
      ...movie,
      media_type: "movie" // Explicitly set media_type for all movies
    }));
    
    // Log sample data for debugging
    console.log("TMDB Popular Movies - Raw Response Sample:", {
      endpoint: 'movie/popular',
      total_results: data.total_results,
      sample_items: data.results.slice(0, 2).map(item => ({
        id: item.id,
        title_field: item.title,
        has_title: Boolean(item.title),
        poster_path: item.poster_path,
        media_type: item.media_type
      }))
    });
    
    return data;
  } catch (error) {
    console.error("Error fetching popular movies:", error);
    throw error;
  }
};

// Get popular TV shows
export const getPopularTVShows = async (page = 1) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`,
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data: TMDBPaginatedResponse<TMDBTVShow> = await response.json();
    
    // Add media_type to each TV show for consistency
    data.results = data.results.map(tvShow => ({
      ...tvShow,
      media_type: "tv" // Explicitly set media_type for all TV shows
    }));
    
    // Log sample data for debugging
    console.log("TMDB Popular TV Shows - Raw Response Sample:", {
      endpoint: 'tv/popular',
      total_results: data.total_results,
      sample_items: data.results.slice(0, 2).map(item => ({
        id: item.id,
        name_field: item.name,
        has_name: Boolean(item.name),
        poster_path: item.poster_path,
        media_type: item.media_type
      }))
    });
    
    return data;
  } catch (error) {
    console.error("Error fetching popular TV shows:", error);
    throw error;
  }
};

// Get movie details
export const getMovieDetails = async (movieId: number) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,videos,similar`,
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data: TMDBMovieDetails = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching movie details for ID ${movieId}:`, error);
    throw error;
  }
};

// Get TV show details
export const getTVShowDetails = async (tvId: number) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,videos,similar`,
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data: TMDBTVShowDetails = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching TV show details for ID ${tvId}:`, error);
    throw error;
  }
};

// Get TV show season details
export const getTVShowSeasonDetails = async (
  tvId: number,
  seasonNumber: number,
) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}&language=en-US`,
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      `Error fetching season ${seasonNumber} details for TV show ID ${tvId}:`,
      error,
    );
    throw error;
  }
};

// Search for movies and TV shows
export const searchContent = async (
  query: string,
  page = 1,
  includeAdult = false,
) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${page}&include_adult=${includeAdult}`,
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error searching for "${query}":`, error);
    throw error;
  }
};

// Get movie genres
export const getMovieGenres = async () => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`,
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data: { genres: TMDBGenre[] } = await response.json();
    return data.genres;
  } catch (error) {
    console.error("Error fetching movie genres:", error);
    throw error;
  }
};

// Get TV show genres
export const getTVGenres = async () => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}&language=en-US`,
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data: { genres: TMDBGenre[] } = await response.json();
    return data.genres;
  } catch (error) {
    console.error("Error fetching TV genres:", error);
    throw error;
  }
};

// Get movies by genre
export const getMoviesByGenre = async (genreId: number, page = 1) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&with_genres=${genreId}&page=${page}`,
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data: TMDBPaginatedResponse<TMDBMovie> = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching movies for genre ID ${genreId}:`, error);
    throw error;
  }
};

// Get TV shows by genre
export const getTVShowsByGenre = async (genreId: number, page = 1) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&with_genres=${genreId}&page=${page}`,
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data: TMDBPaginatedResponse<TMDBTVShow> = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching TV shows for genre ID ${genreId}:`, error);
    throw error;
  }
};
