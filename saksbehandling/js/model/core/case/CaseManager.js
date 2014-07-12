define([
    'model/core/case/CaseNumberHelper',
    'jquery'
],
function (cnHelper, $) {

    /**
     * Constructor method.
     *
     * @param {object} config
     * @param {FolderManager} folderManager
     * @returns {CaseManager}
     */
    var CaseManager = function (config, folderManager) {
        this.config = config;
        this.folderManager = folderManager;
        this.statusFolders = {
            'possible': config.possibleCasesFolder,
            'open': config.openCasesFolder,
            'closed': config.closedCasesFolder
        };
    };

    CaseManager.prototype.statusPossible = 'possible';
    CaseManager.prototype.statusOpen = 'open';
    CaseManager.prototype.statusClosed = 'closed';
    
    /**
     * Creates a Case on the back end.
     *
     * @param {string} title
     * @param {string} description
     * @param {string} status
     * @returns {@this;@pro;folderManager@call;createFolder}
     */
    CaseManager.prototype.createCase = function (title, description, status) {
        var _this = this,
            caseIdDef,
            retVal = $.Deferred(),
            folderId = this.getFolderIdForStatus(status),
            year;

        year = new Date().getFullYear();
        caseIdDef = this.getNextAvailableCaseIdForYear(year);
        caseIdDef.done(function (nextId) {
            console.debug(nextId);
            var deferred = _this.folderManager.createFolder(
                nextId + ' | ' + title,
                description,
                folderId
            );
            deferred.done(function (res) {
                console.debug(res);
                retVal.resolve(res);
            });
        });

        return retVal;
    };
    
    /**
     * @param {string} folderId Google folder id
     * @param {string} title
     * @param {string} description
     * @param {string} status
     * @returns {@this;@pro;folderManager@call;createFolder}
     */
    CaseManager.prototype.updateCase = function (folderId, title, description, newStatus) {
        var _this = this,
            deferred, 
            retVal = $.Deferred(),
            parentFolderId = this.getFolderIdForStatus(newStatus),
            otherParentFolderIds = this.getFolderIdsForOtherStatuses(newStatus);

        deferred = _this.folderManager.updateFolder(
            folderId,
            title,
            description,
            parentFolderId,
            otherParentFolderIds.join()
        );
        deferred.done(function (res) {
            console.debug(res);
            retVal.resolve(res);
        });

        return retVal;
    };
    
    /**
     * Get a case by the id of the main case folder in Google Drive.
     *
     * @param {string} folderId Google folder id
     * @returns {Deferred}
     */
    CaseManager.prototype.getCaseByFolderId = function (folderId) {
        var retVal = $.Deferred(),
            deferred = this.folderManager.getById(folderId);

        deferred.done(function (resp) {
            retVal.resolve(resp);
        });
        
        return retVal;
    };
    
    /**
     * Gets the ID of the folder to use for cases with the given status.
     * 
     * @param {string} status Google folder id
     * @throws {object}
     * @returns {string}
     */
    CaseManager.prototype.getFolderIdForStatus = function (status) {
        if (this.statusFolders[status]) {
            return this.statusFolders[status];
        }
    };
    
    /**
     * Gets the highest existing case id for a given year.
     *
     * @param {int} year
     * @return {string}
     */
    CaseManager.prototype.getHighestCaseId = function (year) {
        var retVal = $.Deferred(),
            deferred;

        deferred = this.getAllCases();
        deferred.done(function (items) {
            var caseIds = [],
                name,
                id,
                i = 0,
                highestId;

            for (i; i < items.length; i++) {
                name = items[i]['title'];
                id = cnHelper.getCaseIdFromString(name);
                if (cnHelper.validateCaseId(id) && 
                        parseInt(cnHelper.getYearFromCaseId(id), 10) === year) {
                    caseIds.push(id);
                }
            }
            if (caseIds.length === 0) {
                    retVal.reject(null);
            }
            caseIds.sort();
            highestId = caseIds[caseIds.length - 1];
            
            retVal.resolve(highestId);
        });

        return retVal;
    };
    
    /**
     * Gets the next available case id for a given year.
     * The id will be a string on the format "YYYY-nnnn".
     *
     * @param {type} year
     * @returns {String}
     */
    CaseManager.prototype.getNextAvailableCaseIdForYear = function (year) {
        var deferred,
            retVal = $.Deferred();
    
        deferred = this.getHighestCaseId(year);
        deferred.done(function (highestExisting) {
            var num = 0;

            if (highestExisting !== null) {
                num = cnHelper.getNumberFromCaseId(highestExisting);
                num = parseInt(num, 10);
            }
            num ++;
            num = cnHelper.padToFour(num);

            retVal.resolve(year + '-' + num);
        });

        return retVal;
    };
    
    /**
     * Gets all cases with a given status.
     *
     * @param {type} status
     * @returns {_L5.CaseManager.prototype.getCasesByStatus@pro;folderManager@call;getFoldersByParentId}
     */
    CaseManager.prototype.getCasesByStatus = function (status) {
        var deferred,
            parentFolderId;

        parentFolderId = this.getFolderIdForStatus(status);
        deferred = this.folderManager.getFoldersByParentId(parentFolderId);
        
        return deferred;
    };
    
    /**
     * Gets cases matching a filter object.
     * {
     *   "statusList": ["open", "possible", "closed"],
     *   "ownerList": ["user.name@styret.hallagerbakken.no"]
     * }
     *
     * @param {Object} filter
     * @returns {Deferred}
     */
    CaseManager.prototype.getCasesByFilter = function (filter) {
        var deferred,
            parentFolderList = [],
            ownerList,
            gFilter = {},
            i = 0;
        
        if (filter['statusList']) {
            for (i; i < filter['statusList'].length; i = i + 1) {
                parentFolderList.push(
                    this.getFolderIdForStatus(filter['statusList'][i])
                );
            }
            gFilter['statusList'] = parentFolderList;
        }
        if (filter['ownerList']) {
            gFilter['ownerList'] = ownerList;
        }
        deferred = this.folderManager.getFoldersByFilter(gFilter);
        
        return deferred;  
    };
    
    /**
     * Gets all existing cases, regardless of status.
     *
     * @returns {_L5.CaseManager.prototype.getAllCases@pro;folderManager@call;getFoldersByParentIds}
     */
    CaseManager.prototype.getAllCases = function () {
        var deferred,
            ids = [];

        ids.push(this.getFolderIdForStatus(this.statusOpen));
        ids.push(this.getFolderIdForStatus(this.statusClosed));
        ids.push(this.getFolderIdForStatus(this.statusPossible));
        deferred = this.folderManager.getFoldersByParentIds(ids);
        
        return deferred;
    };
    
    /**
     * Gets an array of Google folder ids.
     * These will be the id of the folders for the other statuses than the
     * passed status name.
     *
     * @param {type} status
     * @returns {Array}
     */
    CaseManager.prototype.getFolderIdsForOtherStatuses = function (status) {
        var folderIds = [],
            i = 0,
            names = Object.getOwnPropertyNames(this.statusFolders);

        for (i; i < names.length; i++) {
            if (names[i] !== status) {
                folderIds.push(this.statusFolders[names[i]]);
            }
        }

        return folderIds;
    };
    
    /**
     * Changes the status of a case.
     * For now, this just means moving the case folder from
     * one parent folder to another.
     * 
     * @param {string} id
     * @param {string} fromStatus
     * @param {string} toStatus
     * @param {function} callback This function is called when the moving is done.
     * @returns {undefined}
     */
    CaseManager.prototype.changeStatus = function (id, fromStatus, toStatus, callback) {
        var _this = this,
            toFolderId = this.getFolderIdForStatus(toStatus),
            fromFolderId = this.getFolderIdForStatus(fromStatus);
            
        this.folderManager.addParent(id, toFolderId)
            .done(function () {
                _this.folderManager.removeParent(id, fromFolderId)
                    .done(function (resp) {
                        console.debug(resp);
                        callback.call(_this);
                    });
            }
        );
    };
 
    return CaseManager;
});