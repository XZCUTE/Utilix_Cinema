// Video server integration for content playback

export interface VideoServer {
  id: string;
  name: string;
  description: string;
  getEmbedUrl: (
    contentId: string,
    mediaType: "movie" | "tv",
    seasonNumber?: number,
    episodeNumber?: number,
  ) => string;
}

export const videoServers: VideoServer[] = [
  {
    id: "vidsrcXyz",
    name: "VidSrc XYZ",
    description: "Best for Series",
    getEmbedUrl: (contentId, mediaType, seasonNumber, episodeNumber) => {
      return `https://vidsrc.xyz/embed/${mediaType}/${contentId}${mediaType === "tv" && seasonNumber && episodeNumber ? `/${seasonNumber}-${episodeNumber}` : ""}`;
    },
  },
  {
    id: "vidsrcCc",
    name: "VidSrc CC",
    description: "Backup server with subtitles",
    getEmbedUrl: (contentId, mediaType, seasonNumber, episodeNumber) => {
      return `https://vidsrc.cc/v2/embed/${mediaType}/${contentId}${mediaType === "tv" && seasonNumber && episodeNumber ? `/${seasonNumber}/${episodeNumber}` : ""}`;
    },
  },
  {
    id: "embedSu",
    name: "Embed.SU",
    description: "Fast loading with multiple qualities",
    getEmbedUrl: (contentId, mediaType, seasonNumber, episodeNumber) => {
      return `https://embed.su/embed/${mediaType}/${contentId}${mediaType === "tv" && seasonNumber && episodeNumber ? `/${seasonNumber}/${episodeNumber}` : ""}`;
    },
  },
  {
    id: "vidlink",
    name: "VidLink",
    description: "High Quality Server",
    getEmbedUrl: (contentId, mediaType, seasonNumber, episodeNumber) => {
      return `https://vidlink.pro/${mediaType}/${contentId}${mediaType === "tv" && seasonNumber && episodeNumber ? `/${seasonNumber}/${episodeNumber}` : ""}`;
    },
  },
  {
    id: "vidsrcIcu",
    name: "VidSrc ICU",
    description: "Reliable server with fast loading times",
    getEmbedUrl: (contentId, mediaType, seasonNumber, episodeNumber) => {
      return `https://vidsrc.icu/embed/${mediaType}/${contentId}${mediaType === "tv" && seasonNumber && episodeNumber ? `/${seasonNumber}/${episodeNumber}` : ""}`;
    },
  },
  {
    id: "autoembed",
    name: "AutoEmbed",
    description: "Auto-selects best available source",
    getEmbedUrl: (contentId, mediaType, seasonNumber, episodeNumber) => {
      return `https://autoembed.cc/${mediaType}/${contentId}${mediaType === "tv" && seasonNumber && episodeNumber ? `/${seasonNumber}/${episodeNumber}` : ""}`;
    },
  },
  {
    id: "vidsrcTo",
    name: "VidSrc.to",
    description: "Latest server with improved stability",
    getEmbedUrl: (contentId, mediaType, seasonNumber, episodeNumber) => {
      return `https://vidsrc.to/embed/${mediaType}/${contentId}${mediaType === "tv" && seasonNumber && episodeNumber ? `/${seasonNumber}/${episodeNumber}` : ""}`;
    },
  },
];

// Function to load video from a specific server
export const loadVideo = (
  contentId: string,
  mediaType: "movie" | "tv",
  serverId: string,
  seasonNumber?: number,
  episodeNumber?: number,
): string => {
  const server = videoServers.find((s) => s.id === serverId);

  if (!server) {
    throw new Error(`Server with ID ${serverId} not found`);
  }

  return server.getEmbedUrl(contentId, mediaType, seasonNumber, episodeNumber);
};

// Function to get a fallback server if the current one fails
export const getFallbackServer = (currentServerId: string): VideoServer => {
  const currentIndex = videoServers.findIndex((s) => s.id === currentServerId);

  if (currentIndex === -1) {
    // If current server not found, return the first server
    return videoServers[0];
  }

  // Return the next server in the list, or the first one if we're at the end
  const nextIndex = (currentIndex + 1) % videoServers.length;
  return videoServers[nextIndex];
};
