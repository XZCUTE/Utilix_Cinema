import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Proxy TMDB API calls to avoid CORS issues
  app.get("/api/trending", async (req, res) => {
    const response = await fetch(
      "https://api.themoviedb.org/3/trending/all/day?api_key=43e5f570f85114b7a746c37aa6307b25"
    );
    const data = await response.json();
    res.json(data);
  });

  app.get("/api/movies/popular", async (req, res) => {
    const response = await fetch(
      "https://api.themoviedb.org/3/movie/popular?api_key=43e5f570f85114b7a746c37aa6307b25"
    );
    const data = await response.json();
    res.json(data);
  });

  app.get("/api/tv/popular", async (req, res) => {
    const response = await fetch(
      "https://api.themoviedb.org/3/tv/popular?api_key=43e5f570f85114b7a746c37aa6307b25"
    );
    const data = await response.json();
    res.json(data);
  });

  app.get("/api/content/:id", async (req, res) => {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${req.params.id}?api_key=43e5f570f85114b7a746c37aa6307b25`
    );
    const data = await response.json();
    res.json(data);
  });

  app.get("/api/search", async (req, res) => {
    const query = req.query.q;
    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=43e5f570f85114b7a746c37aa6307b25&query=${query}`
    );
    const data = await response.json();
    res.json(data);
  });

  return httpServer;
}
