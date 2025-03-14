import React, { useState } from "react";
import { useSeasonDetails } from "@/hooks/useTMDB";
import { getTMDBImageUrl } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Loader, Play, Calendar, Star } from "lucide-react";

interface EpisodeSelectorProps {
  tvId: number;
  seasons: Array<{
    season_number: number;
    name: string;
    episode_count: number;
  }>;
  currentSeason: number;
  currentEpisode: number;
  onEpisodeSelect: (seasonNumber: number, episodeNumber: number) => void;
}

const EpisodeSelector = ({
  tvId,
  seasons,
  currentSeason,
  currentEpisode,
  onEpisodeSelect,
}: EpisodeSelectorProps) => {
  const [selectedSeason, setSelectedSeason] = useState(currentSeason);

  const {
    data: seasonData,
    loading,
    error,
  } = useSeasonDetails(tvId, selectedSeason);

  const handleSeasonChange = (season: string) => {
    setSelectedSeason(parseInt(season));
  };

  const handleEpisodeSelect = (episodeNumber: number) => {
    onEpisodeSelect(selectedSeason, episodeNumber);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-card rounded-lg overflow-hidden border border-border">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold">Episodes</h3>
      </div>

      <Tabs
        defaultValue={selectedSeason.toString()}
        onValueChange={handleSeasonChange}
      >
        <div className="px-4 pt-2">
          <ScrollArea className="max-w-full">
            <TabsList className="inline-flex w-auto h-9 bg-muted/50 p-1">
              {seasons.map((season) => (
                <TabsTrigger
                  key={season.season_number}
                  value={season.season_number.toString()}
                  className="px-3 py-1.5 text-sm"
                >
                  {season.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </div>

        <TabsContent value={selectedSeason.toString()} className="mt-0">
          <ScrollArea className="h-[400px] p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader className="h-8 w-8 text-primary animate-spin" />
                <span className="ml-2 text-muted-foreground">Loading episodes...</span>
              </div>
            ) : error ? (
              <div className="text-center text-muted-foreground py-8">
                Failed to load episodes. Please try again.
              </div>
            ) : (
              <div className="space-y-4">
                {seasonData?.episodes?.map((episode: any) => (
                  <div
                    key={episode.id}
                    className={`flex gap-3 p-2 rounded-lg transition-colors ${currentSeason === selectedSeason && currentEpisode === episode.episode_number ? "bg-primary/20" : "hover:bg-muted/50"}`}
                  >
                    <div className="flex-shrink-0 w-32 h-20 relative rounded overflow-hidden bg-muted">
                      {episode.still_path ? (
                        <img
                          src={getTMDBImageUrl(
                            episode.still_path,
                            "backdrop",
                            "small",
                          )}
                          alt={episode.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                          No Image
                        </div>
                      )}
                      <Button
                        size="icon"
                        className="absolute inset-0 m-auto opacity-0 hover:opacity-100 bg-black/70 hover:bg-primary/80 transition-opacity"
                        onClick={() =>
                          handleEpisodeSelect(episode.episode_number)
                        }
                      >
                        <Play className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium truncate">
                          {episode.episode_number}. {episode.name}
                        </h4>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Star className="h-3 w-3 mr-1 text-yellow-500" />
                          {episode.vote_average.toFixed(1)}
                        </div>
                      </div>

                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(episode.air_date)}
                      </div>

                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {episode.overview || "No description available."}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant={
                        currentSeason === selectedSeason &&
                        currentEpisode === episode.episode_number
                          ? "default"
                          : "ghost"
                      }
                      className="self-center flex-shrink-0"
                      onClick={() =>
                        handleEpisodeSelect(episode.episode_number)
                      }
                    >
                      <Play className="h-4 w-4 mr-1" />
                      {currentSeason === selectedSeason &&
                      currentEpisode === episode.episode_number
                        ? "Playing"
                        : "Play"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EpisodeSelector;
