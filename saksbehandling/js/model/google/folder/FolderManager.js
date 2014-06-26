/* global require, define */
define(['jquery'], function($) {

    /**
     * @param {Object} gapi Instance of Google API client
     */
    FolderManager = function (gapi) {
        this.gapi = gapi;
    };

    /**
     *
     * @param {string} id ID of the folder
     * @returns {Deferred}
     */
    FolderManager.prototype.getById = function (id) {
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
    FolderManager.prototype.getFoldersByParentId = function (id) {
        var deferred = $.Deferred(),
            request;

        request = this.gapi.client.drive.files.list({
            q: '(mimeType="application/vnd.google-apps.folder") and ("' + id + '" in parents) and (trashed != true)'
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
    FolderManager.prototype.getFoldersByParentIds = function (ids) {
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
     * @param {string} id ID of the folder that needs a parent
     * @param {string} parentId ID of the new parent folder
     * @returns {Deferred}
     */
    FolderManager.prototype.addParent = function (id, parentId) {
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
    FolderManager.prototype.removeParent = function (id, parentId) {
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
     * @returns {Deferred}
     */
    FolderManager.prototype.createFolder = function (title, description, parentFolderId) {
        var deferred = $.Deferred();
            request = this.gapi.client.drive.files.insert({
                resource: {
                    title: title,
                    parents: [{id: parentFolderId}],
                    mimeType: 'application/vnd.google-apps.folder',
                    description: description
                }
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
     * @returns {Deferred}
     */
    FolderManager.prototype.updateFolder = function (title, description, parentFolderId) {
        var deferred = $.Deferred();
            request = this.gapi.client.drive.files.insert({
                resource: {
                    title: title,
                    mimeType: 'application/vnd.google-apps.folder',
                    description: description
                }
            });
        request.execute(function(resp) {
            console.debug(resp);
            deferred.resolve(resp);
        });
        return deferred;
    };

    return FolderManager;
});
