
define([
    'model/google/folder/FolderManager',
    'jquery'
], function (FolderManager, $) {
    var instance = null;

    /**
     * Constructor method.
     *
     * @param {gapi} gapi Google api client
     * @param {object} app
     * @param {object} config
     * @returns {CaseList}
     */
    var CaseList = function (gapi, app, config) {
        if (instance === null) {
            instance = this;
        }
        this.gapi = gapi;
        this.parentApp = app;
        this.config = config;
        this.id = 'CaseList_' + new Date().getTime();
        this.folderManager = new FolderManager(gapi);
        this.rootElement;
    };
    
    /**
     * Initializes the widget.
     * Must be called before using the widget.
     */
    CaseList.prototype.init = function () {
        var _this = this;

        this.rootElement = this.buildUI();
        this.parentApp.getRootElement().append(this.rootElement);
        $('button[name="getOpenCases"]', this.rootElement).on('click', function () {
            _this.listOpenCases();
        });
        $('button[name="getClosedCases"]', this.rootElement).on('click', function () {
            _this.listClosedCases();
        });
        $('button[name="getPossibleCases"]', this.rootElement).on('click', function () {
            _this.listPossibleCases();
        });
    };
    
    /**
     * Displays the widget.
     *
     * @returns {undefined}
     */
    CaseList.prototype.show = function () {
        this.rootElement.css('display', 'block');
    };
    
    /**
     * Hides the widget.
     *
     * @returns {undefined}
     */
    CaseList.prototype.hide = function () {
        this.rootElement.css('display', 'none');
    };
    
    /**
     * Fetches and diplays a list of all open cases.
     *
     * @returns {undefined}
     */
    CaseList.prototype.listOpenCases = function () {
        var _this = this,
            listReady = this.listCases(this.config.openCasesFolder);
        
        listReady.done(function () {
            $('.rowButtons', _this.rootElement).each(function () {
                $(this).append('<a class="closeBtn" href="#">&nbsp;(Lukk)</a>');
            });

            $('.closeBtn', _this.rootElement).on('click', null, function (e) {
                var clickedElement = $(e.target),
                    tr = clickedElement.closest('tr'),
                    id = tr.attr('data-id'),
                    title = $('.caseTitle', tr).text(),
                    confirmTxt = 'Vil du lukke denne saken?\n' + title;

                e.preventDefault();
                if (confirm(confirmTxt)) {
                    _this.moveCase(id, _this.config.openCasesFolder, _this.config.closedCasesFolder, function () {
                        this.listOpenCases();
                    });
                }
            });
        });
    };
    
    /**
     * Fetches and diplays a list of all closed cases.
     *
     * @returns {undefined}
     */
    CaseList.prototype.listClosedCases = function () {
        var _this = this,
            listReady = this.listCases(this.config.closedCasesFolder);
        
        listReady.done(function () {
            $('.rowButtons', _this.rootElement).each(function () {
                $(this).append('<a class="reopenBtn" href="#">&nbsp;(Gjenåpne)</a>');
            });

            $('.reopenBtn', _this.rootElement).on('click', null, function (e) {
                var clickedElement = $(e.target),
                    tr = clickedElement.closest('tr'),
                    id = tr.attr('data-id'),
                    title = $('.caseTitle', tr).text(),
                    confirmTxt = 'Vil du gjenåpne denne saken?\n' + title;

                e.preventDefault();
                if (confirm(confirmTxt)) {
                    _this.moveCase(id, _this.config.closedCasesFolder, _this.config.openCasesFolder, function () {
                        this.listClosedCases();
                    });
                }
            });
        });
    };
    
    /**
     * Fetches and diplays a list of all possible cases.
     *
     * @returns {undefined}
     */
    CaseList.prototype.listPossibleCases = function () {
        var _this = this,
            listReady = this.listCases(this.config.possibleCasesFolder);
        
        listReady.done(function () {
            $('.rowButtons', _this.rootElement).each(function () {
                $(this).append('<a class="openBtn" href="#">&nbsp;(Åpne)</a>');
            });

            $('.openBtn', _this.rootElement).on('click', null, function (e) {
                var clickedElement = $(e.target),
                    tr = clickedElement.closest('tr'),
                    id = tr.attr('data-id'),
                    title = $('.caseTitle', tr).text(),
                    confirmTxt = 'Vil du åpne denne saken?\n' + title;

                e.preventDefault();
                if (confirm(confirmTxt)) {
                    _this.moveCase(id, _this.config.possibleCasesFolder, _this.config.openCasesFolder, function () {
                        this.listPossibleCases();
                    });
                }
            });
        });
    };
    
    /**
     * Fetches and diplays a list of all cases with  given parent folder.
     *
     * @returns {undefined}
     */
    CaseList.prototype.listCases = function (parentFolderId) {
        var _this = this,
            retVal = $.Deferred(),
            deferred = this.folderManager.getFoldersByParentId(parentFolderId);
        
        deferred.done(function (items) {
            var output = $('.listWrapper', _this.rootElement),
                wrapper = $('<div class="table-responsive"></div>'),
                table = $('<table class="table table-striped table-condensed"></table>'),
                i = 0;

            output.empty();
            for (i; i < items.length; i = i +1) {
                var tr = $('<tr></tr>'),
                    buttonTd = $('<td class="rowButtons"></td>');
                tr.attr('data-id', items[i]['id']);
                tr.append('<td class="caseTitle">' + items[i]['title'] + '</td>');
                tr.append(buttonTd);
                table.append(tr);
            }
            wrapper.append(table);
            output.append(wrapper);
            retVal.resolve();
        });
        
        return retVal;
    };
    
    /**
     * Moves a case from one parent folder to another.
     *
     * @param {type} id
     * @param {type} fromFolderId
     * @param {type} toFolderId
     * @param {type} callback
     * @returns {undefined}
     */
    CaseList.prototype.moveCase = function (id, fromFolderId, toFolderId, callback) {
        var _this = this,
            deferred1,
            deferred2;
            
        deferred1 = this.folderManager.addParent(id, toFolderId);
        deferred1.done(function () {
            deferred2 = _this.folderManager.removeParent(id, fromFolderId);
            deferred2.done(function (resp) {
                console.debug(resp);
                callback.call(_this);
            });
        });
    };
    
    /**
     * Bukds the widget markup.
     *
     * @returns {$}
     */
    CaseList.prototype.buildUI = function () {
        var rootElement = $('<div></div>'),
            html = $(
                '<p>\n' +
                    '<button name="getOpenCases" class="btn btn-sm btn-primary" type="button">Åpne saker</button>\n' +
                    '<button name="getClosedCases" class="btn btn-sm btn-success" type="button">Lukkede saker</button>\n' +
                    '<button name="getPossibleCases" class="btn btn-sm btn-warning" type="button">Kanskjesaker</button>\n' +
                '</p>\n' +
                '<div class="listWrapper"></div>');

        rootElement.attr('id', this.id);
        rootElement.append(html);

        return rootElement;
    };

    return CaseList;
});