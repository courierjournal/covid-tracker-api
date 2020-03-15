const axios = require("axios");
const cheerio = require("cheerio");

const scraperId = "ky200";

//Take this string of 'Current as of March 13, 2020 at 5 p.m. Eastern time' and convert to milliseconds
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
  return Math.floor(new Date(el[0] + " " + el[1]).getTime());
};

//Take a string and parse out text immediately after the needle
let regexr = (str, needle) => {
  let re = new RegExp(`${needle}(\\d+)`);
  let matches = str.match(re);

  if (matches.length > 0) {
    return parseInt(matches[1]);
  }
};

let core = async () => {
  let url = "https://chfs.ky.gov/agencies/dph/pages/covid19.aspx";
  let res = {};

  try {
    let query = await axios(url, { timeout: 20000 });

    res = {
      ok: true,
      data: query.data
    };
  } catch (err) {
    res = {
      ok: false,
      msg: err
    };
  }

  if (res.ok) {
    const $ = cheerio.load(res.data);
    const txt = $(
      "#ctl00_ctl00_PlaceHolderContentFromChild_PlaceHolderContent_ctl01__ControlWrapper_RichHtmlField > div"
    ).text();

    res.results = [
      {
        state: "ky",
        id: scraperId,
        raw: [
          { label: "confirmed", value: regexr(txt, "Positive: ") },
          { label: "tested", value: regexr(txt, "Number Tested: ") },
          { label: "negative", value: regexr(txt, "Negative: ") },
          { label: "updated", value: cleanTimestamp(txt) }
        ],
        counties: []
      }
    ];
  }

  return res;
};

module.exports = core;
