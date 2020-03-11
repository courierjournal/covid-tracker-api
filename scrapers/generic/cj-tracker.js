const tabletop = require("tabletop");
const stateMap = require("../../supported-states.json");

let meta = {
  url:
    "https://docs.google.com/spreadsheets/d/170bNaKm4BIWnS_5xCOzmJgZKO1uBDGp2QUZjwsS8ouE/edit#gid=0",
  source: "Courier Journal"
};

let core = async (id, state) => {
  let key = "170bNaKm4BIWnS_5xCOzmJgZKO1uBDGp2QUZjwsS8ouE";
  let thisState = stateMap.find(n => n.abbr === state);
  let rawData = await tabletop.init({ key, parseNumbers: true });
  let filteredInstances = rawData[thisState.label].elements.filter(
    n => n.confirmed > 0
  );

  //Create aggregates by county
  let countyTracker = {};
  filteredInstances.forEach(n => {
    if (n.county in countyTracker) {
      countyTracker[n.county].confirmed += n.confirmed;
      countyTracker[n.county].deaths += n.deaths;
      countyTracker[n.county].recovered += n.recovered;
      countyTracker[n.county].active += n.active;
    } else {
      countyTracker[n.county] = {
        confirmed: n.confirmed,
        deaths: n.deaths,
        recovered: n.recovered,
        active: n.active
      };
    }
  });
  let counties = [];
  for (key in countyTracker) {
    counties.push({
      county: key,
      confirmed: countyTracker[key].confirmed,
      deaths: countyTracker[key].deaths,
      recovered: countyTracker[key].recovered,
      active: countyTracker[key].active
    });
  }

  return {
    id,
    meta,
    data: {
      confirmed: counties.reduce((acc, cur) => acc + cur.confirmed, 0),
      deaths: counties.reduce((acc, cur) => acc + cur.deaths, 0),
      recovered: counties.reduce((acc, cur) => acc + cur.recovered, 0),
      active: counties.reduce((acc, cur) => acc + cur.active, 0),
      counties,
      updated: null //Can't get proper timestamp from Tabletop :(
    }
  };
};

module.exports = core;
