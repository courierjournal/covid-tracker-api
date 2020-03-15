const router = require("express").Router();
const cache = require("../middleware/cache");
const diskCache = require("../lib/disk-cache");

const routeConfig = require("../config/route-config.json");
const stateMap = require("../config/state-list.json");
const scrapers = require("../config/scrapers.json");

/* GET all data for a particular state */
router.get("/data/:state?", cache(routeConfig.v1.ttl), async (req, res) => {
  let state = req.params.state ? req.params.state.toLowerCase() : "us";
  if (state !== "us" && !stateMap.find(n => n.abbr === state)) {
    res.status(400).send("Requested state not found");
  } else {
    let data = await diskCache(state);
    res.json(data);
  }
});

/* GET source data */
router.get("/sources", (req, res) => {
  res.json(scrapers);
});

/* TODO: GET server stats */
router.get("/status/health", (req, res) => {});

/* TODO: GET scraping errors */
router.get("/status/errors", (req, res) => {});

module.exports = router;
