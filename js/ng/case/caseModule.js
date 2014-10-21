'use strict';

(function(){
    angular.module('case', ['app', 'login'])
        .controller('caseListController', ['caseService', function(caseService){
            this.data = caseService.data;
            this.statusFilter = 'open';
            this.updateCases = function() {
                caseService.getCases().then(function(result){
                    console.log(result);
                });
            };
        }])

        .factory('caseService', ['conf', 'gapi', '$q', function(conf, gapi, $q) {
            var folders = conf.cfg.folders,
                statusFolders = {
                    'possible': folders.possibleCasesFolder,
                    'open': folders.openCasesFolder,
                    'closed': folders.closedCasesFolder
                },
                svc = function () {
                    this.data = {cases: []},

                    this.getCases = function() {
                        var deferred = $q.defer(),
                            request,
                            _this = this,
                            parentString,
                            ids = [],
                            i = 0;

                            ids.push(folders.openCasesFolder);
                            ids.push(folders.closedCasesFolder);
                            ids.push(folders.possibleCasesFolder);
                            parentString = '("' + ids[0] + '" in parents)';
                            for (i; i < ids.length; i += 1) {
                                parentString += ' or ("' + ids[i] + '" in parents)';
                            }

                        request = gapi.client.drive.files.list({
                            q: '(mimeType="application/vnd.google-apps.folder") and (' + parentString + ') and (trashed != true)'
                        });
                        request.execute(function(resp) {
                            console.debug(resp);
                            for (var i = 0; i < resp['items'].length; i++) {
                                resp['items'][i]['status'] = _this.getStatusForFolder(resp['items'][i]);
                            }
                            _this.data.cases = resp['items'];
                            deferred.resolve(resp['items']);
                        });

                        return deferred.promise;
                    };

                    /**
                    * Gets the status string  for a case folder by looking at the folder's parents.
                    *
                    * @param {string} folderObject FOlder object as returned by Google.
                    * @returns {string}
                    */
                    this.getStatusForFolder = function (folder) {
                       var status = null,
                           i = 0,
                           id;

                       for (i; i < folder.parents.length; i++) {
                           id = folder.parents[i]['id'];
                           status = this.getStatusNameForFolderId(id);
                           if (status !== null) {
                                break;
                           }
                       }

                       return status;
                    };


                    /**
                     * Gets the proper status name for the folderId, if it is the id of one of the case status folders.
                     *
                     * @param {int} folderId
                     * @returns {string}
                     */
                    this.getStatusNameForFolderId = function (folderId) {
                        for (var name in statusFolders) {
                            if (statusFolders[name] === folderId) {
                                return name;
                            }
                        }

                        return null;
                    };
                };

            return new svc();
        }])

        .directive('caseList', function(){
            return {
                limit: 'E',
                templateUrl: 'js/ng/case/case-list.html'
            };
        });

})();