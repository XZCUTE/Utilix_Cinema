import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTMDBImageUrl } from "@/lib/tmdb";
import MainLayout from "@/components/layout/MainLayout";
import ContentCard from "@/components/content/ContentCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Search, Play, Calendar, X, Clock } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useWatchHistory } from "@/context/WatchHistoryContext";
import type { WatchHistoryItem } from "@/lib/firebase";

// Custom Spinner component
const Spinner = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`animate-spin rounded-full border-4 border-t-transparent ${className || ''}`}
      {...props}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading</span>
    </div>
  );
};

// Define tab types
type TabValue = "all" | "movies" | "tvshows";

// Extend WatchHistoryItem to include the type property
interface ExtendedWatchHistoryItem extends WatchHistoryItem {
  type?: "movie" | "series"; // Made optional as we'll compute it when needed
}

const WatchHistoryPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthContext();
  const { theme } = useTheme();
  const { historyItems, loading, refreshHistory, isOffline, error } = useWatchHistory();

  // UI state
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Filter by search query
  const filterBySearchQuery = (item: WatchHistoryItem) => {
    if (!searchQuery) return true;
    return item.title.toLowerCase().includes(searchQuery.toLowerCase());
  };

  // Get filtered items based on active tab and search query
  const getFilteredItems = () => {
    let filtered = historyItems ? [...historyItems] : [];
    
    // Debug watch history items
    console.log("Watch history items:", historyItems);
    
    // Filter by type
    if (activeTab === "movies") {
      filtered = filtered.filter(item => item.mediaType === "movie");
    } else if (activeTab === "tvshows") {
      filtered = filtered.filter(item => item.mediaType === "tv");
    }
    
    // Filter by search query
    return filtered.filter(filterBySearchQuery);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshHistory();
    } catch (err) {
      console.error("Error refreshing watch history:", err);
      } finally {
      setIsRefreshing(false);
    }
  };

  // Get poster URL
  const getPosterUrl = async (path: string | undefined): Promise<string> => {
    console.log('getPosterUrl called with path:', path);
    
    if (!path) {
      console.log('No poster path provided, using placeholder');
      return '/images/placeholder.jpg'; // Use local placeholder image
    }

    try {
      // Clean the path
      const cleanPath = path.trim();
      const formattedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
      
      console.log('Cleaned path:', cleanPath);
      console.log('Formatted path:', formattedPath);
      
      // Try to get TMDB URL
      const tmdbUrl = getTMDBImageUrl(formattedPath);
      console.log('Generated TMDB URL:', tmdbUrl);
      
      return tmdbUrl;
    } catch (error) {
      console.error('Error generating TMDB URL:', error);
      return '/images/placeholder.jpg'; // Use local placeholder image
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Format progress for display
  const formatProgress = (progress?: number) => {
    if (progress === undefined) return "Not started";
    if (progress >= 0.95) return "Completed";
    return `${Math.round(progress * 100)}%`;
  };

  // Count items by type
  const movieCount = historyItems ? historyItems.filter(item => item.mediaType === "movie").length : 0;
  const tvCount = historyItems ? historyItems.filter(item => item.mediaType === "tv").length : 0;
  const totalCount = historyItems ? historyItems.length : 0;

  // Render content
  const renderContent = () => {
    // If loading, show loading spinner
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner className="w-12 h-12 mb-4" />
          <p className="text-gray-400">Loading your watch history...</p>
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
              ? "Your watch history is empty. Start watching some content to see it here."
              : activeTab === "movies"
              ? "You haven't watched any movies yet."
              : "You haven't watched any TV shows yet."}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filteredItems.map((item) => (
          <div 
            key={`${item.id}-${item.mediaType}`} 
            className="bg-card rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer"
            onClick={() => navigate(`/details/${item.id}/${item.mediaType}`)}
          >
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <Calendar className="h-4 w-4" />
                <span>{item.watchedAt ? new Date(item.watchedAt).getFullYear() : 'N/A'}</span>
                <span>•</span>
                <span>{item.mediaType === 'tv' ? 'TV Show' : 'Movie'}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <Clock className="h-4 w-4" />
                <span>Watched: {formatDate(item.watchedAt)}</span>
              </div>
              {item.progress !== undefined && (
                <div className="flex items-center gap-2">
                  <Progress value={item.progress * 100} className="h-1" />
                  <span className="text-sm text-muted-foreground">{formatProgress(item.progress)}</span>
                </div>
              )}
              {item.mediaType === "tv" && item.currentSeason && item.currentEpisode && (
                <span className="text-sm text-muted-foreground">
                  Season {item.currentSeason}, Episode {item.currentEpisode}
                                    </span>
                                  )}
                              </div>
                            </div>
        ))}
                              </div>
    );
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Watch History</h1>
            <p className="text-gray-400 mt-1">Your recently watched movies and TV shows</p>
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
                All ({totalCount})
              </TabsTrigger>
              <TabsTrigger value="movies">
                Movies ({movieCount})
              </TabsTrigger>
              <TabsTrigger value="tvshows">
                TV Shows ({tvCount})
              </TabsTrigger>
            </TabsList>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search history..."
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

export default WatchHistoryPage;
