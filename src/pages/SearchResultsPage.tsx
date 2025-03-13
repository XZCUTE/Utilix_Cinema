import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import ContentCard from "@/components/content/ContentCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Loader, Search as SearchIcon } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useSearch } from "@/hooks/useTMDB";
import { getTMDBImageUrl } from "@/lib/tmdb";

const SearchResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthContext();
  const { theme } = useTheme();

  // Get search query from URL
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState("all");

  // Search for content
  const {
    data: searchResults,
    loading: searchLoading,
    loadMore,
    hasMore,
  } = useSearch(searchQuery);

  // Update search when URL changes
  useEffect(() => {
    const query = queryParams.get("q") || "";
    setSearchQuery(query);
  }, [location.search]);

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Filter results based on active filter
  const filteredResults = searchResults?.results.filter((item) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "movies") return item.media_type === "movie";
    if (activeFilter === "series") return item.media_type === "tv";
    if (activeFilter === "people") return item.media_type === "person";
    return true;
  });

  // Handle content click
  const handleContentClick = (id: string, type: "movie" | "tv") => {
    navigate(`/watch/${id}/${type}`);
  };

  // Handle play click
  const handlePlayClick = (id: string, type: "movie" | "tv") => {
    navigate(`/watch/${id}/${type}`);
  };

  // Handle info click
  const handleInfoClick = (id: string, type: "movie" | "tv") => {
    navigate(`/details/${id}/${type}`);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Search Results</h1>

          <form onSubmit={handleSearchSubmit} className="max-w-2xl">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search for movies, TV shows, or people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border-gray-700 pl-10 pr-4 py-2"
              />
              <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Button
                type="submit"
                className="absolute right-1 top-1"
                size="sm"
              >
                Search
              </Button>
            </div>
          </form>
        </div>

        <div className="mb-6">
          <Tabs
            defaultValue={activeFilter}
            onValueChange={setActiveFilter}
            className="w-full md:w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="movies">Movies</TabsTrigger>
              <TabsTrigger value="series">TV Shows</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {searchLoading && !searchResults ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 text-primary animate-spin" />
            <span className="ml-2">Searching...</span>
          </div>
        ) : (
          <>
            {searchQuery && (
              <p className="text-gray-400 mb-6">
                {filteredResults?.length || 0} results for "{searchQuery}"
              </p>
            )}

            {filteredResults && filteredResults.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredResults.map((item) => {
                    // Skip person results for now
                    if (item.media_type === "person") return null;

                    const mediaType = item.media_type as "movie" | "tv";
                    const title =
                      mediaType === "movie" ? item.title : item.name;
                    const year =
                      mediaType === "movie"
                        ? new Date(item.release_date).getFullYear()
                        : new Date(item.first_air_date).getFullYear();

                    return (
                      <ContentCard
                        key={item.id}
                        id={item.id.toString()}
                        title={title}
                        year={year || 0}
                        rating={
                          item.adult
                            ? "R"
                            : mediaType === "movie"
                              ? "PG-13"
                              : "TV-14"
                        }
                        posterUrl={getTMDBImageUrl(
                          item.poster_path,
                          "poster",
                          "medium",
                        )}
                        type={mediaType === "movie" ? "movie" : "series"}
                        onClick={() =>
                          handleContentClick(item.id.toString(), mediaType)
                        }
                        onPlayClick={() =>
                          handlePlayClick(item.id.toString(), mediaType)
                        }
                        onInfoClick={() =>
                          handleInfoClick(item.id.toString(), mediaType)
                        }
                      />
                    );
                  })}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={() => loadMore()}
                      disabled={searchLoading}
                      className="gap-2"
                    >
                      {searchLoading ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : null}
                      Load More
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                {searchQuery ? (
                  <>
                    <p className="text-gray-400 mb-4">
                      No results found for "{searchQuery}"
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Try adjusting your search or filter to find what you're
                      looking for
                    </p>
                    <Button onClick={() => navigate("/")}>
                      Browse Content
                    </Button>
                  </>
                ) : (
                  <p className="text-gray-400">
                    Enter a search term to find movies, TV shows, and more
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default SearchResultsPage;
