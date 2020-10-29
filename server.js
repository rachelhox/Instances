const express = require("express");
const bodyParser = require("body-parser");

const port = 5000;

const server = express();

server.set("view engine", "ejs");

server.get("/", (req, res) => {
  res.render("index");
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}.`);
});
