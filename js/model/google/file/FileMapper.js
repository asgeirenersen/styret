/* global require, define */
define(['jquery'], function($) {

    /**
     * @param {Object} gapi Instance of Google API client
     */
    FileMapper = function (gapi) {
        this.gapi = gapi;
    };

    /**
     *
     * @param {string} id ID of the file
     * @returns {Deferred}
     */
    FileMapper.prototype.getById = function (id) {
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
    FileMapper.prototype.getFileByParentId = function (id) {
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
     * @param {string} id ID of the folder that needs a parent
     * @param {string} parentId ID of the new parent folder
     * @returns {Deferred}
     */
    FileMapper.prototype.addParent = function (id, parentId) {
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
    FileMapper.prototype.removeParent = function (id, parentId) {
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
     * Updates a folder.
     * The returned deferred will be resolved with the response object as
     * the parameter passed to the callback methods.
     * @param {string} fileId
     * @param {string} title
     * @param {array}  Array of Google drive#property
     * @returns {Deferred}
     */
    FileMapper.prototype.updateFile = function (fileId, title, props) {
        var deferred = $.Deferred(),
            properties = [],
            body,
            request;

        body = {
            'fileId': fileId,
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

    FileMapper.prototype.getProperty = function (folder, name) {
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

    FileMapper.prototype.createProperty = function (key, value, visibility) {
            var prop = {
                'key': key,
                'value': value,
                'visibility': visibility ? visibility : 'public',
                'type': 'drive#property'
            }

            return prop;
    };

    FileMapper.prototype.sortFileList = function (list, descending) {
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

    return FileMapper;
});
