var request = require("request-promise");
const youtubeSearch = require("./youtube_search.js");
let spotify_config;
try {
  spotify_config = require("../config.json");
} catch (exception) {
  spotify_config = {
    spotifyPlaylistUrl: process.env.spotifyPlaylistUrl,
    spotifyAuthUrl: process.env.spotifyAuthUrl,
    spotifyBearer: process.env.spotifyBearer,
    youtubeApiKey: process.env.youtubeApiKey,
  };
}

module.exports = {
  findSpotifyPlaylist: async function findSpotifyPlaylist(message) {
    let currentToken = await spotifyAuth();
    if (currentToken == "")
      return message.channel.send("I could not authenticate to spotify");

    let searchTags = [];
    const args = message.content.split(" ");
    const playlistId = args[1].split("/").slice(-1).pop();
    const playlist = await getSpotifyPlaylist(playlistId, currentToken);
    if (!playlist) {
      return message.channel.send("No playlist found");
    }
    if (playlist["tracks"]["items"] == 0)
      return message.channel.send("i could not get the spotify playlist.");
    playlist["tracks"]["items"].forEach((track) => {
      searchTags.push(
        track["track"]["artists"][0]["name"] + " - " + track["track"]["name"]
      );
    });
    var options = {
      maxResults: 1,
      part: "snippet",
      order: "viewCount",
      type: "video",
      key: spotify_config.youtubeApiKey,
    };
    console.log(searchTags);
    console.log(options);
    const links = await youtubeSearch.searchYoutube(searchTags, options);
    return links;
  },
};

async function spotifyAuth() {
  var headers = {
    Authorization: spotify_config.spotifyBearer,
    "content-length": "29",
    "content-type": "application/x-www-form-urlencoded",
  };

  var dataString = "grant_type=client_credentials";

  var options = {
    method: "POST",
    headers: headers,
    body: dataString,
  };

  var res = await request(spotify_config.spotifyAuthUrl, options);
  res = JSON.parse(res);
  return res["access_token"];
}

async function getSpotifyPlaylist(id, authToken) {
  var headers = {
    Authorization: "Bearer " + authToken,
    "content-type": "application/x-www-form-urlencoded",
  };
  var options = {
    method: "GET",
    headers: headers,
  };

  var res = await request(spotify_config.spotifyPlaylistUrl + id, options);
  return JSON.parse(res);
}
