const axios = require("axios");
const stateMap = require("../../supported-states.json");

let meta = {
  url:
    "https://www.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6",
  source:
    "The Center for Systems Science and Engineering (CSSE) at Johns Hopkins University"
};

//TODO: find a proper way to request state via endpoint query instead of this filter on all of the data
let core = async (id, state) => {
  let thisState = stateMap.find(n => n.abbr === state);

  let rawData = {};
  try {
    let query = await axios(
      "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query?where=Confirmed%3E%3D0&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson&token="
    );
    rawData = {
      ok: true,
      data: query.data
    };
  } catch (err) {
    rawData = {
      ok: false,
      msg: err
    };
  }

  if (rawData.ok) {
    let stateData = rawData.data.features
      .filter(n => n.properties.Province_State !== null)
      .find(n => n.properties.Province_State.toLowerCase() === thisState.label);

    return {
      id,
      meta,
      data: {
        confirmed: stateData.properties.Confirmed,
        deaths: stateData.properties.Deaths,
        recovered: stateData.properties.Recovered,
        updated: stateData.properties.Last_Update / 1000
      }
    };
  } else {
    return rawData;
  }
};

module.exports = core;
