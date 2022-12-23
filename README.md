# Discord-music-bot

## A node typescript music bot for discord.

Play music in your own discord server, easily hostable for free on heroku.  
Queue songs from youtube links, in channel searching or queue entire spotify playlists directly to the bot.

### Run:

`npm install -g ts-node`  
`ts-node src/app.ts`

For development on localhost a config.json file in the following structure in the root directory is needed:

```
{
  "discordToken": "***",
  "youtubeApiKey": "***",
  "spotifyBearer": "Basic ***",
  "spotifyPlaylistUrl": "https://api.spotify.com/v1/playlists/",
  "spotifyAuthUrl": "https://accounts.spotify.com/api/token",
}
```

For hosting on heroku use following config vars (env variables):

```
discordToken : "***",
youtubeApiKey : "***",
spotifyBearer : "Basic ***",
spotifyPlaylistUrl : "https://api.spotify.com/v1/playlists/",
spotifyAuthUrl : "https://accounts.spotify.com/api/token",
```

### Features:

- Play music from youtube link
- Search and play from youtube directly in discord.
- Pause/Resume
- Show current song or the queue.
- Queue an entire playlist from spotify

### Commands:

!play [youtubeurl] (play from youtube url)  
!ytsearch [text to search] (searches and plays matching clip)  
!ytplaylist [youtube playlist url] (plays entire yt playlist, max 20 songs)    
!pause (pause)  
!resume (resume)  
!skip (skip to next song)  
!stop (stop playing)  
!current (show what is currently playing)  
!list (show the current queue)  
!spotify [playlisturl] (parses spotify playlist and add all songs from it to the queue)


### Update all packages to latest:

`npm-check-updates`  
`ncu -u`