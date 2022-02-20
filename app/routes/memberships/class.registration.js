const multer = require('multer');
const Service = require( './class.service');

// Functionality for 'register' endpoint
// ========

class Registration {

  constructor() {
    //this.Service = theService;
    this.currentError = "Default Error Text for Registration Class";


    this.finalResults = {
      "status" : false,
      "payload" : 'initial'
    }

    this.userData = null;
  }

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  setUserDataForCreation(userData) {
    this.userData = userData;
    //console.log('setUserDataForCreation has successfully been called, userData to follow:');
    //console.log(this.userData);
  }

  getUserDataForCreation() {
    return this.userData;
  }

  async processSubmission(req, res, filePath, milliToken) {
    //let fileSaveSuccess = true;

    this.finalResults = {
      "status" : false,
      "payload" : 'initial2'
    }

    const upload = multer({dest: filePath});
    const cpUpload = upload.fields(
      [
        {
          name: 'photoProfilePic', maxCount: 1
        },
        {
          name: 'fileEuAffilAssocCert', maxCount: 1
        },
        {
          name: 'fileEuHomeStageCourseCert', maxCount: 1
        },
        {
          name: 'fileProHomeStagerYetCert', maxCount: 1
        },
        {
          name: 'photosWorkExamples[]', maxCount: 10
        }
      ]);


    console.log(`current registration files being saved to filePath: ${filePath}`);

    cpUpload(req, res, async (err) => {
      const fs = require('fs');

      console.log('this is the req.files obj from within cpUpload');
      console.log(req.files);
      //console.log(req.body);
      if (typeof err !== 'undefined') {
        myCurrentError = `Could not save files because of error: ${err}`;
        console.log(myCurrentError);
        this.finalResults['status'] = false;
        this.finalResults['payload'] = myCurrentError;

        res.status(200).send(JSON.stringify(this.finalResults));
        res.end();

        return this.finalResults;
      }

      if (typeof req.files !== 'undefined') {

        // lets first inject the fire storage ID for this user into the user data
        // so it gets stored with this user
        req.body.milliToken = milliToken;

        let newUserID = false;

        // lets also inject the number of files to loop over for work examples.
        // this will be used on the approval page, showing the person's work,
        // and maybe even on the member page, if that gets implemented.
        const filesCount = (req.files['photosWorkExamples[]'] !== undefined) ? Object.keys(req.files['photosWorkExamples[]']).length : 0;
        req.body.photosWorkExampleCount = filesCount;

        //req.body.milliToken = milliToken;
        await this.createNewUser(req.body, Service)
          .then((returnedResults) => {
            if (returnedResults.status === false) {
              newUserID = false;
            } else {
              newUserID = returnedResults.payload;
              console.log(`newUserID is this: ${newUserID}`);
            }

            this.finalResults['status'] = returnedResults.status;
            this.finalResults['payload'] = returnedResults.payload;


            // Result is in JSON
            //res.setHeader('Content-Type', 'application/json');
            //res.status(200).send(JSON.stringify({ "status": greetTxt }));
            //res.status(200).send(JSON.stringify(this.finalResults));
            //res.end();

            return this.finalResults;
          }) //.then
          .catch((err) => {
            console.log('Registration.createNewUser has failed. because of: ' + err);
            this.finalResults['status'] = false;
            this.finalResults['payload'] = err;

            //we need to delete the files here, because the code block will end here.
            //so it wont reach the deletion of files below.
            this.deleteFileDirectory(filePath);

            // Result is in JSON
            res.status(200).send(JSON.stringify(this.finalResults));
            res.end();
          })
        ; //.catch

        //assuming user creation was successful, we can now process the files
        if (newUserID !== false) {
          console.log(`Found newUserID: ${newUserID}, so now file foreach can begin.`);
          const fileKeys = Object.keys(req.files);

          await this.asyncForEach(fileKeys, async (key) => {
            if (key === 'photosWorkExamples[]') {
              //handle the multi upload
              req.files[key].forEach(async (v, k) => {
                //console.log(`k: ${k} , v: ${v}`);
                //console.log(v);
                const originalFilename = v.originalname;
                const originalFileExtension = originalFilename.split('.').pop();
                const currentFilename = v.filename;
                const currentPath = v.destination;
                //tmpFilePath = currentPath; //storing directory so we can delete it after the foreach
                const newFilename = `photosWorkExamples-${k+1}.${originalFileExtension}`;
                //console.log(`newFilename: ${newFilename}`);

                fs.rename(`${currentPath}/${currentFilename}`, `${currentPath}/${newFilename}`, (err) => {
                  if ( err ) {
                    myCurrentError = 'Error trying to rename file: ' + err;
                    console.log(myCurrentError);
                    this.finalResults['status'] = false;
                    this.finalResults['payload'] = myCurrentError;
                  }
                });
                await Service.uploadFile(`${currentPath}/${newFilename}`, `${milliToken}/${newFilename}`)
                  .catch((err) => {
                    console.log(`unable to upload ${newFilename} to fire storage because error: ${err}`);
                  })
                ;
              });
            } else {
              //all other uploads
              const originalFilename = req.files[key][0].originalname;
              const originalFileExtension = originalFilename.split('.').pop();
              const currentFilename = req.files[key][0].filename;
              const currentPath = req.files[key][0].destination;
              //tmpFilePath = currentPath; //storing directory so we can delete it after the foreach
              const newFilename = `${key}.${originalFileExtension}`;
              //console.log(`newFilename: ${newFilename}`);

              fs.rename(`${currentPath}/${currentFilename}`, `${currentPath}/${newFilename}`, (err) => {
                  if ( err ) {
                    myCurrentError = 'Error trying to rename file: ' + err;
                    console.log(myCurrentError);
                    this.finalResults['status'] = false;
                    this.finalResults['payload'] = myCurrentError;
                  }
              });
              const cacheBust = Date.now().toString();
              const thePicURL = `https://firebasestorage.googleapis.com/v0/b/iahsp-europe.appspot.com/o/${milliToken}%2F${newFilename}?alt=media&cachebust=${cacheBust}`;
              await Service.updateFileField(newUserID, `photoURL`, thePicURL)
                .then((d) => {
                  console.log(`new user registration, just updated thePicURL to the correct one.`);
                  return d;
                })
                .catch();
              await Service.uploadFile(`${currentPath}/${newFilename}`, `${milliToken}/${newFilename}`)
                .catch((err) => {
                  console.log(`unable to upload ${newFilename} to fire storage because error: ${err}`);
                })
              ;
            }
          }); //forEach

        } // if newUserID

        // At this part of the code, either the file foreach is done,
        // or user creation failed, and the file foreach didn't occur,
        // but either way, its now time to delete the tmp file directory,
        // because the uploaded files still exist in it.
        // recursive, ensures it can do it even if it's not empty
        this.deleteFileDirectory(filePath);

      } //if (typeof req.files !== 'undefined')

      console.log(`cpUpload has concluded, and the following is the global this.finalResults.`);
      console.log(this.finalResults);

      res.status(200).send(JSON.stringify(this.finalResults));
      res.end();
    }); //cpUpload

    //console.log(`cpUpload has concluded, and the following is the global this.finalResults.`);
    //console.log(this.finalResults);

    //sending json and ending here doesn't work, i had to do it from within the cpUpload function, otherwise
    //i can not get useful data into this.finalResults.
    //res.status(200).send(JSON.stringify(this.finalResults));
    //res.end();

    return this.finalResults;
  } // processSubmission

