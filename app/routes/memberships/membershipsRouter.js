const express = require("express");
const app = express();

const cors = require("cors");
const bodyParser = require("body-parser");

const membershipsRouter = express.Router();

const multer = require('multer');

const milliToken = Date.now().toString();
const filePath = __dirname + "/../../../uploads/" + milliToken;
console.log(`filePath: ${filePath}`);
const upload = multer({dest: filePath});

const Service = require( './class.service');
const Registration = require('./class.registration');
const UnapprovedUsers = require('./class.unapprovedusers');
const ApproveUser = require('./class.approveuser');

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

// Express Configuration
//membershipsRouter.use(bodyParser.json());


//Lets load in all our classes
//Using a different class for each endpoint, in order to
//keep things organized.
//let service = new Service();
let unapprovedUsers = new UnapprovedUsers(Service);
let approveUser = new ApproveUser(Service);
//let registration = new Registration(Service);

//membershipsRouter.options('/get_unapproved_users', cors(corsOptions)); // enable pre-flight request
membershipsRouter.all('*', cors(corsOptions)); // enable pre-flight request
membershipsRouter.route('/get_unapproved_users')
  .all((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  })
  .get(async (req, res, next ) => {

    let finalResults = {
      "status" : false,
      "payload" : null
    }

    // Determine function successes.
    try {
      myUnapprovedUsers = await unapprovedUsers.getUnapprovedUsers();
      finalResults['status'] = true;
      finalResults['payload'] = myUnapprovedUsers;
    } catch(err) {
      console.log('the try has failed. because of: ' + err);
      finalResults['status'] = err;
    }

    // Result is in JSON
    //res.setHeader('Content-Type', 'application/json');
    //res.status(200).send(JSON.stringify({ "status": greetTxt }));
    res.status(200).send(JSON.stringify(finalResults));
    res.end();

  })
; // /get_unapproved_users

membershipsRouter.route('/renew')
  .all((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  })
  .post(async (req, res, next ) => {

    const greetTxt = req.body.message;

    res.status(200).send(JSON.stringify({ "status": greetTxt }));
    res.end();

  })
; // /renew

const cpUpload = upload.fields(
  [
    {
      name: 'photoProfilePic', maxCount: 1
    },
    {
      name: 'fileCertificate', maxCount: 1
    }
  ]);

membershipsRouter.route('/register')
  .all((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  })
  .post(cpUpload, async (req, res, next ) => {
      console.log(`filePath: ${filePath}`);
    console.log('/register successfully triggered for post');
    console.log(req.body);
    let finalResults = {
      "status" : false,
      "payload" : null
    }

    Registration.saveUploadedFiles(req, Service).then(
      //
    ).catch((err) => {
      console.log('Registration.saveUploadedFiles has failed. because of: ' + err);
    });

    // Determine function successes.
    Registration.createNewUser(req.body, Service)
      .then((returnedResults) => {
        if (returnedResults.status === false) {
          //
        } else {
          console.log(`newUserID is this: ${returnedResults.payload}`);
        }

        finalResults['status'] = returnedResults.status;
        finalResults['payload'] = returnedResults.payload;


        // Result is in JSON
        res.setHeader('Content-Type', 'application/json');
        //res.status(200).send(JSON.stringify({ "status": greetTxt }));
        res.status(200).send(JSON.stringify(finalResults));
        res.end();

        return finalResults;
      })
      .catch((err) => {
        console.log('Registration.createNewUser has failed. because of: ' + err);
        finalResults['status'] = false;
        finalResults['payload'] = err;

        // Result is in JSON
        res.status(200).send(JSON.stringify(finalResults));
        res.end();
      })
      ;

  })
; // /renew



membershipsRouter.route('/register_charge')
  .all((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  })
  .post(async (req, res, next ) => {

    let finalResults = {
      "status" : false,
      "payload" : null
    }

    // Determine function successes.
    Registration.chargeCreditCard(req.body, Service)
      .then((returnedResults) => {
        if (returnedResults.status === false) {
          //
        } else {
          //console.log(`card Token is this: ${returnedResults.payload.token}`);
        }

        finalResults['status'] = returnedResults.status;
        finalResults['payload'] = returnedResults.payload;


        // Result is in JSON
        res.setHeader('Content-Type', 'application/json');
        //res.status(200).send(JSON.stringify({ "status": greetTxt }));
        res.status(200).send(JSON.stringify(finalResults));
        res.end();

        return finalResults;
      })
      .catch((err) => {
        console.log('Registration.chargeCreditCard has failed. because of: ' + err);
        finalResults['status'] = false;
        finalResults['payload'] = err;

        // Result is in JSON
        //res.status(200).send(JSON.stringify({ "status": greetTxt }));
        res.status(200).send(JSON.stringify(finalResults));
        res.end();
      })
      ;

  })
; // /register_charge


membershipsRouter.route('/set_user_approved')
  .all((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  })
  .post(async (req, res, next ) => {

    let finalResults = {
      "status" : false,
      "payload" : null
    }

    const userID = req.body.uid;

    // Determine function successes.
    try {
      success = await approveUser.setUserApproved(userID);
      finalResults['status'] = true;
      finalResults['payload'] = success;
    } catch(err) {
      console.log('approveUser.setUserApproved failed because of error: ' + err);
      finalResults['status'] = err;
    }


    // Result is in JSON
    res.status(200).send(JSON.stringify(finalResults));
    res.end();

  })
; // /set_user_approved

module.exports = membershipsRouter;
