/* global require, define */
define(['jquery'], function($) {

    /**
     * @param {Object} gapi Instance of Google API client
     */
    UserManager = function (gapi) {
        this.gapi = gapi;
    };

    /**
     * @returns {Deferred}
     */
    UserManager.prototype.getAllDomainUsers = function () {
        var deferred = $.Deferred(),
            request;

        request = this.gapi.client.request({
            'path': 'admin/directory/v1/users',
            'method': 'GET',
            'params': {
                'domain': 'styret.hallagerbakken.no',
                'fields': 'users(addresses,agreedToTerms,emails,id,isAdmin,isDelegatedAdmin,lastLoginTime,name,orgUnitPath,organizations,phones,primaryEmail,suspended,thumbnailPhotoUrl)'
            }
        });
        request.execute(function(resp) {
            console.debug(resp);
            deferred.resolve(resp['users']);
        });
        return deferred;
    };

    return UserManager;
});