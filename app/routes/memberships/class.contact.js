const Service = require( './class.service');

// Functionality for 'contact_modal' endpoint
// ========

class Contact {

  constructor() {
  }


  async sendAgentEmail(data) {
    return await Service.contactFormEmailSend(data);
  } // sendAgentEmail
}

module.exports = new Contact;
