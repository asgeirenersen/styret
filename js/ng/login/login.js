'use strict';

(function(){
    angular.module('login', [])
        .controller('loginController', ['$scope', 'loginService', function($scope, loginService){
            $scope.state = loginService.state;

            $scope.logIn = function() {
                console.log('Log in thing!');
            };
        }])

        .factory('loginService', function() {
            var svc = {
                state: {
                    loggedIn: false,
                    oauthToken: null,
                    apiKey: null,
                    clientId: null,
                    gapi: null
                },
                scopes: [
                    'https://www.googleapis.com/auth/plus.me',
                    'https://www.googleapis.com/auth/drive',
                    'https://www.googleapis.com/auth/admin.directory.user',
                    'https://www.googleapis.com/auth/userinfo.email',
                    'https://www.googleapis.com/auth/userinfo.profile'
                ],

                logIn: function(immediate) {
                    var _this = this;
                    this.gapi.auth.authorize({client_id: this.clientId, scope: this.scopes, immediate: immediate}, function (authResult) {
                        if (authResult && !authResult.error) {
                            _this.state.loggedIn = true;
                            _this.state.oauthToken = authResult.access_token;
                            console.log('Logged in!!');
                        }
                    });
                }

            };

            return svc;
        })

        .directive('loginButton', function(){
            return {
                limit: 'E',
                templateUrl: 'js/ng/login/login-button.html'
            };
        });

})();