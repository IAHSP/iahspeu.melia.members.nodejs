// Functionality for 'set_user_approved' endpoint
// ========




class ApproveUser {
  constructor(theService) {
    this.Service = theService;
  }
  async setUserApproved(theUID){
    return await this.Service.setUserApproved(theUID);
  }
  async setUserDeclined(theUID, theReason, theNotes){
    return await this.Service.setUserDeclined(theUID, theReason, theNotes);
  }
}

module.exports = ApproveUser;
