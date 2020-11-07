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
