const axios = require("axios");

let meta = {
  url: "https://covid.cape.io/states",
  source: "The COVID Tracking Project"
};

let formatDate = str => {
  let year = new Date().getFullYear();
  return new Date(`${year}/${str}`) / 1000;
};

let core = async (id, state) => {
  let rawData = {};
  try {
    let query = await axios("https://covid.cape.io/states", { timeout: 5000 });

    //Handle wonkiness of the endpoint not responding properly
    if (typeof query.data !== 'object') {
      throw "Response was not valid JSON";
    }

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
    let filteredData = rawData.data.find(n => n.state.toLowerCase() === state);
    rawData.output = {
      id,
      meta,
      data: {
        confirmed: filteredData.positive,
        negative: filteredData.negative,
        pending: filteredData.pending,
        updated: formatDate(filteredData.lastUpdateEt)
      }
    };
  }
  return rawData;
};

module.exports = core;
