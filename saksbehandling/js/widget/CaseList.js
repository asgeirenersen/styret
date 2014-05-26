
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
    
    CaseList.prototype.listCases = function (parentFolderId) {
        var _this = this,
            deferred = this.folderManager.getFoldersByParentId(parentFolderId);
        
        deferred.done(function (resp) {
            var output = $('.listWrapper', _this.rootElement),
                items = resp['items'],
                list = $('<ul></ul>');
            output.empty();
            for (var i = 0; i < items.length; i = i +1) {
                var closeLink = $('<a class="closeBtn" data-id="' + items[i]['id'] + '" href="#">&nbsp;(Lukk)</a>'),
                    li = $('<li></li>');

                li.append('<span class="caseTitle">' + items[i]['title'] + '</span>');
                li.append(closeLink);
                list.append(li);
            }
            output.append(list);
            $('.closeBtn', output).on('click', null, function (e) {
                var clickedElement = $(e.target),
                    id = clickedElement.attr('data-id'),
                    title = clickedElement.prev('span').text(),
                    confirmTxt = 'Vil du lukke denne saken?\n' + title;

                e.preventDefault();
                if (confirm(confirmTxt)) {
                    var whenAdded,
                        whenRemoved,
                        whenAll = $.Deferred(),
                        reportDone;
                        
                    reportDone = function () {
                        if (whenAdded.state() === 'resolved' && 
                                whenRemoved.state() === 'resolved') {
                            whenAll.resolve();
                        }
                    }
                        
                    whenAll.done(function () {
                        _this.listCases(parentFolderId);
                    });

                    whenAdded = _this.folderManager.addParent(id, _this.config.closedCasesFolder);
                    whenAdded.done(function (resp) {
                        if (resp['error']) {
                            alert('Kunne ikke legge saken inn i mappen 02 Lukkede saker.');
                        } else {
                            console.log('Saken er lagt til i mappen 02 Lukkede saker.');
                        }
                        reportDone(whenAdded);
                    });
                    whenRemoved = _this.folderManager.removeParent(id, _this.config.openCasesFolder);
                    whenRemoved.done(function (resp) {
                        if (resp['error']) {
                            alert('Saken kunne ikke fjernes fra mappen 01 Åpne saker.');
                        } else {
                            console.log('Saken er fjernet fra mappen 01 Åpne saker.');
                        }
                        reportDone(whenRemoved);
                    });
                    
                }

            });
        });
    };
    
    CaseList.prototype.closeCase = function (id) {
        var _this = this,
            deferred1,
            deferred2;
            
        deferred1 = this.folderManager.addParent(id, this.config.closedCasesFolder);
        deferred1.done(function () {
            deferred2 = _this.folderManager.removeParent(id, _this.config.openCasesFolder);
            deferred2.done(function (resp) {
                console.debug(resp);
                _this.listCases();
            });
        });
    }
    
    CaseList.prototype.buildUI = function () {
        var html = $('<form>' +
                '<input name="getCases" type="button" value="Vis saker">' +
                '<div class="listWrapper"></div>' +
            '</form>');
        return html;
    };

    return CaseList;
});