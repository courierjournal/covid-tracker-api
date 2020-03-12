//Dynamic import namespace
let scrapers = {};

//Generic US wide scrapers - Add more below these
scrapers.hopkins = require("./generic/hopkins");
scrapers.uow = require("./generic/uow");
scrapers.ctp = require("./generic/ctp");

//State specific scrapers - Add more below this
scrapers.cjtracker = require("./generic/cj-tracker"); //We may or may not use this
scrapers.chfs = require("./kentucky/kychfs");
scrapers.isdh = require("./indiana/isdh");

const stateMap = require("../supported-states.json");

/**
 * Scraper core
 * @param {*} state
 * @param {*} id
 */
let scraper = async (state, id) => {
  //Set our starting time to track performance
  let startTime = new Date().getTime();

  //Get the mapped vars of the requested state
  let thisState = stateMap.find(n => n.abbr === state);

  //Define the set of core scrapers available to any state
  let coreScrapers = [
    {
      id: `${thisState.abbr}2000`,
      module: "hopkins"
    },
    {
      id: `${thisState.abbr}2001`,
      module: "uow"
    },
    {
      id: `${thisState.abbr}2002`,
      module: "ctp"
    }
  ];

  //Append the core scrapers to the custom ones defined in the supported states
  let scraperList = thisState.scrapers || [];
  scraperList = scraperList.concat(coreScrapers);

  //Filter scraper list by id if specified
  if (id) {
    scraperList = scraperList.filter(n => n.id === id);
  }

  //Create our response
  let res = {
    state: thisState.label,
    confirmed: 0,
    dataSources: 0,
    scraperTimestamp: startTime,
    scraperDuration: null,
    sources: [],
    scrapersUnavailable: []
  };

  //Run each scraper and log the results
  for (var i = 0; i < scraperList.length; i++) {
    let scraperData = await scrapers[scraperList[i].module](
      scraperList[i].id,
      thisState.abbr
    );
    if (scraperData.ok) {
      res.sources.push(scraperData.output);
    } else {
      res.scrapersUnavailable.push(scraperList[i].id);
    }
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