  async processAdminAddNewUser(req, res, filePath, milliToken) {
    //console.log('processAdminAddNewUser successfully called.');
    //console.log(req.body);

    // lets take the items in the body, and build out the real object to be inserted.
    const finalFields = {
      address1: req.body.address1,
      address2: req.body.address2,
      aspid: null,
      businessEmail: req.body.businessEmail,
      businessName: req.body.businessName,
      checkboxEthicsCode: '',
      checkboxPrivacyPolicy: '',
      checkboxStatue: '',
      checkboxTermsConditions: '',
      city: req.body.city,
      country: req.body.country,
      countryCustom: req.body.country,
      description: req.body.description,
      displayName: req.body.displayName,
      dob: '',
      email: req.body.email,
      euAffilicatedAssociation: '',
      euHomeStagingCourse: '',
      expiration: req.body.expiration,
      firstName: req.body.firstName,
      initialSignUp: req.body.initialSignUp,
      isASP: false,
      isAdmin: false,
      isApproved: true,
      isDisabled: false,
      lastName: req.body.lastName,
      milliToken: milliToken,
      phone: req.body.phone,
      photoURL: 'https://upload.wikimedia.org/wikipedia/en/b/b1/Portrait_placeholder.png',
      photosWorkExampleCount: 0,
      showPhone: req.body.showPhone,
      txtHowFoundUs: '',
      txtYearsInBusiness: '',
      urlFacebook: req.body.urlFacebook,
      urlInstagram: req.body.urlInstagram,
      urlLinkedIn: req.body.urlLinkedIn,
      urlPinterest: req.body.urlPinterest,
      urlWeb: req.body.urlWeb,
      vatNumber: req.body.vatNumber,
      zip: req.body.zip
    }

    return await Service.createNewUser(finalFields, true);
  }

