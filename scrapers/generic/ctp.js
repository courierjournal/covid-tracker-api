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
  let rawData = await axios("https://covid.cape.io/states");
  let filteredData = rawData.data.find(n => n.state.toLowerCase() === state);

  return {
    id,
    meta,
    data: {
      confirmed: filteredData.positive,
      negative: filteredData.negative,
      pending: filteredData.pending,
      updated: formatDate(filteredData.lastUpdateEt)
    }
  };
};

module.exports = core;
