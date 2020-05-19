var search = require("youtube-search");

module.exports = {
  // Paramter is a list, see spotify intergation for options.
  searchYoutube: async function searchYoutube(searchTags, options) {
    let musicLinks = [];
    await asyncForEach(searchTags, async (tag) => {
      let link = await searchYoutubeSingle(tag, options);
      musicLinks.push(link);
    });
    return musicLinks;
  },
};

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function searchYoutubeSingle(tag, options) {
  return new Promise((resolve) => {
    search(tag, options, async function (err, results) {
      if (err) {
        console.log("Failed to fetch from youtube with error: " + err);
        return;
      }
      resolve(results[0]["link"]);
    });
  });
}