  async changeUserPhoto(req, res, filePath) {
    //let fileSaveSuccess = true;

    this.finalResults = {
      "status" : true,
      "payload" : 'n/a'
    }

    const upload = multer({dest: filePath});
    const cpUpload = upload.fields(
      [
        {
          name: 'photoProfilePic', maxCount: 1
        }
      ]);


    cpUpload(req, res, async (err) => {
      const fs = require('fs');

      const milliToken = req.body.milliToken;
      const newUserID = req.body.uid;
      console.log(req.files);
      //console.log(req.body);

      if (typeof err !== 'undefined') {
        myCurrentError = `Could not save files because of error: ${err}`;
        console.log(myCurrentError);
        this.finalResults['status'] = false;
        this.finalResults['payload'] = myCurrentError;

        res.status(200).send(JSON.stringify(this.finalResults));
        res.end();

        return this.finalResults;
      }

      if (typeof req.files !== 'undefined') {

        //assuming user creation was successful, we can now process the files
        if (newUserID !== false) {
          //const fileKeys = Object.keys(req.files);

          const originalFilename = req.files['photoProfilePic'][0].originalname;
          const originalFileExtension = originalFilename.split('.').pop();
          const currentFilename = req.files['photoProfilePic'][0].filename;
          const currentPath = req.files['photoProfilePic'][0].destination;
          //tmpFilePath = currentPath; //storing directory so we can delete it after the foreach
          const newFilename = `${'photoProfilePic'}.${originalFileExtension}`;
          //console.log(`newFilename: ${newFilename}`);

          fs.rename(`${currentPath}/${currentFilename}`, `${currentPath}/${newFilename}`, (err) => {
              if ( err ) {
                myCurrentError = 'Error trying to rename file: ' + err;
                console.log(myCurrentError);
                this.finalResults['status'] = false;
                this.finalResults['payload'] = myCurrentError;
              }
          });

          const cacheBust = Date.now().toString();
          const thePicURL = `https://firebasestorage.googleapis.com/v0/b/iahsp-europe.appspot.com/o/${milliToken}%2F${newFilename}?alt=media&cachebust=${cacheBust}`;
          await Service.updateFileField(newUserID, `photoURL`, thePicURL);
          await Service.uploadFile(`${currentPath}/${newFilename}`, `${milliToken}/${newFilename}`)
            .catch((err) => {
              console.log(`unable to upload ${newFilename} to fire storage because error: ${err}`);
            })
          ;

        } // if newUserID

        // At this part of the code, either the file foreach is done,
        // or user creation failed, and the file foreach didn't occur,
        // but either way, its now time to delete the tmp file directory,
        // because the uploaded files still exist in it.
        // recursive, ensures it can do it even if it's not empty
        this.deleteFileDirectory(filePath);

      } //if (typeof req.files !== 'undefined')

      console.log(`cpUpload has concluded, and the following is the global this.finalResults.`);
      console.log(this.finalResults);

      res.status(200).send(JSON.stringify(this.finalResults));
      res.end();
    }); //cpUpload

    //console.log(`cpUpload has concluded, and the following is the global this.finalResults.`);
    //console.log(this.finalResults);

    //sending json and ending here doesn't work, i had to do it from within the cpUpload function, otherwise
    //i can not get useful data into this.finalResults.
    //res.status(200).send(JSON.stringify(this.finalResults));
    //res.end();

    return this.finalResults;
  } // processSubmission

  // this is to delete the temporary dir that stores the user's
  // files before they have been uploaded to firebase storage
  deleteFileDirectory(filePath) {
    const fs = require('fs');

    console.log(`${filePath} will now be deleted.`);
    fs.rmdir(filePath, { recursive: true }, (err) => {
      if (err) {
        console.log(`Could not delete ${filePath} because of error: ${err}`);
      } else {
        console.log(`${filePath} has been successfully deleted.`);
      }
    });
  }


  // this is to handle the form submission
  async createNewUser(userData, Service){

    console.log('userData from within createNewUser method: ');
    console.log(userData);

    // create the user
    try {
      const myResults = await Service.createNewUser(userData);
      //console.log('myResults: ', myResults);
      return myResults;
    } catch(err) {
      return {
        "status" : false,
        "payload" : `Error: ${err}`
      }
    }
  } // createNewUser()

  async chargeCreditCard(cardData, Service){
    try{
      const myResults = await Service.chargeCreditCard(cardData);
      return myResults;
    } catch(err) {
      return {
        "status" : false,
        "payload" : `Error: ${err}`
      }
    }
  } // chargeCreditCard()
}

module.exports = new Registration;
