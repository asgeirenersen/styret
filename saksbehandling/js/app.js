/* global require, define */
define(['model/google/folder/FolderManager', 'jquery'], function (FolderManager, $) {
    
    var App = function (config, gapi, appContainer) {
        this.gapi = gapi;
        this.config = config;
        this.id = 'App_' + time();
        this.rootElement = $('<div></div>');
        this.rootElement.attr('id', this.id);
        appContainer.append(this.rootElement);
    };
    
    App.prototype.start = function () {
        var folderManager = new FolderManager(gapi),
            deferred = folderManager.getById(this.config.openCasesFolder);
    
        deferred.done(function (resp) {
            var output = $('#output'),
                dl;
            output.empty();
            output.append('<dl></dl>');
            dl = $('dl', output);
            dl.append('<dt>Title</dt>');
            dl.append('<dd>' + resp.title + '</dd>');
            dl.append('<dt>Description</dt>');
            dl.append('<dd>' + resp.description + '</dd>');
            dl.append('<dt>MIME type</dt>');
            dl.append('<dd>' + resp.mimeType + '</dd>');
        });
    };
    
    App.prototype.getRootElement = function () {
        return this.rootElement;
    };
    
    return App;
});