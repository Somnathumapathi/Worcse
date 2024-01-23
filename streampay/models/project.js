class Project {
    constructor(projectName, projectId, supplyProviderId, dcId, completionStatus, funds, projectFile) {
        this.projectName = projectName
        this.projectId = projectId
        this.supplyProviderId = supplyProviderId
        this.dcId = dcId
        this.completionStatus = completionStatus
        this.funds = funds
        this.projectFile = projectFile
    }
}
export default Project