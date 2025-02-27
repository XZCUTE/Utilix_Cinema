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
        `https://api.themoviedb.org/3/${type}/${id}?api_key=${TMDB_API_KEY}`
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

      const searchParams = new URLSearchParams({
        api_key: TMDB_API_KEY,
        query: query as string,
        include_adult: "false",
        language: "en-US",
        page: "1"
      });

      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?${searchParams}`
      );
      if (!response.ok) throw new Error("Failed to search content");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to search content" });
    }
  });

  return httpServer;
}