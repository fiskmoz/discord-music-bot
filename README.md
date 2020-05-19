# discord-music-bot

## A music bot for discord.
Play music in your own discord server, easily hostable for free on heroku.
Queue songs from youtube links, in channel searching and queue entire spotify playlists directly to the bot.

### Dependencies:   
node js

### Run:    
`node index.js`

For development on localhost a config.json file in the following structure in the root directory is needed:
``` 
{
  "prefix": "!",
  "discordToken": "***",
  "port": "5000",
  "youtubeApiKey": "***",
  "spotifyBearer": "Basic ***",
  "spotifyPlaylistUrl": "https://api.spotify.com/v1/playlists/",
  "spotifyAuthUrl": "https://accounts.spotify.com/api/token",
  "errorMsg": "Something went wrong ¯\\_(ツ)_/¯"
}
``` 

For hosting in cloud etc use config vars:
```
prefix : "***"
discordToken : "***",
port : "5000",
youtubeApiKey : "***",
spotifyBearer : "Basic ***",
spotifyPlaylistUrl : "https://api.spotify.com/v1/playlists/",
spotifyAuthUrl : "https://accounts.spotify.com/api/token",
errorMsg : "Something went wrong ¯\\_(ツ)_/¯"
```

## Features: 
- Play music from youtube link
- Search and play from youtube directly in discord.
- Pause/Resume
- Show current song and the queue.
- Queue an entire playlist from spotify

Commands:    
!play [youtubeurl]  (play from youtube url)   
!searchyt [text att söka på] (searches and plays matching clip)   
!pause (pause)   
!resume (resume)   
!skip (skip to next song)   
!stop (stop playing)   
!current (show what is currently playing)   
!list (show the current queue)   
!spotify [playlisturl] (parses spotify playlist and add all songs from it to the queue)   
