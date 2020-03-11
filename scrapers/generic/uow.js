const axios = require("axios");
const csvParser = require("../../lib/csv-parser");
const stateMap = require("../../supported-states.json");

let meta = {
  url: "https://hgis.uw.edu/virus/",
  source: "University of Washington HGIS Lab"
};

let core = async (id, state) => {
  let thisState = stateMap.find(n => n.abbr === state);

  //Need to make 3 seperate requests here
  let rawData = await axios("https://hgis.uw.edu/virus/assets/virus.csv");
  let rawInstances = await axios("https://hgis.uw.edu/virus/assets/cases.csv");
  let rawUpdated = await axios(
    "https://hgis.uw.edu/virus/assets/timestamp.txt"
  );

  //Parse the data
  let parsedData = csvParser(rawData.data);
  let parsedInstances = csvParser(rawInstances.data);
  let parsedUpdated = Math.floor(new Date(rawUpdated.data).getTime() / 1000);

  //Extract totals - 0 = confirmed, 1 = ???, 2 = recovered, 3 = death
  let filteredData = parsedData[parsedData.length - 1][thisState.label].split(
    "-"
  );

  //Filter instances by state
  let filteredInstances = parsedInstances
    .filter(n => n.state.toLowerCase() === thisState.abbr)
    .map(n => {
      return {
        id: parseInt(n.id),
        date: n.date,
        county: n.county,
        description: n.note,
        source: n.reference
      };
    });

  //Create aggregates by county
  let countyTracker = {};
  filteredInstances.forEach(n => {
    if (n.county in countyTracker) {
      countyTracker[n.county]++;
    } else {
      countyTracker[n.county] = 1;
    }
  });
  let counties = [];
  for (key in countyTracker) {
    counties.push({
      county: key,
      confirmed: countyTracker[key]
    });
  }

  return {
    id,
    meta,
    data: {
      confirmed: parseInt(filteredData[0]),
      deaths: parseInt(filteredData[3]),
      recovered: parseInt(filteredData[2]),
      instances: filteredInstances,
      counties,
      updated: parsedUpdated
    }
  };
};

module.exports = core;
