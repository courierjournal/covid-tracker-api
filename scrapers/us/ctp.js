const axios = require("axios");
const stateMap = require("../../config/state-list.json");

const scraperId = "us101";

let formatDate = str => {
  let year = new Date().getFullYear();
  return new Date(`${year}/${str}`).getTime();
};

let core = async () => {
  let res = {};
  try {
    let query = await axios("https://covid.cape.io/states", { timeout: 20000 });

    //Handle wonkiness of the endpoint not responding properly
    if (typeof query.data !== "object") {
      throw "Response was not valid JSON";
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
    stateMap.forEach(state => {
      let thisStateData = res.data.find(
        n => n.state.toLowerCase() === state.abbr
      );

      if (thisStateData) {
        res.results.push({
          id: scraperId,
          state: state.abbr,
          raw: [
            { label: "confirmed", value: thisStateData.positive },
            { label: "negative", value: thisStateData.negative },
            { label: "pending", value: thisStateData.pending },
            { label: "updated", value: formatDate(thisStateData.lastUpdateEt) }
          ],
          counties: []
        });
      }
    });
  }

  return res;
};

module.exports = core;
