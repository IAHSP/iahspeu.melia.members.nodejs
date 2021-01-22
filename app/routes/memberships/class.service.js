// Functionality for all external communication
// ========
var stripeKeys = require("../../utilities/data/stripe-keys.json");
var serviceAccount = require("../../utilities/data/firebase-service-account-key.json");
var otherSecrets  = require("../../utilities/data/other-secrets.json");

const admin = require("firebase-admin");
const stripe = require('stripe')(stripeKeys.secret_key);



admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: otherSecrets.database_url
});

// ================================================================
/**
 * The Service class is used for all the external communications,
 * to things, like the firestore.
 */
// ================================================================
class Service {
  constructor() {
    this.db = admin.firestore();
    this.currentError = "gabe";
  }

  getCurrentError() {
    return this.currentError;
  }

  // ================================================================
    /**
    * Set User's isApproved field to true
    *
    * @param   theUID  the document ID that belongs to this user.
    * @return          true on successful update of db, false on error.
    */
  // ================================================================
  async setUserApproved(theUID){
    let status = null;
    const usersRef = this.db.collection('users');
    try {
      //NOTE!  using .set() will override everything
      //       using .update() will update only the fields provided,
      //       while the rest of the fields stay intact.
      status = await usersRef.doc(theUID).update({
        "isApproved" : true
      });
    } catch (err) {
      status = false;
      console.log(`Unable to update document: '${theUID}' because of error:  ${err}`);
    }

    return status;
  } // setUserApproved()

  // ================================================================
  /**
  * Retrieve a JSON list of users who's isApproved field is false;
  *
  * @return          JSON list of users.
  */
  // ================================================================
  async getUnapprovedUsers(){
    const usersRef = this.db.collection('users');
    let payload = {};

    try {
      const unapprovedUsers = await usersRef.where('isApproved', '==', false).get();
      unapprovedUsers.forEach(doc => {
        //running thru a foreach so we can deliver cleaned data.
        //the raw data had too much info in it, including the key
        //console.log(doc.id, '=>', doc.data());
        payload[doc.id] = doc.data();
      });
    } catch(err) {
      console.log(`Unable to grab unapprovedUsers from firestore because error: ${err}`);
      return "Error retrieving documents.";
    }
    return payload;
  } // getUnapprovedUsers()

  // ================================================================
  /**
  * Create a new user in the db, and set the fields
  *
  * @param userData  JSON obj containing the user info
  * @return          true on success, false on failure;
  */
  // ================================================================
  async createNewUser(userData) {
    let userID = false;
    let setDoc = null;
    let isSuccess = false;
    let finalResults = {
      "status" : false,
      "payload" : null
    };


    const strPhotoURL = `${otherSecrets.cloudfront_url}/web/images/member-no-photo.jpg`;
    //console.log(`strPhotoURL: ${strPhotoURL}`);

    //using this as a default date, to speicy after they have been approved, that they still
    //still need to pay for registration
    const strDefaultExpiration = "0000-00-00";

    //create the new user
   return await admin.auth().createUser({
    email: userData.email,
    emailVerified: false,
    password: userData.password,
    displayName: userData.firstName + " " + userData.lastName,
    photoURL: strPhotoURL,
    disabled: false
  })
  .then(async (userRecord) => {
    //console.log(`userRecord is this: ${userRecord}`);
    if (userRecord) {
      //user creation wroked
      userID = userRecord.uid;
      console.log("Successfully created new user: " + userID);


      const usersRef = this.db.collection('users');
      setDoc = await usersRef.doc(userRecord.uid).set({
        displayName: userRecord.displayName,
        email: userRecord.email,
        photoURL : strPhotoURL,

        // Additional meta.
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        vatNumber: userData.vatNumber,
        address1: userData.address1,
        address2: userData.address2,
        city: userData.city,
        // state: userData.strContactState,
        zip: userData.zip,
        countryCustom: userData.country,
        country: userData.country,
        isAdmin: false,
        isDisabled: userRecord.disabled,
        isApproved: false,
        expiration: userData.expiration,
        course: userData.course,
        description: userData.description,

        showPhone: false,


        businessName: userData.businessName,
        businessEmail: userData.businessEmail,
        urlWeb: userData.urlWeb,
        urlLinkedIn: userData.urlLinkedIn,
        urlFacebook: userData.urlFacebook,
        urlInstagram: userData.urlInstagram,
        urlPinterest: userData.urlPinterest,
        dob: userData.dob,
        nationalAssociation: userData.nationalAssociation,
        checkboxEthicsCode: userData.checkboxEthicsCode,
        checkboxStatue: userData.checkboxStatue,
        checkboxTermsConditions: userData.checkboxTermsConditions,
        checkboxPrivacyPolicy: userData.checkboxPrivacyPolicy,
        txtHowFoundUs: userData.txtHowFoundUs,
        txtYearsInBusiness: userData.txtYearsInBusiness,
        initialSignUp: userData.initialSignUp,

        // ASP Info
        isASP: false,
        aspid: null
      });

      isSuccess = true;

      finalResults['status'] = isSuccess;
      finalResults['payload'] = userID;

      return finalResults;
    } else {
      //user creation gracefully failed
      //console.log(`the .then was executed even though the user was not created...`);
      finalResults['status'] = false;
      finalResults['payload'] = null;
      return finalResults;
    }
  })
  .catch((err) => {
    this.currentError = `Error creating User, because: ${err}`;
    console.log(this.currentError);
    finalResults['status'] = false;
    finalResults['payload'] = this.currentError;
    return finalResults;
  }); // admin.auth().createUser()

  //return {
    //"status" : true,
    //"payload" : userID
  //}

  } // createNewUser()

  // ================================================================
  /**
  * Retrieve a JSON list of users who's isApproved field is false;
  *
  * @return          JSON list of users.
  */
  // ================================================================
  async chargeCreditCard(userCardInfo){
    let success = false;
    let token = null;
    let tokenID = null;
    let tokenError = "";
    let charge = null;
    let chargeID = null;
    let chargeError = "";

    let finalResults = {
      "status" : false,
      "payload" : null
    };

    try{
      token = await stripe.tokens.create({
        card: {
          number: userCardInfo.strBillingCardNum,
          exp_month: userCardInfo.strBillingMonth,
          exp_year: userCardInfo.strBillingYear,
          cvc: userCardInfo.strBillingSecurityCode,
        },
      });
    } catch (err) {
      tokenError = err.message;
      console.log(`Error creating token for credit card.  The error is: ${err}`);
      console.log(tokenError);
    }
    // if token isset
    if (tokenError === "") {
      console.log(`Token successfully created: ${token}`);
      success = true;
      tokenID = token.id;
    } else {
      success = false;
      tokenID = "error";
    }

    if (success === true) {
      //console.log('successfully entered charge section');

      try {
        success = false;
        charge = await stripe.charges.create({
          amount: 2000,
          currency: 'usd',
          source: tokenID,
          description: 'My First Test Charge (created for API docs)',
        });
      } catch(err) {
        success = false;
        chargeError = err.message;
        console.log(`Could not charge credit card, because of error: ${err}`);
      }

      // if charge isset, we set to null up top
      if (charge !== null) {
        success = true;
        chargeID = charge.id;
      } else {
        success = false;
        charge = null;
        chargeID = "error";
      }
    }

    finalResults['status'] = success;
    finalResults['payload'] = {
      token: tokenID,
      charge: chargeID,
      tokenMessage: tokenError,
      chargeMessage: chargeError
    };

    return finalResults;
  } // chargeCreditCard()

} // Service()

module.exports = new Service;
