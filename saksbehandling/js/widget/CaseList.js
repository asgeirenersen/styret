
define(['model/google/folder/FolderManager', 'jquery'], function (FolderManager, $) {
    var instance = null;

    var CaseList = function (globalGapi, app) {
        if (instance === null) {
            instance = this;
        }
        this.gapi = globalGapi;
        this.parentApp = app;
        this.id = 'CaseList_' + time();
    };
    
    CaseList.prototype.buildUI = function () {
        var html = $('<form>' +
                '<label for="fileid">File ID</label>' +
                '<input id="fileid" type="text">' +
                '<input type="button" onClick="startApp();" value="Start the app!">' +
                '<div id="output"></div>' +
            '</form>');
    
        this.parentApp.getRootElement().append(html);
    }

    return CaseList;
});