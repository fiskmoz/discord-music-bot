import Axios, { AxiosRequestConfig } from "axios";
import { SpotifyConfig } from "./interfaces/interfaces";

export class Spotify {
  private config: SpotifyConfig;
  public constructor() {
    try {
      this.config = require("../config.json");
    } catch (exception) {
      this.config = {
        spotifyPlaylistUrl: !!process.env.spotifyPlaylistUrl
          ? process.env.spotifyPlaylistUrl
          : "",
        spotifyAuthUrl: !!process.env.spotifyAuthUrl
          ? process.env.spotifyAuthUrl
          : "",
        spotifyBearer: !!process.env.spotifyBearer
          ? process.env.spotifyBearer
          : "",
      } as SpotifyConfig;
    }
  }

  private async authenticate(): Promise<string> {
    var options: AxiosRequestConfig = {
      method: "POST",
      url: this.config.spotifyAuthUrl,
      headers: {
        Authorization: this.config.spotifyBearer,
        "content-length": "29",
        "content-type": "application/x-www-form-urlencoded",
      },
      data: "grant_type=client_credentials",
    };

    var res = await Axios(options);
    return res.data["access_token"];
  }
  public async getPlaylist(playlistId: string): Promise<any> {
    var options: AxiosRequestConfig = {
      headers: {
        Authorization: "Bearer " + (await this.authenticate()),
        "content-type": "application/x-www-form-urlencoded",
      },
    };
    var res = await Axios.get(
      this.config.spotifyPlaylistUrl + playlistId,
      options
    );
    return res.data["tracks"]["items"];
  }
}
