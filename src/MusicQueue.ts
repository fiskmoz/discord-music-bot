import { Message } from "discord.js";
import { Queue, Song } from "./interfaces/interfaces";
import { Youtube } from "./Youtube";

export class MusicQueue {
  private serverQueues = new Map<string, Queue>();
  private youtube = new Youtube();

  constructor() {}

  public async playMusic(
    guildId: string,
    message: Message,
    url: string,
    song?: Song
  ): Promise<void> {
    if (!song) {
      const songInfo = await this.youtube.getBasicInfo(url);
      if (!songInfo)
        return console.log("cannot fetch from youtube at the moment");
      song = {
        title: songInfo.player_response.videoDetails.title,
        url: url,
      };
    }
    if (!song) {
      console.log("cannot get basic informatio from youtube by url, ydtl");
      return;
    }
    this.initQueue(message);
    this.addSongToQueue(guildId, song);
    let queue = this.serverQueues.get(guildId);
    if (!!queue) {
      if (!queue.connection) {
        console.log("Establishing new voice channel connection");
        try {
          var connection = await queue.voiceChannel.join();
          queue.connection = connection;
          this.playSong(guildId, queue.songs[0]);
        } catch (e: any) {
          console.log(e);
        }
      } else {
        message.channel.send("Added " + song.title + " to the queue");
      }
    }
  }

  public addSongToQueue(guildId: string, song: Song): void {
    let queue = this.serverQueues.get(guildId);
    if (!!queue) {
      queue.songs.push(song);
    }
  }

  public playSong(guildId: string, song: Song): void {
    const queue = this.serverQueues.get(guildId);
    if (!!queue) {
      if (!!queue.connection) {
        const dispatcher = queue.connection
          .playStream(this.youtube.getStream(song.url))
          .on("end", (reason: string) => {
            queue.songs.shift();
            if (!!queue.songs.length) {
              this.playSong(guildId, queue.songs[0]);
            } else {
              this.stopPlaying(guildId);
            }
          })
          .on("error", (error: Error) => {
            console.log(error);
          });
        dispatcher.setVolumeLogarithmic(queue.volume / 5);
      }
    }
  }

  public stopPlaying(guildId: string): void {
    const queue = this.serverQueues.get(guildId);
    if (!!queue) {
      queue.voiceChannel.leave();
      this.serverQueues.delete(guildId);
    }
  }

  public skip(message: Message) {
    if (!message.member.voiceChannel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
    const queue = this.serverQueues.get(message.member.guild.id);
    if (!!queue) {
      if (!queue.songs.length)
        return message.channel.send("There is no song that I could skip!");
      if (!!queue.connection) queue.connection.dispatcher.end();
    }
  }

  public pause(message: Message) {
    if (!message.member.voiceChannel)
      return message.channel.send(
        "You have to be in a voice channel to pause the music!"
      );
    const queue = this.serverQueues.get(message.member.guild.id);
    if (!!queue) {
      if (!!queue.connection) {
        queue.connection.dispatcher.pause();
      }
    }
  }

  public resume(message: Message) {
    if (!message.member.voiceChannel)
      return message.channel.send(
        "You have to be in a voice channel to resume the music!"
      );
    const queue = this.serverQueues.get(message.member.guild.id);
    if (!!queue) {
      if (!!queue.connection) {
        queue.connection.dispatcher.resume();
      }
    }
  }

  public current(message: Message) {
    const queue = this.serverQueues.get(message.member.guild.id);
    if (!queue) {
      return message.channel.send("No song playing!");
    } else {
      return message.channel.send(
        `current song playing is: ${queue.songs[0].title}`
      );
    }
  }

  public list(message: Message) {
    const queue = this.serverQueues.get(message.member.guild.id);
    if (!queue) {
      return message.channel.send("No song playing!");
    } else {
      let songs = "";
      queue.songs.forEach((song: Song) => {
        songs = songs.concat(song.title + "\n");
      });
      return message.channel.send(`current queue: \n${songs}`);
    }
  }

  private initQueue(message: Message): void {
    if (!this.serverQueues.get(message.member.guild.id)) {
      this.serverQueues.set(message.member.guild.id, {
        textChannel: message.channel,
        voiceChannel: message.member.voiceChannel,
        connection: undefined,
        songs: [],
        volume: 2,
        playing: false,
      } as Queue);
    }
  }
}
