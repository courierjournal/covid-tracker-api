//Dynamic import namespace
let scrapers = {};

//Generic US wide scrapers - Add more below these
scrapers.hopkins = require("./us/hopkins");
scrapers.uow = require("./us/uow");
scrapers.ctp = require("./us/ctp");

//State specific scrapers - Add more below this
scrapers.cjtracker = require("./kentucky/cj-tracker");
scrapers.kychfs = require("./kentucky/kychfs");
scrapers.isdh = require("./indiana/isdh");

const scraperMap = require("../config/scrapers.json");
const diskCache = require("../lib/disk-cache")

/**
 * Scraper core
 */
let scraper = async () => {
  let collection = [];
  let cache = await diskCache.get('us');

  //Run each scraper and log the results into a collection
  for (var i = 0; i < scraperMap.length; i++) {
    let scraperData = await scrapers[scraperMap[i].module]();
    if (scraperData.ok) {
      scraperData.results.forEach(n => {
        collection.push(n);
      });
    } else {
      console.log(scraperData.msg);
    }
  }

  //Iterate through the collection
  collection.forEach(c => {
    //Check if source exists in cache
    if (cache[c.state].rawData.some(r => r.id === c.id)) {
    } else {
      cache[c.state].rawData.push({
        id: c.id,
        output: c.raw,
        counties: c.counties
      });
    }
  });

  //Iterate through the cache to find the highest value
  for (state in cache) {
    let highestRank = { count: 0, source: null, sourceUpdated: 0 };
    let highestCounty = 0;
    let countyMeta = { source: null, sourceUpdated: 0, counties: [] };

    cache[state].rawData.forEach(n => {
      //Rank confirmed totals
      let confirmed = n.output.find(y => y.label === "confirmed");
      let updated = n.output.find(y => y.label === "updated");
      if (confirmed.value > highestRank.count) {
        highestRank.count = confirmed.value;
        highestRank.source = n.id;
        highestRank.sourceUpdated = updated.value;
      }

      //Rank county totals
      let countyCount = n.counties.reduce((acc, cur) => acc + cur.confirmed, 0);
      if (countyCount > highestCounty) {
        countyMeta = {
          source: n.id,
          sourceUpdated: updated.value,
          counties: n.counties.map(x => {
            return {
              county: x.county,
              confirmed: x.confirmed
            };
          })
        };
      }
    });
    cache[state].confirmed = highestRank;
    cache[state].counties = countyMeta;
  }

  //Send the updated cache to be saved
  let cacheResults = await diskCache.set(cache);
  return cacheResults
};

(async () => {
  let test = await scraper();
  console.log(JSON.stringify(test));
})();
