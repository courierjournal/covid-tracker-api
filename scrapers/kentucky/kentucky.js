const chfs = require("./ky-chfs");
const hopkins = require("../generic/hopkins");
const uow = require("../generic/uow");
const ctp = require("../generic/ctp");
const cjTracker = require("../generic/cj-tracker");

let scraper = async id => {
  let startTime = new Date().getTime();

  //Setup our scrapers
  let scraperList = [
    {
      id: "ky001",
      module: chfs
    },
    {
      id: "ky002",
      module: hopkins
    },
    {
      id: "ky003",
      module: uow
    },
    {
      id: "ky004",
      module: ctp
    },
    /*{
      id: "ky005",
      module: cjTracker
    }*/
  ];

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
    res.sources.push(await scraperList[i].module(scraperList[i].id, "ky"));
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
