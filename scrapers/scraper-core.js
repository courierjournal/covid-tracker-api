//Dynamic import namespace
let scrapers = {};

//Generic US wide scrapers
scrapers.hopkins = require("../generic/hopkins");
scrapers.uow = require("../generic/uow");
scrapers.ctp = require("../generic/ctp");
scrapers.cjtracker = require("../generic/cj-tracker");

//State specific
scrapers.chfs = require("./kychfs");

const stateMap = require("../supported-states.json");

let scraper = async (state, id) => {
  let startTime = new Date().getTime();
  let thisState = stateMap.find(n => n.abbr === state);
  let scraperList = thisState.scrapers || [];

  //Filter scraper list by id if specified
  if (id) {
    scraperList = scraperList.filter(n => n.id === id);
  }

  //Create our response
  let res = {
    state: "kentucky",
    confirmed: 0,
    dataSources: 0,
    scraperTimestamp: startTime,
    scraperDuration: null,
    sources: []
  };

  //Run each scraper and log the results
  for (var i = 0; i < scraperList.length; i++) {
    res.sources.push(
      await scrapers[scraperList[i]](scraperList[i].id, thisState.abbr)
    );
  }

  //Count the number of sources
  res.dataSources = res.sources.length;

  //Check for the highest confirmed case
  res.sources.forEach(n => {
    if (n.data.confirmed > res.confirmed) {
      res.confirmed = n.data.confirmed;
    }
  });

  //Log how long it took to scrape
  let endTime = new Date().getTime();
  res.scraperDuration = endTime - startTime;

  //Return our response
  return res;
};

module.exports = scraper;
