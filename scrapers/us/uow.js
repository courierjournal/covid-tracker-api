const axios = require("axios");
const csvParser = require("../../lib/csv-parser");
const stateMap = require("../../config/state-list.json");

const scraperId = "us102";

let core = async () => {
  let res = {};

  try {
    let queryData = await axios("https://hgis.uw.edu/virus/assets/virus.csv", {
      timeout: 20000
    });
    let queryInstances = await axios(
      "https://hgis.uw.edu/virus/assets/cases.csv",
      { timeout: 20000 }
    );
    let queryUpdated = await axios(
      "https://hgis.uw.edu/virus/assets/timestamp.txt",
      { timeout: 20000 }
    );

    //Handle wonkiness of the endpoint not responding properly
    if (
      typeof queryData.data !== "string" ||
      typeof queryInstances.data !== "string" ||
      typeof queryUpdated.data !== "string"
    ) {
      throw "Response was not valid CSV string";
    }

    res = {
      ok: true,
      data: {
        rawData: queryData.data,
        rawInstances: queryInstances.data,
        rawUpdated: queryUpdated.data
      },
      results: []
    };
  } catch (err) {
    res = {
      ok: false,
      msg: err
    };
  }

  if (res.ok) {
    //Parse the data
    let parsedData = csvParser(res.data.rawData);
    let parsedInstances = csvParser(res.data.rawInstances);
    let parsedUpdated = Math.floor(new Date(res.data.rawUpdated).getTime());

    stateMap.forEach(state => {
      let thisStateData = parsedData[parsedData.length - 1][state.label];

      if (thisStateData) {
        //Extract totals - 0 = confirmed, 1 = ???, 2 = recovered, 3 = death
        let filteredData = thisStateData.split("-");

        //Filter instances by state
        let filteredInstances = parsedInstances
          .filter(n => n.state.toLowerCase() === state.abbr)
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

        res.results.push({
          id: scraperId,
          state: state.abbr,
          raw: [
            { label: "confirmed", value: parseInt(filteredData[0]) },
            { label: "deaths", value: parseInt(filteredData[3]) },
            { label: "recovered", value: parseInt(filteredData[2]) },
            { label: "updated", value: parsedUpdated }
          ],
          counties
        });
      }
    });
  }
  return res;
};

module.exports = core;
