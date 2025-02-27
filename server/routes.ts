import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);
  const TMDB_API_KEY = "43e5f570f85114b7a746c37aa6307b25";

  // Proxy TMDB API calls to avoid CORS issues
  app.get("/api/trending", async (req, res) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_API_KEY}`
      );
      if (!response.ok) throw new Error("Failed to fetch trending content");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trending content" });
    }
  });

  app.get("/api/movies/popular", async (req, res) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}`
      );
      if (!response.ok) throw new Error("Failed to fetch popular movies");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch popular movies" });
    }
  });

  app.get("/api/tv/popular", async (req, res) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}`
      );
      if (!response.ok) throw new Error("Failed to fetch popular TV shows");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch popular TV shows" });
    }
  });

  app.get("/api/content/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const type = req.query.type || "movie";

      const response = await fetch(
        `https://api.themoviedb.org/3/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits`
      );
      if (!response.ok) throw new Error(`Failed to fetch ${type} details`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content details" });
    }
  });

  app.get("/api/content/:id/recommendations", async (req, res) => {
    try {
      const { id } = req.params;
      const type = req.query.type || "movie";

      const response = await fetch(
        `https://api.themoviedb.org/3/${type}/${id}/recommendations?api_key=${TMDB_API_KEY}`
      );
      if (!response.ok) throw new Error("Failed to fetch recommendations");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      // Make multiple search requests to cover movies, TV shows and anime
      const [moviesRes, tvRes, multiRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${query}&include_adult=false`),
        fetch(`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${query}&include_adult=false`),
        fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${query}&include_adult=false`)
      ]);

      const [movies, tv, multi] = await Promise.all([
        moviesRes.json(),
        tvRes.json(),
        multiRes.json()
      ]);

      // Combine and deduplicate results
      const results = [...movies.results, ...tv.results, ...multi.results]
        .filter((item, index, self) => 
          index === self.findIndex((t) => t.id === item.id)
        )
        .map(item => ({
          ...item,
          media_type: item.media_type || (item.first_air_date ? 'tv' : 'movie')
        }));

      res.json({
        page: 1,
        results,
        total_pages: Math.max(movies.total_pages, tv.total_pages, multi.total_pages),
        total_results: results.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to search content" });
    }
  });

  return httpServer;
}