const axios = require("axios");

const scraperId = "in200";

//TODO: figure out where tested number comes from
let core = async id => {
  let rawData = {};

  try {
    let queryData = await axios(
      "https://services5.arcgis.com/f2aRfVsQG7TInso2/arcgis/rest/services/County_COVID19/FeatureServer/0/query?f=json&where=(Total_Tested%3E0%20OR%20Total_Deaths%3E0%20OR%20Total_Positive%3E0)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=COUNTYNAME%20asc&resultOffset=0&resultRecordCount=92&cacheHint=true",
      { timeout: 20000 }
    );
    let queryTime = await axios(
      "https://services5.arcgis.com/f2aRfVsQG7TInso2/arcgis/rest/services/Coronavirus/FeatureServer/0/query?f=json&where=Measure%3D%27Update%20Text%27&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&resultOffset=0&resultRecordCount=1&cacheHint=true",
      { timeout: 20000 }
    );

    //Handle wonkiness of the endpoint not responding properly
    if (
      typeof queryData.data !== "object" ||
      typeof queryTime.data !== "object"
    ) {
      throw "Response was not valid JSON";
    }

    res = {
      ok: true,
      data: {
        rawData: queryData.data,
        rawTime: queryTime.data
      }
    };
  } catch (err) {
    res = {
      ok: false,
      msg: err
    };
  }

  if (res.ok) {
    let counties = res.data.rawData.features.map(n => {
      return {
        county: n.attributes.COUNTYNAME,
        confirmed: n.attributes.Total_Positive,
        deaths: n.attributes.Total_Deaths,
        tested: n.attributes.Total_Tested
      };
    });

    res.results = [
      {
        state: "in",
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
            label: "tested",
            value: counties.reduce((acc, cur) => acc + cur.tested, 0)
          },
          {
            label: "updated",
            value: new Date(
              res.data.rawTime.features[0].attributes.MeastureText
            )
          }
        ],
        counties
      }
    ];
  }
  return res;
};

module.exports = core;
