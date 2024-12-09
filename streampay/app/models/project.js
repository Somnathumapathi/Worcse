export default class Project {
    constructor(projectName, projectId, supplyProviderId, dcId, completionStatus, funds, endDate, terms, termDate) {
      this.projectName = projectName;
      this.projectId = projectId;
      this.supplyProviderId = supplyProviderId;
      this.dcId = dcId;
      this.completionStatus = completionStatus;
      this.funds = funds;
      this.endDate = endDate;
      this.terms = terms;
      this.termDate = termDate;
    }
  }
  