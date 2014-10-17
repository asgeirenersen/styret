/* global gapi */
define([
    'jquery'
], function ($) {

    var scopes = [
            'https://www.googleapis.com/auth/plus.me',
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/admin.directory.user',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ],

    /**
     * Constructor method.
     *
     * @param {Object} gapi Instance of Google API client
     * @param {string} clientId
     * @returns (AuthorizationManager}
     */
    AuthorizationManager = function (gapi, clientId, apiKey) {
        this.clientId = clientId;
        this.gapi = gapi;
        this.apiKey = apiKey;
        this.oauthToken;
    };

    /**
     * Performs authorization against the Google service.
     * @param {string} scopes
     * @param {boolean} immediate
     * @returns {Deferred}
     */
    AuthorizationManager.prototype.authorize = function (immediate) {
        var deferred = $.Deferred(),
            _this = this;
        this.gapi.auth.authorize({client_id: this.clientId, scope: scopes, immediate: immediate}, function (authResult) {
            var retVal = false;
            if (authResult && !authResult.error) {
                retVal = true;
                _this.oauthToken = authResult.access_token
            }
            deferred.resolve(retVal);
        });

        return deferred;
    }

    return AuthorizationManager;
});