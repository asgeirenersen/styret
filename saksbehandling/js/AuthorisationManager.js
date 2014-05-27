/* global gapi */
define([
    'jquery',
    'https://apis.google.com/js/client.js'
], function ($) {

    var AuthorisationManager = function (apiKey, clientId) {
        this.clientId = clientId;

        gapi.client.setApiKey(apiKey);
    };

    AuthorisationManager.prototype.authorise = function (scopes) {
        var deferred = $.Deferred();
        gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, function (authResult) {
            var retVal = false;
            if (authResult && !authResult.error) {
                retVal = true;
            }
            deferred.resolve(retVal);
        });

        return deferred;
    }
    
});