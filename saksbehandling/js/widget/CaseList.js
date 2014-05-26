
define(['model/google/folder/FolderManager', 'jquery'], function (FolderManager, $) {
    var instance = null;

    var CaseList = function (gapi, app, config) {
        if (instance === null) {
            instance = this;
        }
        this.gapi = gapi;
        this.parentApp = app;
        this.config = config;
        this.id = 'CaseList_' + new Date().getTime();
        this.folderManager = new FolderManager(gapi);
    };
    
    CaseList.prototype.init = function () {
        var _this = this;
        this.rootElement = $('<div></div>');
        this.rootElement.attr('id', this.id);
        this.rootElement.append(this.buildUI());
        this.parentApp.getRootElement().append(this.rootElement);
        $('input[name="getCases"]', this.rootElement).on('click', function (e) {
            var id = $('input[name="fileId"]', _this.rootElement).val();
            _this.listCases(id);
        });
    };
    
    CaseList.prototype.listCases = function (id) {
        var _this = this,
            deferred = this.folderManager.getById(this.config.openCasesFolder);
        
        deferred.done(function (resp) {
            var output = $('.listWrapper', _this.rootElement),
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
    
    CaseList.prototype.buildUI = function () {
        var html = $('<form>' +
                '<label value="Case ID">' +
                '<input name="fileid" type="text">' +
                '</label>' +
                '<input name="getCases" type="button" value="Get cases">' +
                '<div class="listWrapper"></div>' +
            '</form>');
        return html;
    };

    return CaseList;
});