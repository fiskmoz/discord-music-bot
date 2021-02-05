import { rejects } from "assert";
import axios, { AxiosRequestConfig } from "axios";
import internal from "stream";
import ytdl, { videoInfo } from "ytdl-core";
import {
  YoutubeConfig,
  YoutubeRequestConfig,
  YouTubeSearchResults,
  YoutubeVideoResult,
} from "./interfaces/interfaces";

export class Youtube {
  private config: YoutubeConfig;

  public constructor() {
    try {
      this.config = require("../config.json");
    } catch (exception) {
      this.config = {
        youtubeApiKey: !!process.env.youtubeApiKey
          ? process.env.youtubeApiKey
          : "",
      } as YoutubeConfig;
    }
  }

  public async getPlaylist(id: string): Promise<YoutubeVideoResult[]> {
    return new Promise((resolve) => {
      const config = {
        part: "id,snippet",
        maxResults: 20,
        playlistId: id,
        key: this.config.youtubeApiKey,
      } as YoutubeRequestConfig;
      axios
        .get("https://www.googleapis.com/youtube/v3/playlistItems", {
          params: config,
        } as AxiosRequestConfig)
        .then(
          (result: any) => {
            resolve(result.data.items);
          },
          (reason: any) => {
            console.log(reason.data);
            return rejects(Promise.reject());
          }
        )
        .catch((reason: any) => {
          console.log(reason.data);
          return rejects(Promise.reject());
        });
    });
  }

  public async searchYoutube(searchTag: string): Promise<YouTubeSearchResults> {
    return new Promise((resolve) => {
      const config = {
        q: searchTag,
        part: "snippet",
        maxResults: 1,
        order: "viewCount",
        playlistId: searchTag,
        type: "video",
        key: this.config.youtubeApiKey,
      } as YoutubeRequestConfig;
      axios
        .get("https://www.googleapis.com/youtube/v3/search", {
          params: config,
        } as AxiosRequestConfig)
        .then(
          (result: any) => {
            var findings = result.data.items.map((item: any) => {
              var link = "";
              var id = "";
              switch (item.id.kind) {
                case "youtube#channel":
                  link = "https://www.youtube.com/channel/" + item.id.channelId;
                  id = item.id.channelId;
                  break;
                case "youtube#playlist":
                  link =
                    "https://www.youtube.com/playlist?list=" +
                    item.id.playlistId;
                  id = item.id.playlistId;
                  break;
                default:
                  link = "https://www.youtube.com/watch?v=" + item.id.videoId;
                  id = item.id.videoId;
                  break;
              }

              return {
                id: id,
                link: link,
                kind: item.id.kind,
                publishedAt: item.snippet.publishedAt,
                channelId: item.snippet.channelId,
                channelTitle: item.snippet.channelTitle,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnails: item.snippet.thumbnails,
              } as YouTubeSearchResults;
            });
            resolve(findings[0]);
          },
          (reason: any) => {
            console.log(reason.data);
            return rejects(Promise.reject());
          }
        )
        .catch((reason: any) => {
          console.log(reason.data);
          return rejects(Promise.reject());
        });
    });
  }

  public async getBasicInfo(videoUrl: string): Promise<videoInfo | null> {
    try {
      return await ytdl.getBasicInfo(videoUrl);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  public getStream(url: string): internal.Readable {
    return ytdl(url, {
      filter: "audioonly",
      highWaterMark: 1 << 25,
    });
  }
}
