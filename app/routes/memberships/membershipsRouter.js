const express = require("express");
const app = express();

const bodyParser = require("body-parser");

const membershipsRouter = express.Router();


const Service = require( './class.service');
const Registration = require('./class.registration');
const UnapprovedUsers = require('./class.unapprovedusers');
const ApproveUser = require('./class.approveuser');

// Express Configuration
membershipsRouter.use(bodyParser.json());


//Lets load in all our classes
//Using a different class for each endpoint, in order to
//keep things organized.
//let service = new Service();
let unapprovedUsers = new UnapprovedUsers(Service);
let approveUser = new ApproveUser(Service);
//let registration = new Registration(Service);

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
