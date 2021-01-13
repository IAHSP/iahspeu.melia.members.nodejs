// Functionality for 'register' endpoint
// ========

class Registration {
  constructor() {
    //this.Service = theService;
    this.currentError = "Default Error Text for Registration Class";
  }

  saveUploadedFiles(body, Service) {
    //
    console.log('being called from class.registration.js. saveUploadedFiles was called.');
  }


  // this is to handle the form submission
  async createNewUser(userData, Service){
    // recieve the files, and temporarily store them
    try {
      //
    } catch (err) {
      //
    }

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
