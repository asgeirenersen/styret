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
    var Case = function (caseId, folderId, title, status, ownerEmail, url) {
        this.caseId = caseId;
        this.folderId = folderId;
        this.title = title;
        this.status = status;
        this.ownerEmail = ownerEmail;
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

    /**
     * Gets e-mail address of the case owner.
     *
     * @returns {string} E-mail address of the case owner.
     */
    Case.prototype.getOwnerEmail = function () {
        return this.owner;
    };

    return Case;
});

