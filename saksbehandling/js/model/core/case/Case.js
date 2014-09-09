define([], function () {

    /**
     * Constructor methods for Case objects.
     *
     * @param {string} caseId Format: YYYY-nnnn
     * @param {string} folderId Google Drive folder id
     * @param {string} title
     * @param {string} status One of "open", "closed", "possible"
     * @returns {_L1.Case}
     */
    var Case = function (caseId, folderId, title, status, owner, url) {
        this.caseId = caseId;
        this.folderId = folderId;
        this.title = title;
        this.status = status;
        this.owner = owner;
        this.url = url;
    };

    Case.prototype.getStatus = function () {
        return this.status;
    };

    Case.prototype.getTitle = function () {
        return this.title;
    };

    Case.prototype.getFolderId = function () {
        return this.folderId;
    };

    Case.prototype.getCaseId = function () {
        return this.caseId;
    };

    Case.prototype.getUrl = function () {
        return this.url;
    };

    Case.prototype.getOwner = function () {
        return this.owner;
    };
    return Case;
});

