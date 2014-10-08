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

    /**
     * Retrieves the person profile of the logged in user.
     *
     * @returns {Deferred} Resolves with Google person profile.
     */
    UserManager.prototype.getMyProfile = function () {
        var deferred = $.Deferred(),
            request,
            _this = this;

        this.gapi.client.load('plus', 'v1', function () {
            request = _this.gapi.client.plus.people.get({
                'userId': 'me'
            });

            request.execute(function(resp) {
                console.debug(resp);
                deferred.resolve(resp);
            });
        });

        return deferred;
    };

    return UserManager;
});