const functions = require('firebase-functions');
const bodyParser = require("body-parser");
//const https = require("https");
const cors = require("cors");

const express = require("express");
const app = express();

// Express Configuration
app.use(bodyParser.json());

const corsWhiteList = [
    "https://iahsp.com", "https://www.iahsp.com",
    "http://localhost:4200"

]; // corsWhiteList
const corsOptions = {
  origin: function (origin, callback) {
    //checking if !origin, is used in case we are testing this using
    //firebase serve --only functions.  Because then, origin is skipped
    //https://stackoverflow.com/questions/42589882/nodejs-cors-middleware-origin-undefined
    if (corsWhiteList.indexOf(origin) !== -1 || !origin) {
      return callback(null, true);
    } else {
      console.log(`${origin} is not allowed by CORS`);
      return callback(new Error("Not allowed by CORS"));
    } // if
  } // origin: function()
}; // corsOptions

app.options('/', cors(corsOptions)); // enable pre-flight request
app.get("/", cors(corsOptions), (req, res, next )=> {
  // Determine function successes.
  const greetTxt = "Hello";


  // Result is in JSON
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify({ "status": greetTxt }));
  res.end();

}); // app.get()

module.exports = functions.https.onRequest(app);
