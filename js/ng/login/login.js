'use strict';

(function(){
    angular.module('login', ['app'])
        .controller('loginController', ['$scope', '$rootScope', 'loginService', function($scope, $rootScope, loginService){

            $rootScope.loggedIn = false;
            $scope.logIn = function(immediate) {
                console.log('Log in thing!');
                loginService.logIn(immediate).then(function(result){
                    console.log('Login result: ' + result);
                    $rootScope.loggedIn = result;
                });
            };
        }])

        .factory('loginService', ['conf', 'gapi', '$q', function(conf, gapi, $q) {
            var svc = {
                state: {
                    loggedIn: false,
                    oauthToken: null,
                    apiKey: conf.cfg.apiKey,
                    clientId: conf.cfg.clientId
                },
                gapi: gapi,

                scopes: [
                    'https://www.googleapis.com/auth/plus.me',
                    'https://www.googleapis.com/auth/drive',
                    'https://www.googleapis.com/auth/admin.directory.user',
                    'https://www.googleapis.com/auth/userinfo.email',
                    'https://www.googleapis.com/auth/userinfo.profile'
                ],

                logIn: function(immediate) {
                    var _this = this,
                        deferred = $q.defer();

                    this.gapi.auth.authorize({
                        client_id: this.state.clientId,
                        scope: this.scopes,
                        immediate: immediate
                    }, function (authResult) {
                        if (authResult && !authResult.error) {
                            console.log('Logged in!!');
                            _this.state.loggedIn = true;
                            _this.state.oauthToken = authResult.access_token;
                            deferred.resolve(true);
                        } else {
                            console.debug(authResult);
                            _this.state.loggedIn = false;
                            _this.state.oauthToken = null;
                            deferred.resolve(false);
                        }
                    });

                    return deferred.promise;
                }
            };

            return svc;
        }])

        .directive('loginButton', function(){
            return {
                limit: 'E',
                templateUrl: 'js/ng/login/login-button.html'
            };
        });

})();