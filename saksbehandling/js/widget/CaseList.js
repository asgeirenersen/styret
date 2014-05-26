
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
        $('input[name="getCases"]', this.rootElement).on('click', function () {
            _this.listOpenCases();
        });
    };
    
    CaseList.prototype.listOpenCases = function () {
        this.listCases(this.config.openCasesFolder);
    };
    
    CaseList.prototype.listCases = function (id) {
        var _this = this,
            deferred = this.folderManager.getFoldersByParentId(id);
        
        deferred.done(function (resp) {
            var output = $('.listWrapper', _this.rootElement),
                items = resp['items'],
                list = $('<ul></ul>');
            output.empty();
            for (var i = 0; i < items.length; i = i +1) {
                list.append('<li>' + items[i]['title'] + '</li>');
            }
            output.append(list);
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