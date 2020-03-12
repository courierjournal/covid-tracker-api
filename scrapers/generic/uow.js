const axios = require("axios");
const csvParser = require("../../lib/csv-parser");
const stateMap = require("../../supported-states.json");

let meta = {
  url: "https://hgis.uw.edu/virus/",
  source: "University of Washington HGIS Lab"
};

let core = async (id, state) => {
  let thisState = stateMap.find(n => n.abbr === state);
  let rawData = {};

  try {
    let queryData = await axios("https://hgis.uw.edu/virus/assets/virus.csv", {
      timeout: 5000
    });
    let queryInstances = await axios(
      "https://hgis.uw.edu/virus/assets/cases.csv",
      { timeout: 5000 }
    );
    let queryUpdated = await axios(
      "https://hgis.uw.edu/virus/assets/timestamp.txt",
      { timeout: 5000 }
    );

    //Handle wonkiness of the endpoint not responding properly
    if (
      typeof queryData.data !== "string" ||
      typeof queryInstances.data !== "string" ||
      typeof queryUpdated.data !== "string"
    ) {
      throw "Response was not valid CSV string";
    }

    rawData = {
      ok: true,
      data: {
        rawData: queryData.data,
        rawInstances: queryInstances.data,
        rawUpdated: queryUpdated.data
      }
    };
  } catch (err) {
    rawData = {
      ok: false,
      msg: err
    };
  }

  if (rawData.ok) {
    //Parse the data
    let parsedData = csvParser(rawData.data.rawData);
    let parsedInstances = csvParser(rawInstances.rawdata);
    let parsedUpdated = Math.floor(
      new Date(rawUpdated.rawdata).getTime() / 1000
    );

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

    rawData.output = {
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
  }
  return rawData;
};

module.exports = core;
