// Functionality for 'set_user_approved' endpoint
// ========




class ApproveUser {
  constructor(theService) {
    this.Service = theService;
  }
  async setUserApproved(theUID){
    return await this.Service.setUserApproved(theUID);
  }
  async setUserDeclined(theUID){
    return await this.Service.setUserDeclined(theUID);
  }
}

module.exports = ApproveUser;
