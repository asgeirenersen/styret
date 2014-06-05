define([
    'model/google/folder/FolderManager'
], function (FolderManager) {

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
 
    return CaseManager;
});