// IMPORTS
const Discord = require("discord.js");
let config;
try {
  config = require("./config.json");
} catch (exception) {
  config = {
    prefix: process.env.prefix,
    port: process.env.port,
    discordToken: process.env.discordToken,
    errorMsg: process.env.errorMsg,
    youtubeApiKey: process.env.youtubeApiKey,
  };
}

const musicCommands = require("./music/music_commands.js");
const spotifyCommands = require("./music/spotify_integration.js");
const youtubeSearch = require("./music/youtube_search.js");

var http = require("http");

http
  .createServer(function (req, res) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end();
  })
  .listen(config.port, "0.0.0.0");

// COSTANTS
const client = new Discord.Client();
const musicQueue = new Map();
let queueForSpecificServer = [];

// HANDLE CLIENT EVENTS
client.once("ready", () => {
  console.log("Ready!");
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;

  queueForSpecificServer = musicQueue.get(message.guild.id);

  if (message.content.startsWith(`${config.prefix}play `)) {
    play(message);
  } else if (message.content.startsWith(`${config.prefix}skip`)) {
    musicCommands.skipMusic(message, queueForSpecificServer);
  } else if (message.content.startsWith(`${config.prefix}stop`)) {
    musicCommands.stopMusic(message, queueForSpecificServer);
  } else if (message.content.startsWith(`${config.prefix}pause`)) {
    musicCommands.pauseMusic(message, queueForSpecificServer);
  } else if (message.content.startsWith(`${config.prefix}resume`)) {
    musicCommands.resumeMusic(message, queueForSpecificServer);
  } else if (message.content.startsWith(`${config.prefix}current`)) {
    musicCommands.currentSong(message, queueForSpecificServer);
  } else if (message.content.startsWith(`${config.prefix}list`)) {
    musicCommands.listSongs(message, queueForSpecificServer);
  } else if (message.content.startsWith(`${config.prefix}spotify `)) {
    spotify(message);
  } else if (message.content.startsWith(`${config.prefix}searchyt `)) {
    searchyt(message);
  } else if (message.content.startsWith(`${config.prefix}roll`)) {
    const die = parseInt(message.content.split(" ")[1]);
    !!die
      ? message.channel.send(
          "you rolled: " +
            (
              (Math.floor(Math.pow(10, 14) * Math.random() * Math.random()) %
                (die - 1 + 1)) +
              1
            ).toString()
        )
      : message.channel.send("invalid dice");
  } else {
    message.channel.send("You need to enter a valid command!");
  }
});

client.login(config.discordToken);

// private functions
//#region
function play(message) {
  let repeat = message.content.includes("repeat");
  if (repeat)
    musicCommands.stopMusic(message, queueForSpecificServer, musicQueue);
  musicCommands.playMusic(message, queueForSpecificServer, musicQueue, repeat);
}

async function spotify(message) {
  if (message.content.split(" ").length != 2)
    return message.channel.send("format is invalid");
  let links = await spotifyCommands.findSpotifyPlaylist(message);
  if (!Array.isArray(links)) return message.channel.send(config.errorMsg);

  links.forEach((link) => {
    message.content = "!play " + link;
    musicCommands.playMusic(message, queueForSpecificServer, musicQueue, false);
  });
}

async function searchyt(message) {
  const searchString = message.content.replace(`${config.prefix}searchyt `, "");
  var options = {
    maxResults: 1,
    part: "snippet",
    type: "video",
    key: config.youtubeApiKey,
  };
  var links = await youtubeSearch.searchYoutube([searchString], options);
  links.forEach((link) => {
    message.content = "!play " + link;
    musicCommands.playMusic(message, queueForSpecificServer, musicQueue, false);
  });
}
//#endregion
