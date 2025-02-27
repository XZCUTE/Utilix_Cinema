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
  return tmdbFetch(`/${mediaType}/${id}`);
}

export async function getContentRecommendations(id: string, type?: string): Promise<TMDBSearchResult> {
  const mediaType = type || "movie";
  return tmdbFetch(`/${mediaType}/${id}/recommendations`);
}

export async function searchContent(query: string): Promise<TMDBSearchResult> {
  if (!query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }

  // Search across movies, TV shows, and people
  return tmdbFetch("/search/multi", {
    query: query.trim(),
    include_adult: "false",
    page: "1"
  });
}