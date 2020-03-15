const tabletop = require("tabletop");

const scraperId = "ky201";

let core = async () => {
  let sheetsKey = "170bNaKm4BIWnS_5xCOzmJgZKO1uBDGp2QUZjwsS8ouE";
  let res = {};

  try {
    let query = await tabletop.init({ key: sheetsKey, parseNumbers: true });

    if (typeof query !== "object") {
      throw "Response was not valid JSON";
    }

    res = {
      ok: true,
      data: query,
      results: []
    };
  } catch (err) {
    rawData = {
      ok: false,
      msg: err
    };
  }

  if (res.ok) {
    let filteredInstances = res.data["kentucky"].elements.filter(
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

    res.results = [
      {
        state: "ky",
        id: scraperId,
        raw: [
          {
            label: "confirmed",
            value: counties.reduce((acc, cur) => acc + cur.confirmed, 0)
          },
          {
            label: "deaths",
            value: counties.reduce((acc, cur) => acc + cur.deaths, 0)
          },
          {
            label: "recovered",
            value: counties.reduce((acc, cur) => acc + cur.recovered, 0)
          },
          { label: "updated", value: null }
        ],
        counties
      }
    ];
  }
  return res;
};

module.exports = core;
