/* global gapi */
define([
    'jquery'
], function ($) {

    /**
     * Constructor method.
     *
     * @param {Object} gapi Instance of Google API client
     * @param {string} clientId
     * @returns (AuthorizationManager}
     */
    var AuthorizationManager = function (gapi, clientId) {
        this.clientId = clientId;
        this.gapi = gapi;
    };

    /**
     * Performs authorization against the Google service.
     * @param {string} scopes
     * @param {boolean} immediate
     * @returns {Deferred}
     */
    AuthorizationManager.prototype.authorize = function (scopes, immediate) {
        var deferred = $.Deferred();
        this.gapi.auth.authorize({client_id: this.clientId, scope: scopes, immediate: immediate}, function (authResult) {
            var retVal = false;
            if (authResult && !authResult.error) {
                retVal = true;
            }
            deferred.resolve(retVal);
        });

        return deferred;
    }
    
    return AuthorizationManager;
});