const multer = require('multer');

// Functionality for 'register' endpoint
// ========

class Registration {

  constructor() {
    //this.Service = theService;
    this.currentError = "Default Error Text for Registration Class";


    this.saveUploadFinalResults = {
      "status" : true,
      "payload" : 'initial'
    }

    this.userData = null;
  }

  setUserDataForCreation(userData) {
    this.userData = userData;
    //console.log('setUserDataForCreation has successfully been called, userData to follow:');
    //console.log(this.userData);
  }

  getUserDataForCreation() {
    return this.userData;
  }

  saveUploadedFiles(req, res, filePath) {
    let fileSaveSuccess = true;

    const upload = multer({dest: filePath});
    const cpUpload = upload.fields(
      [
        {
          name: 'photoProfilePic', maxCount: 1
        },
        {
          name: 'fileCertificate', maxCount: 1
        },
        {
          name: 'photosWorkExamples[]', maxCount: 10
        }
      ]);


    console.log(`current registration files being saved to filePath: ${filePath}`);

    cpUpload(req, res, (err) => {
      const fs = require('fs');

      this.setUserDataForCreation(req.body);


      //console.log(req.files);
      //console.log(req.body);
      if (typeof err !== 'undefined') {
        myCurrentError = `Could not save files because of error: ${err}`;
        console.log(myCurrentError);
        saveUploadFinalResults['status'] = false;
        saveUploadFinalResults['payload'] = myCurrentError;
      }

      if (typeof req.files !== 'undefined') {
        const fileKeys = Object.keys(req.files);
        fileKeys.forEach((key) => {
          if (key === 'photosWorkExamples[]') {
            //handle the multi upload
            req.files[key].forEach((v, k) => {
              //console.log(`k: ${k} , v: ${v}`);
              //console.log(v);
              const originalFilename = v.originalname;
              const originalFileExtension = originalFilename.split('.').pop();
              const currentFilename = v.filename;
              const currentPath = v.destination;
              const newFilename = `photosWorkExamples-${k+1}.${originalFileExtension}`;
              //console.log(`newFilename: ${newFilename}`);

              fs.rename(`${currentPath}/${currentFilename}`, `${currentPath}/${newFilename}`, (err) => {
                if ( err ) {
                  myCurrentError = 'Error trying to rename file: ' + err;
                  console.log(myCurrentError);
                  saveUploadFinalResults['status'] = false;
                  saveUploadFinalResults['payload'] = myCurrentError;
                }
              });
            });
          } else {
            //all other uploads
            const originalFilename = req.files[key][0].originalname;
            const originalFileExtension = originalFilename.split('.').pop();
            const currentFilename = req.files[key][0].filename;
            const currentPath = req.files[key][0].destination;
            const newFilename = `${key}.${originalFileExtension}`;
            //console.log(`newFilename: ${newFilename}`);

            fs.rename(`${currentPath}/${currentFilename}`, `${currentPath}/${newFilename}`, (err) => {
                if ( err ) {
                  myCurrentError = 'Error trying to rename file: ' + err;
                  console.log(myCurrentError);
                  saveUploadFinalResults['status'] = false;
                  saveUploadFinalResults['payload'] = myCurrentError;
                }
            });
          }
        });

      } //cpUpload
    });

    return true;
  } // saveUploadedFiles


  // this is to handle the form submission
  async createNewUser(userData, Service){

    console.log('userData: ');
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
