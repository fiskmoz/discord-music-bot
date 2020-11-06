const ytdl = require("ytdl-core");

module.exports = {
  playMusic: async function playMusic(
    message,
    queueForSpecificServer,
    musicQueue,
    repeat
  ) {
    const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel)
      return message.channel.send(
        "You need to be in a voice channel to play music!"
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
    }

    const args = message.content.split(" ");
    let url = args[1];
    const songInfo = await ytdl.getBasicInfo(url);
    const song = {
      title: songInfo.player_response.videoDetails.title,
      url: url,
    };
    if (!song || !songInfo) {
      return message.channel.send("Cannot play that song");
    }
    if (!queueForSpecificServer) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 2,
        playing: true,
      };

      musicQueue.set(message.guild.id, queueContruct);

      queueContruct.songs.push(song);
      for (let index = 0; index < args.length; index++) {
        if (index < 2) continue;
        queueContruct.songs.push({ title: "hej", url: args[index] });
        console.log("added another song");
      }
      console.log(queueContruct.songs);

      try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        const queueForSpecificServer = musicQueue.get(message.guild.id);

        playNextSong(
          message.guild,
          queueForSpecificServer.songs[0],
          musicQueue,
          repeat
        );
      } catch (err) {
        console.log(err);
        musicQueue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      queueForSpecificServer.songs.push(song);
      return message.channel.send(
        `${song.title} has been added to the musicQueue!`
      );
    }
  },

  skipMusic: function skipMusic(message, queueForSpecificServer) {
    if (!message.member.voiceChannel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
    if (!queueForSpecificServer)
      return message.channel.send("There is no song that I could skip!");
    queueForSpecificServer.connection.dispatcher.end();
  },

  stopMusic: function stopMusic(message, queueForSpecificServer) {
    if (!message.member.voiceChannel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
    queueForSpecificServer.songs = [];
    queueForSpecificServer.connection.dispatcher.end();
  },

  pauseMusic: function pauseMusic(message, queueForSpecificServer) {
    if (!message.member.voiceChannel)
      return message.channel.send(
        "You have to be in a voice channel to pause the music!"
      );
    if (queueForSpecificServer.connection.dispatcher)
      queueForSpecificServer.connection.dispatcher.pause();
  },
  resumeMusic: function resumeMusic(message, queueForSpecificServer) {
    if (!message.member.voiceChannel)
      return message.channel.send(
        "You have to be in a voice channel to resume the music!"
      );
    if (queueForSpecificServer.connection.dispatcher)
      queueForSpecificServer.connection.dispatcher.resume();
  },

  currentSong: function currentSong(message, queueForSpecificServer) {
    if (!queueForSpecificServer)
      return message.channel.send("No song playing!");
    return message.channel.send(
      `current song playing is: ${queueForSpecificServer.songs[0].title}`
    );
  },

  listSongs: function listSongs(message, queueForSpecificServer) {
    if (!queueForSpecificServer)
      return message.channel.send("No song playing!");
    let songs = "";
    queueForSpecificServer.songs.forEach((element) => {
      songs = songs.concat(queueForSpecificServer.songs[element].title + "\n");
    });
    return message.channel.send(`current queue: \n${songs}`);
  },

  addSongs: function addSong(song, queueForSpecificServer) {
    queueForSpecificServer.songs.push(song);
  },
};
function playNextSong(guild, song, musicQueue, repeat) {
  const queueForSpecificServer = musicQueue.get(guild.id);

  if (!song) {
    queueForSpecificServer.voiceChannel.leave();
    musicQueue.delete(guild.id);
    return;
  }
  const dispatcher = queueForSpecificServer.connection
    .playStream(
      ytdl(song.url, {
        filter: "audioonly",
        highWaterMark: 1 << 25,
      })
    )
    .on("end", () => {
      if (!repeat) {
        queueForSpecificServer.songs.shift();
      }
      if (Math.round(Math.random() * 1) == 0) {
        playRandomQuote(guild, musicQueue);
      } else {
        playNextSong(
          guild,
          queueForSpecificServer.songs[0],
          musicQueue,
          repeat
        );
      }
    })
    .on("error", (error) => {
      console.error(error);
    });
  dispatcher.setVolumeLogarithmic(queueForSpecificServer.volume / 5);
}

function playRandomQuote(guild, musicQueue) {
  const queueForSpecificServer = musicQueue.get(guild.id);
  let file = "";
  const quote = Math.floor(Math.random() * 3);
  switch (quote) {
    case 0:
      file = "./quotes/gragas/Laugh1.mp3";
      break;
    case 1:
      file = "./quotes/gragas/Partystarted.mp3";
      break;
    case 2:
      file = "./quotes/gragas/Rolloutbarrel.mp3";
      break;
    case 3:
      file = "./quotes/gragas/Tablescrub.mp3";
      break;
  }
  const dispatcher = queueForSpecificServer.connection
    .playFile(file)
    .on("end", () => {
      playNextSong(guild, queueForSpecificServer.songs[0], musicQueue, false);
    });
  dispatcher.setVolumeLogarithmic(queueForSpecificServer.volume / 5);
}
