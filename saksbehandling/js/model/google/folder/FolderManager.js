/* global require, define */
define(['jquery'], function($) {
    
    /**
    * @param {Object} gapi Instance of Google API client
    */
    FolderManager = function (gapi) {
        this.gapi = gapi;
    }

    /**
     * 
     * @param {string} id
     * @returns {Deferred}
     */
    FolderManager.prototype.getById = function (id) {
        var deferred = $.Deferred();
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
    }

    FolderManager.prototype.getFoldersByParentId = function (id) {
        var deferred = $.Deferred();
            request = this.gapi.client.drive.files.list({
                q: 'mimeType="application/vnd.google-apps.folder" and "' + id + '" in parents'
            });
        request.execute(function(resp) {
            console.debug(resp);
            deferred.resolve(resp);
        });
        return deferred;    
    }
    
    FolderManager.prototype.addParent = function (id, parentId) {
        var deferred = $.Deferred();
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
    }

    FolderManager.prototype.removeParent = function (id, parentId) {
        var deferred = $.Deferred();
            request = this.gapi.client.drive.parents.insert({
                parentId: parentId,
                fileId: id
            });
        request.execute(function(resp) {
            console.debug(resp);
            deferred.resolve(resp);
        });
        return deferred;  
    }


    return FolderManager;
});

