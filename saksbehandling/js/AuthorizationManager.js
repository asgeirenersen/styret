/* global gapi */
define([
    'jquery'
], function ($) {

    var AuthorizationManager = function (gapi, clientId) {
        this.clientId = clientId;
        this.gapi = gapi;
    };

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