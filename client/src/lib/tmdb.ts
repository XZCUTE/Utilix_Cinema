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

export async function searchContent(query: string): Promise<TMDBSearchResult> {
  if (!query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }

  // Search across movies, TV shows, and people with better params
  const [moviesRes, tvRes] = await Promise.all([
    tmdbFetch("/search/movie", { query: query.trim() }),
    tmdbFetch("/search/tv", { query: query.trim() })
  ]);

  // Combine and deduplicate results
  const results = [
    ...moviesRes.results.map((item: any) => ({ ...item, media_type: 'movie' })),
    ...tvRes.results.map((item: any) => ({ ...item, media_type: 'tv' }))
  ];

  return {
    page: 1,
    results,
    total_pages: Math.max(moviesRes.total_pages, tvRes.total_pages),
    total_results: results.length
  };
}