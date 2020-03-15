const express = require("express");
const v1 = require("./routes/v1");
const port = 3000;

//Setup ExpressJS instance
const app = express();

//Use /public to serve static files at the base route
app.use(express.static("public"));

//Include versioned routes for the api here
app.use("/api/v1/", v1);

//Run the server
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
