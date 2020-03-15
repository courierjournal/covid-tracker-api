const axios = require("axios");
const stateMap = require("../../config/state-list.json");

const scraperId = "us100";

let core = async () => {
  let res = {};
  try {
    let query = await axios(
      "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query?where=Confirmed%3E%3D0&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson&token=",
      { timeout: 20000 }
    );

    //Handle cases of the endpoint not responding properly
    if (typeof query.data !== "object") {
      throw "Response was not valid JSON";
    }

    if ("features" in query.data) {
      if (query.data.features.length === 0) {
        throw "Got JSON but feature layer was empty";
      }
    } else {
      throw "Got JSON but no feature layer present";
    }

    res = {
      ok: true,
      data: query.data,
      results: []
    };
  } catch (err) {
    res = {
      ok: false,
      msg: err
    };
  }

  if (res.ok) {
    let filteredByCountry = res.data.features.filter(
      n => n.properties.Country_Region === "US"
    );

    stateMap.forEach(state => {
      let thisStateData = filteredByCountry.find(
        n => n.properties.Province_State.toLowerCase() === state.label
      );

      if (thisStateData) {
        res.results.push({
          id: scraperId,
          state: state.abbr,
          raw: [
            { label: "confirmed", value: thisStateData.properties.Confirmed },
            { label: "deaths", value: thisStateData.properties.Deaths },
            { label: "recovered", value: thisStateData.properties.Recovered },
            { label: "updated", value: thisStateData.properties.Last_Update }
          ],
          counties: []
        });
      }
    });
  }
  return res;
};

module.exports = core;
