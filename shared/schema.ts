import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const contentItems = pgTable("content_items", {
  id: serial("id").primaryKey(),
  tmdbId: integer("tmdb_id").notNull(),
  type: text("type").notNull(), // movie, tv, anime
  title: text("title").notNull(),
  overview: text("overview").notNull(),
  posterPath: text("poster_path"),
  backdropPath: text("backdrop_path"),
  releaseDate: text("release_date"),
  rating: text("rating"),
  metadata: jsonb("metadata").$type<{
    genres?: string[];
    runtime?: number;
    seasons?: number;
  }>(),
});

export const contentItemSchema = createInsertSchema(contentItems);

export type ContentItem = typeof contentItems.$inferSelect;
export type InsertContentItem = typeof contentItems.$inferInsert;

export interface TMDBSearchResult {
  page: number;
  results: TMDBContent[];
  total_pages: number;
  total_results: number;
}

export interface TMDBContent {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type?: string;
}
