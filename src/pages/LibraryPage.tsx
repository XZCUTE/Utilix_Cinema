import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import ContentCard from "@/components/content/ContentCard";
import { useLibrary } from "@/context/LibraryContext";
import { useAuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Search, X } from "lucide-react";
import { getTMDBImageUrl } from "@/lib/tmdb";
import { Spinner } from "@/components/ui/spinner";

// Define tab types
type TabValue = "all" | "movies" | "tvshows";

const LibraryPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthContext();
  const { libraryItems, loading, error, refreshLibrary } = useLibrary();

  // UI state
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
  };

  // Filter by search query
  const filterBySearchQuery = (item: any) => {
    if (!searchQuery) return true;
    return item.title.toLowerCase().includes(searchQuery.toLowerCase());
  };

  // Get filtered items based on active tab and search query
  const getFilteredItems = () => {
    let filtered = [];
    
    switch (activeTab) {
      case "movies":
        filtered = libraryItems.movies.map(item => ({ ...item, type: "movie" as const }));
        break;
      case "tvshows":
        filtered = libraryItems.series.map(item => ({ ...item, type: "series" as const }));
        break;
      default:
        filtered = [
          ...libraryItems.movies.map(item => ({ ...item, type: "movie" as const })),
          ...libraryItems.series.map(item => ({ ...item, type: "series" as const }))
        ];
    }
    
    return filtered.filter(filterBySearchQuery);
  };
  
  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshLibrary();
    } catch (error) {
      console.error("Error refreshing library:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Get poster URL
  const getPosterUrl = (path: string | null) => {
    if (!path) return "https://via.placeholder.com/300x450?text=No+Poster";
    return getTMDBImageUrl(path, "poster", "medium");
  };

  // Render content
  const renderContent = () => {
    // If loading, show loading spinner
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner className="w-12 h-12 mb-4" />
          <p className="text-gray-400">Loading your library...</p>
        </div>
      );
    }
    
    // If error, show error message
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 mb-4">Error: {error.message}</div>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      );
    }
    
    // If no items, show empty state
    const filteredItems = getFilteredItems();
    if (filteredItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-400 mb-4">
            {searchQuery
              ? "No items match your search query."
              : activeTab === "all"
              ? "Your library is empty. Add some movies or TV shows to get started."
              : activeTab === "movies"
              ? "You don't have any movies in your library yet."
              : "You don't have any TV shows in your library yet."}
          </p>
          {searchQuery ? (
            <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
          ) : (
            <Button onClick={() => navigate("/")}>Browse Content</Button>
          )}
        </div>
      );
    }
    
    // Render grid of content cards
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
        {filteredItems.map((item) => (
          <ContentCard
            key={`${item.id}-${item.type}`}
            id={item.id}
            title={item.title}
            year={item.addedAt ? new Date(item.addedAt).getFullYear() : undefined}
            posterUrl={getPosterUrl(item.posterPath)}
            type={item.type}
            isInLibrary={true}
            onPlayClick={() => 
              item.type === "movie" 
                ? navigate(`/watch/${item.id}/movie`) 
                : navigate(`/watch/${item.id}/tv/1/1`)
            }
            onInfoClick={() => 
              navigate(`/details/${item.id}/${item.type}`)
            }
          />
        ))}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Library</h1>
            <p className="text-gray-400 mt-1">Your saved movies and TV shows</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="all" onValueChange={handleTabChange}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="all">
                All ({libraryItems.movies.length + libraryItems.series.length})
              </TabsTrigger>
              <TabsTrigger value="movies">
                Movies ({libraryItems.movies.length})
              </TabsTrigger>
              <TabsTrigger value="tvshows">
                TV Shows ({libraryItems.series.length})
              </TabsTrigger>
            </TabsList>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-[250px]"
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-100"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </Tabs>

        {renderContent()}
      </div>
    </MainLayout>
  );
};

export default LibraryPage; 