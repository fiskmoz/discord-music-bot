import {
  Client,
  DMChannel,
  GroupDMChannel,
  Message,
  TextChannel,
} from "discord.js";
import { Dice } from "./Dice";
import {
  DiscordConfig,
  Song,
  YoutubeVideoResult,
} from "./interfaces/interfaces";
import { MusicQueue } from "./MusicQueue";
import { Spotify } from "./Spotify";
import { Youtube } from "./Youtube";

export class DiscordBot {
  private config: DiscordConfig;
  private static instance: DiscordBot;
  private client: Client = new Client();
  private dice: Dice = new Dice();
  private musicQueue = new MusicQueue();
  private spotify = new Spotify();
  private youtube = new Youtube();

  private constructor() {
    try {
      this.config = require("../config.json");
    } catch (exception) {
      this.config = {
        discordToken: !!process.env.discordToken
          ? process.env.discordToken
          : "",
      } as DiscordConfig;
    }
    this.initializeCient();
  }

  static getInstance(): DiscordBot {
    if (!DiscordBot.instance) {
      DiscordBot.instance = new DiscordBot();
    }
    return DiscordBot.instance;
  }

  connect(): void {
    this.client
      .login(this.config.discordToken)
      .then((_) => console.log("Connected to Discord"))
      .catch((error) =>
        console.error(`Could not connect. Error: ${error.message}`)
      );
  }

  private initializeCient(): void {
    if (!this.client) return;

    this.setReadyHandler();
    this.setMessageHandler();
  }

  private setReadyHandler(): void {
    this.client.on("ready", () => {
      console.log(`Logged in as ${this.client.user.tag}!`);
    });
  }

  private setMessageHandler(): void {
    this.client.on("message", async (message: Message) => {
      //* filters out requests from bots
      if (message.author.bot) return;
      if (!message.content.startsWith("!")) return;
      switch (message.content.split(" ")[0]) {
        case "!play":
          this.handlePlay(message);
          break;
        case "!skip":
          this.musicQueue.skip(message);
          break;
        case "!stop":
          this.musicQueue.stopPlaying(message.member.guild.id);
          break;
        case "!pause":
          this.musicQueue.pause(message);
          break;
        case "!resume":
          this.musicQueue.resume(message);
          break;
        case "!current":
          this.musicQueue.current(message);
          break;
        case "!list":
          this.musicQueue.list(message);
          break;
        case "!spotify":
          this.handleSpotify(message.content.split(" ").slice(1), message);
          break;
        case "!ytsearch":
          this.handleSearchyt(message.content.split(" ").slice(1), message);
          break;
        case "!ytplaylist":
          this.handlePlaylistyt(message.content.split(" ").slice(1), message);
          break;
        case "!roll":
          this.handleDieRoll(
            message.content.split(" ").slice(1),
            message.channel
          );
          break;
        default:
          message.channel.send("Invalid command");
          break;
      }
    });
  }
  // DATA IS FOLLOWING STRUCTURE //
  /* [!cmd, arg1, arg2, ...] */

  private handlePlay(message: Message): void {
    if (!this.ensureInVoiceChannel(message)) return;
    this.musicQueue.playMusic(
      message.member.guild.id,
      message,
      message.content.split(" ")[1]
    );
  }

  private async handleSpotify(data: string[], message: Message): Promise<void> {
    let playlistLink = data[0];
    if (!!playlistLink) {
      let playListId = playlistLink.split("/").slice(-1).pop();
      if (!!playListId) {
        let tracks = await this.spotify.getPlaylist(playListId);
        for (const track of tracks) {
          const res = await this.youtube.searchYoutube(
            track["track"]["artists"][0]["name"] +
              " - " +
              track["track"]["name"]
          );
          const song = { title: res.title, url: res.link };
          !tracks.indexOf(track)
            ? this.musicQueue.playMusic(
                message.member.guild.id,
                message,
                res.link,
                song
              )
            : this.musicQueue.addSongToQueue(message.member.guild.id, song);
        }
        return;
      }
      console.log("Failed to parse spotify Id");
    }
    console.log("No valid spotify link provided");
  }

  private async handleSearchyt(
    data: string[],
    message: Message
  ): Promise<void> {
    let searchTags = data;
    if (!!searchTags) {
      const result = await this.youtube.searchYoutube(searchTags.join(" "));
      this.musicQueue.playMusic(message.member.guild.id, message, result.link, {
        title: result.title,
        url: result.link,
      } as Song);
      return;
    }
  }

  private async handlePlaylistyt(
    data: string[],
    message: Message
  ): Promise<void> {
    let link = data[0];
    const id = link.split("=")[1];
    if (!!id) {
      const result = await this.youtube.getPlaylist(id);
      result.forEach((v: YoutubeVideoResult, index: number) => {
        const song = {
          title: v.snippet.title,
          url:
            "https://www.youtube.com/watch?v=" + v.snippet.resourceId.videoId,
        } as Song;
        !!index
          ? this.musicQueue.addSongToQueue(message.member.guild.id, song)
          : this.musicQueue.playMusic(
              message.member.guild.id,
              message,
              "https://www.youtube.com/watch?v=" + v.snippet.resourceId.videoId,
              song
            );
      });
      return;
    }
  }

  private handleDieRoll(
    data: string[],
    channel: TextChannel | DMChannel | GroupDMChannel
  ): void {
    const num = parseInt(data[0]);
    if (!num) return console.log("invalid number");
    const roll = this.dice.getDieRoll(num);
    channel.send("You rolled: " + roll.toString());
  }

  private ensureInVoiceChannel(message: Message): boolean {
    const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) {
      message.channel.send("You need to be in a voice channel to play music!");
      return false;
    }
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (
      !permissions ||
      !permissions.has("CONNECT") ||
      !permissions.has("SPEAK")
    ) {
      message.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
      return false;
    }
    return true;
  }
}
