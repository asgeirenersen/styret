define(function () {

    var CaseManager = function (config, folderManager) {
        this.config = config;
        this.folderManager = folderManager;
    };
    
    CaseManager.prototype.statusPossible = 'possible';
    CaseManager.prototype.statusOpen = 'open';
    CaseManager.prototype.statusClosed = 'closed';
    
    /**
     * 
     * @param {string} title
     * @param {string} description
     * @param {string} status
     * @returns {@this;@pro;folderManager@call;createFolder}
     */
    CaseManager.prototype.createCase = function (title, description, status) {
        var deferred,
            folderId = this.getFolderIdForStatus(status);

        deferred = this.folderManager.createFolder(
                title,
                description,
                folderId
        );

        return deferred;
    };
    
    /**
     * Gets the ID of the folder to use for cases with the given status.
     * 
     * @param {string} status
     * @throws {object}
     * @returns {string}
     */
    CaseManager.prototype.getFolderIdForStatus = function (status) {
        if (status === this.statusPossible) {
            return this.config.possibleCasesFolder;
        } else if (status === this.statusOpen) {
            return this.config.openCasesFolder;
        } else if (status === this.statusClosed) {
            return this.config.closedCasesFolder;
        }
        
        throw {
            error: 'No folder found for status ' + status,
            configUsed: this.config
        };
    };
    
    /**
     *
     * @param {int} year
     * @return {string} The highest existing case id in the system. (Highest year, highest number.)
     */
    CaseManager.prototype.getHighestCaseId = function (year) {
        var caseFolders,
            caseIds = [],
            highestId,
            name,
            id;

        caseFolders = this.getAllCases();
        for (i = 0; i < caseFolders.length; i++) {
            name = caseFolders[i].getName();
            id = getCaseIdFromString(name);
            if (validateCaseId(id) && getYearFromCaseId(id) === year) {
                caseIds.push(id);
            }
        }
        if (caseIds.length === 0) {
                return null; 
        }
        caseIds.sort();
        highestId = caseIds[caseIds.length - 1];

        return highestId;
    };
    
    CaseManager.prototype.getCasesByStatus = function (status) {
        var deferred,
            parentFolderId;

        parentFolderId = this.getFolderIdForStatus(status);
        deferred = this.folderManager.getFoldersByParentId(parentFolderId);
        
        return deferred;
    };
    
    CaseManager.prototype.getAllCases = function () {
        var deferred,
            ids = [];

        ids.append(this.getFolderIdForStatus(this.statusOpen));
        ids.append(this.getFolderIdForStatus(this.closedOpen));
        deferred = this.folderManager.getFoldersByParentId(ids);
        
        return deferred;
    };
 
    return CaseManager;
});