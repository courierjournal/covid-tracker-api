const fs = require("fs");
const path = require("path");

let cachePath = path.join(__dirname, "..", "data", "cache.json");
let get = (state, scraperID = null) => {
  return new Promise((resolve, reject) => {
    fs.readFile(cachePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
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

let set = data => {
  return new Promise((resolve, reject) => {
    fs.writeFile(cachePath, JSON.stringify(data), err => {
      if (err) {
        reject("Could not write file");
      } else {
        resolve("File written succesfully");
      }
    });
  });
};

exports.get = get;
exports.set = set;
