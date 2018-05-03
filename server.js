"use strict";
const tokens = require("./apiData/twilioInfo.js")
require('dotenv').config();

const PORT           = process.env.PORT || 8080;
const ENV            = process.env.ENV || "development";
const express        = require("express");
const bodyParser     = require("body-parser");
const sass           = require("node-sass-middleware");
const methodOverride = require("method-override");
const app            = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

const twilioAccountSid  = tokens.twilioID;
const twilioToken       = tokens.twilioToken;
const twilio            = require('twilio');
const twilioClient      = new twilio(twilioAccountSid,twilioToken);


// Seperated Routes for each Resource
const usersRoutes = require("./routes/users")(knex);
const restoRoutes = require("./routes/restaurant")(knex);
const smsRoutes = require("./routes/sms")();


// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));
// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));
app.use(methodOverride("_method"));

// Mount all resource routes
// app.use("/api/users", usersRoutes);
app.use("/restaurants", restoRoutes);

// Home page
app.get("/", (req, res) => {
  res.render("index");
});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
