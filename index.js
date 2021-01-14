const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');

const cors = require("cors");

const membershipsRouter = require('./app/routes/memberships/membershipsRouter');
const hostname = 'localhost';
const port = 5000;

const app = express();


const corsWhiteList = [
  "https://iahsp.com",
  "https://www.iahsp.com",
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



//app.use(bodyParser.json());

//app.options('/memberships', cors(corsOptions)); // enable pre-flight request
app.use('/memberships', membershipsRouter);
//app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(`<html><body><h1>This is an Express server</h1></body></html>`);
});

const server = http.createServer(app);

server.listen(port, hostname, () => {
  console.log(`Sever running at http://${hostname}:${port}`);
});
