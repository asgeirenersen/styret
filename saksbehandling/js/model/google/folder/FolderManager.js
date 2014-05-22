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

    FolderManager.prototype.getChildFoldersById = function (id) {
        var deferred = $.Deferred();
            request = this.gapi.client.drive.files.get({
                'fileId': id,
                'q': 'mimeType=application/vnd.google-apps.folder'
            });
        request.execute(function(resp) {
            console.log('Title: ' + resp.title);
            console.log('Description: ' + resp.description);
            console.log('MIME type: ' + resp.mimeType);
            deferred.resolve(resp);
        });
        return deferred;    
    }
    
    return FolderManager;
});

