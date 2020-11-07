import { rejects } from "assert";
import internal from "stream";
import search, {
  YouTubeSearchOptions,
  YouTubeSearchPageResults,
  YouTubeSearchResults,
} from "youtube-search";
import ytdl, { videoInfo } from "ytdl-core";
import { YoutubeConfig } from "./interfaces/interfaces";

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
  public async searchYoutube(searchTag: string): Promise<YouTubeSearchResults> {
    return new Promise((resolve) => {
      search(
        searchTag,
        {
          maxResults: 1,
          part: "snippet",
          order: "viewCount",
          type: "video",
          key: this.config.youtubeApiKey,
        },
        (
          err: Error,
          result?: YouTubeSearchResults[] | undefined,
          pageInfo?: YouTubeSearchPageResults | undefined
        ) => {
          if (err) {
            console.log("Failed to fetch from youtube with error: " + err);
            return;
          }
          if (!!result) {
            return resolve(result[0]);
          }
          console.log("Could not search with search tag");
          return rejects(Promise.reject());
        }
      );
    });
  }
  public async getBasicInfo(videoUrl: string): Promise<videoInfo> {
    return await ytdl.getBasicInfo(videoUrl);
  }

  public getStream(url: string): internal.Readable {
    return ytdl(url, {
      filter: "audioonly",
      highWaterMark: 1 << 25,
    });
  }
}
