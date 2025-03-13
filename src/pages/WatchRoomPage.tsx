import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMovieDetails, useTVShowDetails } from "@/hooks/useTMDB";
import { getTMDBImageUrl } from "@/lib/tmdb";
import MainLayout from "@/components/layout/MainLayout";
import VideoPlayer from "@/components/player/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Send,
  Users,
  User,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Copy,
  Clock,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
}

interface Participant {
  name: string;
  lastActive: number;
  id?: string;
}

interface WatchRoomData {
  contentId: string;
  mediaType: "movie" | "tv";
  title: string;
  createdAt: number;
  createdBy: string;
  creatorName: string;
  seasonNumber?: number;
  episodeNumber?: number;
  participants: Record<string, Participant>;
  currentTime?: number;
  isPlaying?: boolean;
}

const MovieInfo = ({ contentId }: { contentId: string }) => {
  const { data: movie, isLoading } = useMovieDetails(contentId);

  if (isLoading || !movie) {
    return <div className="animate-pulse bg-gray-800 h-20 rounded-lg"></div>;
  }

  return (
    <div className="mt-4 bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h2 className="text-lg font-semibold mb-2">About this movie</h2>
      <p className="text-sm text-gray-300 mb-2">{movie.overview}</p>
      <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
        {movie.release_date && (
          <Badge variant="outline">{movie.release_date.substring(0, 4)}</Badge>
        )}
        {movie.runtime && (
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
          </div>
        )}
      </div>
    </div>
  );
};

const TVShowInfo = ({ 
  contentId, 
  season, 
  episode 
}: { 
  contentId: string; 
  season?: number; 
  episode?: number; 
}) => {
  const { data: show, isLoading } = useTVShowDetails(contentId);

  if (isLoading || !show) {
    return <div className="animate-pulse bg-gray-800 h-20 rounded-lg"></div>;
  }

  return (
    <div className="mt-4 bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h2 className="text-lg font-semibold mb-2">About this episode</h2>
      <p className="text-sm text-gray-300 mb-2">{show.overview}</p>
      <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
        {show.first_air_date && (
          <Badge variant="outline">{show.first_air_date.substring(0, 4)}</Badge>
        )}
        {season && episode && (
          <Badge variant="outline">S{season} E{episode}</Badge>
        )}
      </div>
    </div>
  );
};

const WatchRoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, profile } = useAuthContext();
  const { theme } = useTheme();

  const [roomData, setRoomData] = useState<WatchRoomData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomLink, setRoomLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Load room data
  useEffect(() => {
    if (!roomId || !isAuthenticated || !user) return;

    setLoading(true);
    setError(null);

    const roomRef = supabase.from("watchRooms").select().eq("id", roomId);
    roomRef.then((data) => {
      if (data.data && data.data.length > 0) {
        const roomData = data.data[0] as WatchRoomData;
        setRoomData(roomData);
        setIsHost(roomData.createdBy === user.uid);

        // Extract participants
        if (roomData.participants) {
          const participantList = Object.entries(roomData.participants).map(
            ([id, participant]) => ({
              id,
              ...participant,
            }),
          );
          setParticipants(participantList);
        }

        // Update participant status
        if (user) {
          const participantRef = supabase.from("participants").insert({
            userId: user.uid,
            name: profile?.displayName || user.displayName || "Anonymous",
            lastActive: Date.now(),
          }).eq("userId", user.uid);
        }

        setLoading(false);
      } else {
        setError("Watch room not found");
        setLoading(false);
      }
    }).catch((error) => {
      setError(error.message);
      setLoading(false);
    });
  }, [roomId, isAuthenticated, user, profile]);

  // Load chat messages
  useEffect(() => {
    if (!roomId) return;

    const messagesRef = supabase.from("messages").select().eq("roomId", roomId);
    messagesRef.then((data) => {
      if (data.data) {
        const messagesList = data.data.map((message: any) => ({
          id: message.id,
          userId: message.userId,
          userName: message.userName,
          message: message.message,
          timestamp: message.timestamp,
        }));

        // Sort messages by timestamp
        messagesList.sort((a: ChatMessage, b: ChatMessage) => a.timestamp - b.timestamp);
        setChatMessages(messagesList);

        // Scroll to bottom of chat
        setTimeout(() => {
          if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    });
  }, [roomId]);

  // Generate room link
  useEffect(() => {
    if (roomId) {
      setRoomLink(`${window.location.origin}/watch-room/${roomId}`);
    }
  }, [roomId]);

  // Send chat message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !isAuthenticated || !user || !roomId) return;

    const messagesRef = supabase.from("messages").insert({
      userId: user.uid,
      userName: profile?.displayName || user.displayName || "Anonymous",
      message: newMessage.trim(),
      timestamp: Date.now(),
    }).eq("roomId", roomId);

    setNewMessage("");
  };

  // Handle playback controls (host only)
  const updatePlaybackState = (isPlaying: boolean) => {
    if (!isHost || !roomId) return;

    const roomRef = supabase.from("watchRooms").update({
      isPlaying,
    }).eq("id", roomId);
  };

  const updatePlaybackTime = (currentTime: number) => {
    if (!isHost || !roomId) return;

    const roomRef = supabase.from("watchRooms").update({
      currentTime,
    }).eq("id", roomId);
  };

  // Copy room link to clipboard
  const copyRoomLink = () => {
    navigator.clipboard.writeText(roomLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Format time
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Count active participants (active in the last 2 minutes)
  const activeParticipantsCount = participants.filter(
    (participant) => Date.now() - participant.lastActive < 2 * 60 * 1000,
  ).length;

  // Fetch content details
  const { data: movieData, loading: movieLoading } =
    roomData?.mediaType === "movie" && roomData?.contentId
      ? useMovieDetails(parseInt(roomData.contentId))
      : { data: null, loading: false };

  const { data: tvData, loading: tvLoading } =
    roomData?.mediaType === "tv" && roomData?.contentId
      ? useTVShowDetails(parseInt(roomData.contentId))
      : { data: null, loading: false };

  const isContentLoading = movieLoading || tvLoading;
  const contentData = roomData?.mediaType === "movie" ? movieData : tvData;

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-900 text-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center h-[70vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !roomData) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-900 text-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col items-center justify-center h-[70vh]">
              <h2 className="text-2xl font-bold text-red-500 mb-4">
                {error || "Failed to load watch room"}
              </h2>
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-[70vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[70vh]">
              <h2 className="text-2xl font-bold text-red-500 mb-4">
                {error}
              </h2>
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            </div>
          ) : (
            roomData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Video Player Column */}
                <div className="lg:col-span-2">
                  <div className="mb-4 flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(-1)}
                      className="mr-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold truncate flex-1">
                      {roomData.title}
                      {roomData.mediaType === "tv" &&
                        roomData.seasonNumber !== undefined &&
                        roomData.episodeNumber !== undefined && (
                          <span className="ml-2 text-gray-400 text-sm">
                            S{roomData.seasonNumber} E{roomData.episodeNumber}
                          </span>
                        )}
                    </h1>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary"
                      >
                        <Users className="h-3 w-3 mr-1" />
                        {participants.length}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyRoomLink}
                        className="gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        {linkCopied ? "Copied!" : "Share"}
                      </Button>
                    </div>
                  </div>

                  {/* Video Player */}
                  <div className="rounded-lg overflow-hidden bg-black aspect-video mb-4">
                    {roomData.mediaType === "movie" ? (
                      <VideoPlayer
                        key={`movie-${roomData.contentId}`}
                        contentId={roomData.contentId}
                        mediaType="movie"
                      />
                    ) : (
                      <VideoPlayer
                        key={`tv-${roomData.contentId}-${roomData.seasonNumber}-${roomData.episodeNumber}`}
                        contentId={roomData.contentId}
                        mediaType="tv"
                        seasonNumber={roomData.seasonNumber}
                        episodeNumber={roomData.episodeNumber}
                      />
                    )}
                  </div>

                  {!isHost && (
                    <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-md text-yellow-200 text-sm">
                      <p>
                        Only the host ({roomData.creatorName}) can control playback
                        in this room.
                      </p>
                    </div>
                  )}

                  {/* Content details */}
                  {roomData.mediaType === "movie" ? (
                    <MovieInfo contentId={roomData.contentId} />
                  ) : (
                    <TVShowInfo
                      contentId={roomData.contentId}
                      season={roomData.seasonNumber}
                      episode={roomData.episodeNumber}
                    />
                  )}
                </div>

                {/* Chat Column */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden h-[70vh] flex flex-col">
                    <div className="p-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                      <h2 className="font-bold">Watch Party Chat</h2>
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary"
                      >
                        <Users className="h-3 w-3 mr-1" />
                        {participants.length} Online
                      </Badge>
                    </div>

                    {/* Participants */}
                    <div className="p-3 bg-gray-800/50 border-b border-gray-700">
                      <div className="flex gap-1 overflow-x-auto pb-2">
                        {participants.map((participant, index) => (
                          <div
                            key={index}
                            className="flex items-center bg-gray-700 rounded-full px-3 py-1 text-xs whitespace-nowrap"
                          >
                            <User className="h-3 w-3 mr-1" />
                            {participant.name}
                            {roomData.createdBy === participant.id && (
                              <Badge
                                className="ml-1 bg-primary text-primary-foreground text-[10px] px-1"
                                variant="default"
                              >
                                Host
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <ScrollArea className="flex-1 p-3">
                      <div className="space-y-3">
                        {chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex gap-2 ${
                              message.userId === user?.uid
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-2 ${
                                message.userId === user?.uid
                                  ? "bg-primary/20 text-white"
                                  : "bg-gray-700 text-white"
                              }`}
                            >
                              <div className="flex justify-between items-baseline mb-1">
                                <span
                                  className={`font-medium text-xs ${
                                    message.userId === roomData.createdBy
                                      ? "text-primary"
                                      : "text-gray-300"
                                  }`}
                                >
                                  {message.userId === user?.uid
                                    ? "You"
                                    : message.userName}
                                  {message.userId === roomData.createdBy && (
                                    <Badge
                                      className="ml-1 bg-primary/30 text-primary-foreground text-[10px] px-1"
                                      variant="outline"
                                    >
                                      Host
                                    </Badge>
                                  )}
                                </span>
                                <span className="text-[10px] text-gray-400 ml-2">
                                  {formatTimestamp(message.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm break-words">
                                {message.message}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Chat Input */}
                    <div className="p-3 border-t border-gray-700">
                      <form
                        onSubmit={handleSendMessage}
                        className="flex items-center gap-2"
                      >
                        <Input
                          type="text"
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="bg-gray-700 border-gray-600"
                        />
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!newMessage.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default WatchRoomPage;
