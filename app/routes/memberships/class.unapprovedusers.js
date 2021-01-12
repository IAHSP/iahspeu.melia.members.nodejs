// Functionality for 'get_unapproved_users' endpoint
// ========




class UnapprovedUsers {
  constructor(theService) {
    this.Service = theService;
  }
  async getUnapprovedUsers(){
    return await this.Service.getUnapprovedUsers();
  }
}

module.exports = UnapprovedUsers;
