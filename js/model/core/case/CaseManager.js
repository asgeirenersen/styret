define([
    'model/core/case/CaseNumberHelper',
    'model/core/case/Case',
    'jquery'
],
function (cnHelper, Case, $) {

    /**
     * Constructor method.
     *
     * @param {object} config
     * @param {FolderMapper} folderMapper
     * @returns {CaseManager}
     */
    var CaseManager = function (config, folderMapper) {
        this.config = config;
        this.folderMapper = folderMapper;
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
     * @param {string} owenerEmail Primary e-mail of case owner.
     * @returns {@this;@pro;folderMapper@call;createFolder}
     */
    CaseManager.prototype.createCase = function (title, status, ownerEmail) {
        var _this = this,
            caseIdDef,
            retVal = $.Deferred(),
            folderId = this.getFolderIdForStatus(status),
            year,
            props = [];

        if (ownerEmail) {
            props[0] = this.folderMapper.createProperty('caseOwner', ownerEmail, 'public');
        }

        year = new Date().getFullYear();
        caseIdDef = this.getNextAvailableCaseIdForYear(year);
        caseIdDef.done(function (nextId) {
            console.debug(nextId);
            var deferred = _this.folderMapper.createFolder(
                nextId + ' | ' + title,
                folderId,
                props
            );
            deferred.done(function (res) {
                console.debug(res);
                retVal.resolve(res);
            });
        });

        return retVal;
    };

    CaseManager.prototype.getPopulatedCaseFromFolder = function (folder) {
        var theCase,
            status = this.getStatusForFolder(folder),
            caseId = cnHelper.getCaseIdFromString(folder['title']),
            owner = folder.owners[0],
            ownerEmail,
            caseOwnerProp;

        caseOwnerProp = this.folderMapper.getPropertyFromFolder(folder, 'caseOwner');

        if (caseOwnerProp !== null && caseOwnerProp['value'] !== '') {
            ownerEmail = caseOwnerProp['value'];
        } else {
            ownerEmail = owner['emailAddress'];
        }

        theCase = new Case(
            caseId,
            folder['id'],
            folder['title'],
            status,
            ownerEmail,
            folder['alternateLink']
        );

        return theCase;
    };

    /**
     * @param {string} folderId Google folder id
     * @param {string} title
     * @param {string} description
     * @param {string} status
     * @param {string} ownerId Id (e-mail) of the owner user.
     * @returns {@this;@pro;folderMapper@call;createFolder}
     */
    CaseManager.prototype.updateCase = function (folderId, title, newStatus, ownerEmail) {
        var _this = this,
            deferred,
            retVal = $.Deferred(),
            parentFolderId = this.getFolderIdForStatus(newStatus),
            otherParentFolderIds = this.getFolderIdsForOtherStatuses(newStatus),
            props = [];

        if (ownerEmail) {
            props[0] = this.folderMapper.createProperty('caseOwner', ownerEmail, 'public');
        }

        deferred = _this.folderMapper.updateFolder(
            folderId,
            title,
            parentFolderId,
            otherParentFolderIds.join(),
            props
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
            deferred = this.folderMapper.getById(folderId);

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
     * Gets the status string  for a case folder by looking at the folder's parents.
     *
     * @param {string} folderObject FOlder object as returned by Google.
     * @returns {string}
     */
    CaseManager.prototype.getStatusForFolder = function (folder) {
        var status = null,
            i = 0,
            id;

        for (i; i < folder.parents.length; i++) {
            id = folder.parents[i]['id'];
            status = this.getStatusNameForFolderId(id);
        }

        return status;
    };

    /**
     * Gets the proper status name for the folderId, if it is the id of one of the case status folders.
     *
     * @param {int} folderId
     * @returns {string}
     */
    CaseManager.prototype.getStatusNameForFolderId = function (folderId) {
        for (var name in this.statusFolders) {
            if (this.statusFolders[name] === folderId) {
                return name;
            }
        }

        return null;
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
     * @returns {Deferred}
     */
    CaseManager.prototype.getCasesByStatus = function (status) {
        var deferred = $.Deferred(),
            parentFolderId,
            cases = [],
            _this = this;

        parentFolderId = this.getFolderIdForStatus(status);
        this.folderMapper.getFoldersByParentId(parentFolderId)
            .then(function (items) {
                for (i = 0; i < items.length; i++) {
                    cases[i] = _this.getPopulatedCaseFromFolder(items[i]);
                }
                deferred.resolve(cases);
            });

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
        var deferred = $.Deferred(),
            parentFolderList = [],
            gFilter = {},
            i = 0,
            cases = [],
            _this = this;

        if (filter['statusList']) {
            for (i; i < filter['statusList'].length; i = i + 1) {
                parentFolderList.push(
                    this.getFolderIdForStatus(filter['statusList'][i])
                );
            }
            gFilter['parentList'] = parentFolderList;
        }
        if (filter['ownerList'] && filter['ownerList'].length > 0) {
            gFilter['caseOwner'] = filter['ownerList'][0];
        }
        this.folderMapper.getFoldersByFilter(gFilter)
            .then(function (items) {
                for (i = 0; i < items.length; i++) {
                    cases[i] = _this.getPopulatedCaseFromFolder(items[i]);
                }
                deferred.resolve(cases);
            });

        return deferred;
    };

    /**
     * Gets all existing cases, regardless of status.
     *
     * @returns {_L5.CaseManager.prototype.getAllCases@pro;folderMapper@call;getFoldersByParentIds}
     */
    CaseManager.prototype.getAllCases = function () {
        var deferred,
            ids = [];

        ids.push(this.getFolderIdForStatus(this.statusOpen));
        ids.push(this.getFolderIdForStatus(this.statusClosed));
        ids.push(this.getFolderIdForStatus(this.statusPossible));
        deferred = this.folderMapper.getFoldersByParentIds(ids);

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

        this.folderMapper.addParent(id, toFolderId)
            .done(function () {
                _this.folderMapper.removeParent(id, fromFolderId)
                    .done(function (resp) {
                        console.debug(resp);
                        callback.call(_this);
                    });
            }
        );
    };

    return CaseManager;
});