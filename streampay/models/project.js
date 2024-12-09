class Project {
    constructor(projectName, projectId, supplyProviderId, dcId, completionStatus, funds, projectFile, endDate, terms) {
        this.projectName = projectName
        this.projectId = projectId
        this.supplyProviderId = supplyProviderId
        this.dcId = dcId
        this.completionStatus = completionStatus
        this.funds = funds
        this.projectFile = projectFile,
        this.endDate = endDate,
        this.terms = terms
    }
}
export default Project