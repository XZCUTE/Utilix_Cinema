import type { TMDBSearchResult } from "@shared/schema";

const TMDB_API_KEY = "43e5f570f85114b7a746c37aa6307b25";
const BASE_URL = "https://api.themoviedb.org/3";

async function tmdbFetch(endpoint: string, params?: Record<string, string>): Promise<any> {
  const searchParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: "en-US",
    include_adult: "false",
    ...params
  });

  const res = await fetch(`${BASE_URL}${endpoint}?${searchParams}`);
  if (!res.ok) throw new Error("Failed to fetch from TMDB");
  return res.json();
}

export async function searchContent(query: string): Promise<TMDBSearchResult> {
  if (!query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }

  // Search across movies and TV shows
  const [moviesRes, tvRes] = await Promise.all([
    tmdbFetch("/search/movie", { query }),
    tmdbFetch("/search/tv", { query })
  ]);

  // Combine results and add media_type
  const results = [
    ...moviesRes.results.map((item: any) => ({ ...item, media_type: "movie" })),
    ...tvRes.results.map((item: any) => ({ ...item, media_type: "tv" }))
  ];

  return {
    page: 1,
    results,
    total_pages: Math.max(moviesRes.total_pages, tvRes.total_pages),
    total_results: results.length
  };
}

export async function getTrending(): Promise<TMDBSearchResult> {
  return tmdbFetch("/trending/all/day");
}

export async function getPopularMovies(): Promise<TMDBSearchResult> {
  return tmdbFetch("/movie/popular");
}

export async function getPopularTVShows(): Promise<TMDBSearchResult> {
  return tmdbFetch("/tv/popular");
}

export async function getContentDetails(id: string, type?: string): Promise<any> {
  const mediaType = type || "movie";
  return tmdbFetch(`/${mediaType}/${id}`, {
    append_to_response: "videos,credits"
  });
}

export async function getContentRecommendations(id: string, type?: string): Promise<TMDBSearchResult> {
  const mediaType = type || "movie";
  return tmdbFetch(`/${mediaType}/${id}/recommendations`);
}

// New anime-specific functions
export async function getTrendingAnime(): Promise<TMDBSearchResult> {
  // Using animation genre_id=16 to filter anime content
  return tmdbFetch("/discover/tv", {
    with_genres: "16",
    sort_by: "popularity.desc",
    with_original_language: "ja"
  });
}

export async function getPopularAnime(): Promise<TMDBSearchResult> {
  return tmdbFetch("/discover/tv", {
    with_genres: "16",
    sort_by: "vote_count.desc",
    with_original_language: "ja"
  });
}

export async function getTopRatedAnime(): Promise<TMDBSearchResult> {
  return tmdbFetch("/discover/tv", {
    with_genres: "16",
    sort_by: "vote_average.desc",
    "vote_count.gte": "100", //Fixed typo here
    with_original_language: "ja"
  });
}

export async function getSeasonalAnime(): Promise<TMDBSearchResult> {
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 3, 0);

  return tmdbFetch("/discover/tv", {
    with_genres: "16",
    "air_date.gte": firstDay.toISOString().split('T')[0],
    "air_date.lte": lastDay.toISOString().split('T')[0],
    with_original_language: "ja",
    sort_by: "popularity.desc"
  });
}