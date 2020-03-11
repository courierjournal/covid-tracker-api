const axios = require("axios");
const cheerio = require("cheerio");
const regexr = require("../../lib/regexr");

let meta = {
  url: "https://chfs.ky.gov/agencies/dph/pages/covid19.aspx",
  source: "Kentucky Cabinet for Health and Family Services"
};

let cleanTimestamp = str => {
  //Extract known format of timestamp
  let raw = str.match(/(?<=Current as of)(.*)(?= Eastern time)/g)[0];

  //Split date and time
  let el = raw.split("at").map(n => n.trim());

  //Convert to 24hr time
  if (el[1].includes("p.m")) {
    el[1] = el[1].replace("p.m.", "").trim();
    let timeElements = el[1].split(":");
    el[1] = parseInt(timeElements[0]) + 12 + ":" + timeElements[1];
  } else {
    el[1] = el[1].replace("a.m.", "").trim();
  }

  //Reconstruct datetime and get milliseconds
  return Math.floor(new Date(el[0] + " " + el[1]).getTime() / 1000);
};

let core = async id => {
  let data = await axios(meta.url);
  const $ = cheerio.load(data.data);
  const txt = $(
    "#ctl00_ctl00_PlaceHolderContentFromChild_PlaceHolderContent_ctl01__ControlWrapper_RichHtmlField > div"
  ).text();

  return {
    id,
    meta,
    data: {
      tested: regexr(txt, "Number Tested: "),
      confirmed: regexr(txt, "Positive: "),
      negative: regexr(txt, "Negative: "),
      updated: cleanTimestamp(txt)
    }
  };
};

module.exports = core;
