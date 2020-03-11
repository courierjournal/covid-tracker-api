const app = require("express")();
const port = 3000;

//Dynamically load our scrapers
const stateMap = require("./supported-states.json");
let scrapers = {};
stateMap.forEach(n => {
  scrapers[n.label] = require(`./scrapers/${n.label}/${n.label}`);
});

/* GET all data for a particular state */
app.get("/api/:state/:id?", async (req, res) => {
  //Get params
  let state = req.params.state;
  let id = req.params.id;
  if (state) {
    state = state.toLowerCase();
  }
  if (!stateMap.find(n => n.abbr === state)) {
    res.status(400).send("Requested state not yet supported");
  } else {
    let thisState = stateMap.find(n => n.abbr === state)
    let data = await scrapers[thisState.label](id);
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
