const fs = require("fs");

module.exports = (state, scraperID = null) => {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/cache.json", "utf8", (err, data) => {
      if (err) {
        reject("Could not read file");
      } else {
        let cachedData = JSON.parse(data);
        if (state === "us") {
          resolve(cachedData);
        } else {
          resolve(cachedData[state]);
        }
      }
    });
  });
};
