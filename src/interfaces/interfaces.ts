import {
  DMChannel,
  GroupDMChannel,
  TextChannel,
  VoiceChannel,
  VoiceConnection,
} from "discord.js";

export interface SpotifyConfig {
  spotifyBearer: string;
  spotifyPlaylistUrl: string;
  spotifyAuthUrl: string;
}

export interface YoutubeConfig {
  youtubeApiKey: string;
}

export interface DiscordConfig {
  discordToken: string;
}

export interface Queue {
  textChannel: TextChannel | DMChannel | GroupDMChannel;
  voiceChannel: VoiceChannel;
  connection?: VoiceConnection;
  songs: Song[];
  volume: number;
  playing: boolean;
}

export interface Song {
  title: string;
  url: string;
}

export interface YoutubeRequestConfig {
  q?: string;
  key: string;
  part: string;
  playlistId?: string;
  maxResults?: number;
  type: string;
  order: string;
}

export interface YoutubeVideoResult {
  kind: string;
  etag: string;
  id: string;
  snippet: Snippet;
}

export interface Snippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: any;
  channelTitle: string;
  playlistId: string;
  position: number;
  resourceId: any;
}

export interface YouTubeSearchResults {
  id: string;
  link: string;
  kind: string;
  publishedAt: string;
  channelTitle: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: YouTubeSearchResultThumbnails;
}

export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YouTubeSearchResultThumbnails {
  default?: YouTubeThumbnail;
  medium?: YouTubeThumbnail;
  high?: YouTubeThumbnail;
  standard?: YouTubeThumbnail;
  maxres?: YouTubeThumbnail;
}
