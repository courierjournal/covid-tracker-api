const axios = require("axios");

let meta = {
  url: "https://www.in.gov/isdh/28470.htm",
  source: "Indiana State Health Department"
};

//TODO: figure out where tested number comes from
let core = async id => {
  let rawData = {};

  try {
    let queryData = await axios(
      "https://services5.arcgis.com/f2aRfVsQG7TInso2/arcgis/rest/services/County_COVID19/FeatureServer/0/query?f=json&where=(Total_Tested%3E0%20OR%20Total_Deaths%3E0%20OR%20Total_Positive%3E0)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=COUNTYNAME%20asc&resultOffset=0&resultRecordCount=92&cacheHint=true",
      { timeout: 5000 }
    );
    let queryTime = await axios(
      "https://services5.arcgis.com/f2aRfVsQG7TInso2/arcgis/rest/services/Coronavirus/FeatureServer/0/query?f=json&where=Measure%3D%27Update%20Text%27&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&resultOffset=0&resultRecordCount=1&cacheHint=true",
      { timeout: 5000 }
    );

    //Handle wonkiness of the endpoint not responding properly
    if (
      typeof queryData.data !== "object" ||
      typeof queryTime.data !== "object"
    ) {
      throw "Response was not valid JSON";
    }

    rawData = {
      ok: true,
      data: {
        rawData: queryData.data,
        rawTime: queryTime.data
      }
    };
  } catch (err) {
    rawData = {
      ok: false,
      msg: err
    };
  }

  if (rawData.ok) {
    let counties = rawData.data.rawData.features.map(n => {
      return {
        county: n.attributes.COUNTYNAME,
        confirmed: n.attributes.Total_Positive,
        deaths: n.attributes.Total_Deaths,
        tested: n.attributes.Total_Tested
      };
    });

    rawData.output = {
      id,
      meta,
      data: {
        confirmed: counties.reduce((acc, cur) => acc + cur.confirmed, 0),
        deaths: counties.reduce((acc, cur) => acc + cur.deaths, 0),
        tested: counties.reduce((acc, cur) => acc + cur.tested, 0),
        counties,
        updated:
          new Date(rawData.data.rawTime.features[0].attributes.meastureText) /
          1000
      }
    };
  }
  return rawData;
};

module.exports = core;
