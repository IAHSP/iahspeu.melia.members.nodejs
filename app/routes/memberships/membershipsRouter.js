const express = require("express");
const app = express();

const cors = require("cors");
const bodyParser = require("body-parser");

const membershipsRouter = express.Router();


const Service = require( './class.service');
const Registration = require('./class.registration');
const UnapprovedUsers = require('./class.unapprovedusers');
const ApproveUser = require('./class.approveuser');
const Contact = require('./class.contact');

const corsWhiteList = JSON.parse(process.env.CORS_WHITELIST);
if (process.env.APP_ENVIRONMENT === 'dev') {
  corsWhiteList.push(undefined);
}


//const corsWhiteList = [
  //"https://iahsp.com",
  //"https://www.iahsp.com",
  //"https://members.iahspeurope.com",
  //"https://members-staging.iahspeurope.com",
  //undefined,
  //"http://localhost:4200"
//]; // corsWhiteList

const corsOptions = {
  origin: function (origin, callback) {
    //checking if !origin, is used in case we are testing this using
    //firebase serve --only functions.  Because then, origin is skipped
    //https://stackoverflow.com/questions/42589882/nodejs-cors-middleware-origin-undefined
    if (corsWhiteList.indexOf(origin) !== -1) {
      console.log(`${origin} passed CORS`);
      return callback(null, true);
    } else {
      console.log(`${origin} is not allowed by CORS`);
      return callback(new Error("Not allowed by CORS"));
    } // if
  } // origin: function()
}; // corsOptions

// parse application/json
const jsonBodyParser = bodyParser.json();
//membershipsRouter.use(jsonBodyParser);


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

membershipsRouter.route('/register')
  .all((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  })
  .post(async (req, res, next ) => {
    let finalResults = {
      "status" : false,
      "payload" : null
    }
    const milliToken = Date.now().toString();
    const filePath = __dirname + "/../../../uploads/" + milliToken;

    fileSaveSuccess = await Registration.processSubmission(req, res, filePath, milliToken);

  })
; // /register

membershipsRouter.route('/update_user_photo')
  .all((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  })
  .post(async (req, res, next ) => {
    let finalResults = {
      "status" : false,
      "payload" : null
    }
    // this is only a temp token for upload file storage purposes,
    // but the user's real milliToken has been passed in via req.body
    const tmp_milliToken = Date.now().toString();
    const filePath = __dirname + "/../../../uploads/" + tmp_milliToken;

    fileSaveSuccess = await Registration.changeUserPhoto(req, res, filePath);

  })
; // /register



membershipsRouter.route('/register_charge')
  .all((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  })
  .post(jsonBodyParser, async (req, res, next ) => {

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
  .post(jsonBodyParser, async (req, res, next ) => {

    let finalResults = {
      "status" : false,
      "payload" : null
    }

    const userID = req.body.uid;
    console.log(`UID to be approved is: ${userID}`);
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

membershipsRouter.route('/set_user_declined')
  .all((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  })
  .post(jsonBodyParser, async (req, res, next ) => {

    let finalResults = {
      "status" : false,
      "payload" : null
    }

    const userID = req.body.uid;
    const theReason = req.body.reason;
    const theNotes = req.body.notes;
    console.log(`UID to be declined is: ${userID}, reason: ${theReason}, notes: ${theNotes}`);
    // Determine function successes.
    try {
      success = await approveUser.setUserDeclined(userID, theReason, theNotes);
      finalResults['status'] = true;
      finalResults['payload'] = success;
    } catch(err) {
      console.log('approveUser.setUserDeclined failed because of error: ' + err);
      finalResults['status'] = err;
    }


    // Result is in JSON
    res.status(200).send(JSON.stringify(finalResults));
    res.end();

  })
; // /set_user_declined

membershipsRouter.route('/contact_modal')
  .all((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  })
  .post(jsonBodyParser, async (req, res, next ) => {

    let finalResults = {
      "status" : false,
      "payload" : null
    }

    //TODO: Verify Google ReCaptcha String before continuing

    // Determine function successes.
    try {
      console.log(req.body);
      success = await Contact.sendAgentEmail(req.body);
      finalResults['status'] = true;
      finalResults['payload'] = success;
    } catch(err) {
      console.log('Contact.contactFormEmailSend failed because of error: ' + err);
      finalResults['status'] = err;
    }


    // Result is in JSON
    res.status(200).send(JSON.stringify(finalResults));
    res.end();

  })
; // /set_user_declined

module.exports = membershipsRouter;
