const app = require("express")();
const cache = require("./middleware/cache");
const scraper = require("./scrapers/scraper-core");
const stateMap = require("./supported-states.json");
const port = 3000;

/**************/
/*** ROUTES ***/
/**************/

/* GET all data for a particular state */
app.get("/api/status/:state/:id?", cache(300), async (req, res) => {
  //Get params
  let state = req.params.state;
  let id = req.params.id;
  if (state) {
    state = state.toLowerCase();
  }
  if (!stateMap.find(n => n.abbr === state)) {
    res.status(400).send("Requested state not yet supported");
  } else {
    let data = await scraper(state, id);
    res.json(data);
  }
});

/* GET all states that are supported */
app.get("/api/supported-states", (req, res) => {
  res.json(stateMap);
});

/* TODO: GET server stats */
app.get("/api/health", (req, res) => {});

/* TODO: GET scraping errors */
app.get("/api/errors", (req, res) => {});

//Run the server
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
