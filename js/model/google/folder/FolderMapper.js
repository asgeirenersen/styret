/* global require, define */
define(['jquery'], function($) {

    /**
     * @param {Object} gapi Instance of Google API client
     */
    FolderMapper = function (gapi) {
        this.gapi = gapi;
    };

    /**
     *
     * @param {string} id ID of the folder
     * @returns {Deferred}
     */
    FolderMapper.prototype.getById = function (id) {
        var deferred = $.Deferred(),
            request = this.gapi.client.drive.files.get({
        'fileId': id
        });
        request.execute(function(resp) {
            console.log('Title: ' + resp.title);
            console.log('Description: ' + resp.description);
            console.log('MIME type: ' + resp.mimeType);
            deferred.resolve(resp);
        });
        return deferred;
    };

    /**
     * @param {string} id ID of parent folder
     * @returns {Deferred}
     */
    FolderMapper.prototype.getFoldersByParentId = function (id) {
        var deferred = $.Deferred(),
            request;

        request = this.gapi.client.drive.files.list({
            q: '(mimeType="application/vnd.google-apps.folder") and ("' + id + '" in parents) and (trashed != true) orderby="title"'
        });
        request.execute(function(resp) {
            console.debug(resp);
            deferred.resolve(resp['items']);
        });
        return deferred;
    };

    /**
     * @param {string} ids Array of IDs of parent folders
     * @returns {Deferred}
     */
    FolderMapper.prototype.getFoldersByParentIds = function (ids) {
        var deferred = $.Deferred(),
            parentString,
            request,
            i = 1;

        parentString = '("' + ids[0] + '" in parents)';
        for (i; i < ids.length; i += 1) {
            parentString += ' or ("' + ids[i] + '" in parents)';
        }

        request = this.gapi.client.drive.files.list({
            q: '(mimeType="application/vnd.google-apps.folder") and (' + parentString + ') and (trashed != true)'
        });
        request.execute(function(resp) {
            console.debug(resp);
            deferred.resolve(resp['items']);
        });
        return deferred;
    };

    /**
     * Gets folders matching a filter object.
     * {
     *   "parentList": ["HGT876965976%/()", "9876vIKJ-XX"],
     *   "ownerList": ["user.name@styret.hallagerbakken.no"]
     * }
     * @param {type} filter
     * @returns {Deferred}
     */
    FolderMapper.prototype.getFoldersByFilter = function (filter) {
        var deferred = $.Deferred(),
            parentString = '',
            ownerString = '',
            caseOwnerString = '',
            request,
            filterOK = false,
            i = 1,
            j = 1,
            _this = this;

        if (filter['parentList'] && filter['parentList'].length > 0) {
            filterOK = true;
            parentString = ' and (("' + filter['parentList'][0] + '" in parents)';
            for (i; i < filter['parentList'].length; i = i + 1) {
                parentString += ' or ("' + filter['parentList'][i] + '" in parents)';
            }
            parentString += ')';
        }

        if (filter['ownerList'] && filter['ownerList'].length > 0) {
            filterOK = true;
            ownerString = ' and (("' + filter['ownerList'][0] + '" in owners)';
            for (j; j < filter['ownerList'].length; j = j + 1) {
                ownerString += ' or ("' + filter['ownerList'][j] + '" in owners)';
            }
            ownerString += ')';
        }

        if (filter['caseOwner']) {
            filterOK = true;
            caseOwnerString = " and (properties has {key='caseOwner' and value='" + filter['caseOwner'] + "' and visibility='PUBLIC'})";
        }

        if (!filterOK) {
            throw new Error( "Filter must specify at least one owner or parent." );
        }

        request = this.gapi.client.drive.files.list({
            q: '(mimeType="application/vnd.google-apps.folder")' + parentString + ownerString + caseOwnerString + ' and (trashed != true)'
        });
        request.execute(function(resp) {
            var folders = resp['items'];
            _this.sortFolderList(folders, true);
            deferred.resolve(folders);
        });

        return deferred;
    };

    /**
     * @param {string} id ID of the folder that needs a parent
     * @param {string} parentId ID of the new parent folder
     * @returns {Deferred}
     */
    FolderMapper.prototype.addParent = function (id, parentId) {
        var deferred = $.Deferred(),
            request = this.gapi.client.drive.parents.insert({
                fileId: id,
                resource: {
                    id: parentId
                }
            });
        request.execute(function(resp) {
            console.debug(resp);
            deferred.resolve(resp);
        });
        return deferred;
    };

    /**
     * @param {string} id ID of the folder that looses a parent
     * @param {string} parentId ID of the former parent folder
     * @returns {Deferred}
     */
    FolderMapper.prototype.removeParent = function (id, parentId) {
        var deferred = $.Deferred(),
            request = this.gapi.client.drive.parents.delete({
                parentId: parentId,
                fileId: id
            });
        request.execute(function(resp) {
            console.debug(resp);
            deferred.resolve(resp);
        });
        return deferred;
    };

    /**
     * Creates a new folder.
     * The returned deferred will be resolved with the response object as
     * the parameter passed to the callback methods.
     *
     * @param {string} title
     * @param {string} description
     * @param {string} parentFolderId
     * @param {array}  Array of Google drive#property
     * @returns {Deferred}
     */
    FolderMapper.prototype.createFolder = function (title, parentFolderId, props) {
        var deferred = $.Deferred(),
            request,
            res = {
                title: title,
                parents: [{id: parentFolderId}],
                mimeType: 'application/vnd.google-apps.folder'
            };

        if (props !== null) {
            res['properties'] = props;
        }

        request = this.gapi.client.drive.files.insert({
            resource: res
        });
        request.execute(function(resp) {
            console.debug(resp);
            deferred.resolve(resp);
        });

        return deferred;
    };

    /**
     * Updates a folder.
     * The returned deferred will be resolved with the response object as
     * the parameter passed to the callback methods.
     * @param {string} folderId
     * @param {string} title
     * @param {string} parentFolderId
     * @param {array}  Array of Google drive#property
     * @returns {Deferred}
     */
    FolderMapper.prototype.updateFolder = function (folderId, title, addParents, removeParents, props) {
        var deferred = $.Deferred(),
            properties = [],
            body,
            request;

        body = {
            'fileId': folderId,
            'addParents': addParents,
            'removeParents': removeParents,
            'resource': {
                'title': title,
                'properties': properties
            }
        };

        if (props !== null) {
            body['resource']['properties'] = props;
        }

        request = this.gapi.client.drive.files.update(body);
        request.execute(function(resp) {
            console.debug(resp);
            deferred.resolve(resp);
        });
        return deferred;
    };

    FolderMapper.prototype.getPropertyFromFolder = function (folder, name) {
        var props = folder['properties'],
            i = 0;
        if (!props) {
            return null;
        }

        for (i; i < props.length; i++) {
            if (props[i]['key'] === name) {
                return props[i];
            }
        }

        return null;
    };

    FolderMapper.prototype.createProperty = function (key, value, visibility) {
            var prop = {
                'key': key,
                'value': value,
                'visibility': visibility ? visibility : 'public',
                'type': 'drive#property'
            }

            return prop;
    };

    FolderMapper.prototype.sortFolderList = function (list, descending) {
        if (descending) {
            list.sort(function (a, b) {
                return a['title'].localeCompare(b['title']) * -1;
            });
        } else {
            list.sort(function (a, b) {
                return a['title'].localeCompare(b['title']);
            });
        }

        return list;
    }

    return FolderMapper;
});
