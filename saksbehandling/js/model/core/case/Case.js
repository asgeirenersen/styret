define([], function () {
    
    /**
     * Constructor methods for Case objects.
     *
     * @param {string} caseId Format: YYYY-nnnn
     * @param {string} folderId Google Drive folder id
     * @param {string} title
     * @param {string} description
     * @param {string} status One of "open", "closed", "possible"
     * @returns {_L1.Case}
     */
    var Case = function (caseId, folderId, title, description, status) {
        this.caseId = caseId;
        this.folderId = folderId;
        this.title = title;
        this.description = description,
        this.status = status;
    };
    
    return Case;
});

