
define([
    'model/google/folder/FolderManager',
    'model/core/case/CaseManager',
    'jquery',
    'handlebars',
    'text!widget/caselist/list.html',
    'text!widget/caselist/main.html'
], function (FolderManager, CaseManager, $, Handlebars, listTemplate, mainTemplate) {
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
        this.caseManager = new CaseManager(this.config, this.folderManager);
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
        $('button[name="getMyCases"]', this.rootElement).on('click', function () {
            _this.listMyCases();
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
     */
    CaseList.prototype.hide = function () {
        this.rootElement.css('display', 'none');
    };
    
    /**
     * Fetches and diplays a list of all open cases.
     */
    CaseList.prototype.listOpenCases = function () {
        var _this = this,
            listReady = this.listCases(this.caseManager.statusOpen);
        
        listReady.done(function () {
            $('.rowButtons', _this.rootElement).each(function () {
                $(this).append('<a class="closeBtn" href="#">(Lukk)</a>');
            });

            $('.closeBtn', _this.rootElement).on('click', null, function (e) {
                var clickedElement = $(e.target),
                    tr = clickedElement.closest('tr'),
                    id = tr.attr('data-id'),
                    title = $('.caseTitle', tr).text(),
                    confirmTxt = 'Vil du lukke denne saken?\n' + title;

                e.preventDefault();
                if (confirm(confirmTxt)) {
                    _this.caseManager.changeStatus(id, _this.caseManager.statusOpen, _this.caseManager.statusClosed, function () {
                        _this.listOpenCases();
                    });
                }
            });
        });
    };
    
    /**
     * Fetches and diplays a list of all closed cases.
     */
    CaseList.prototype.listClosedCases = function () {
        var _this = this,
            listReady = this.listCases(this.caseManager.statusClosed);
        
        listReady.done(function () {
            $('.rowButtons', _this.rootElement).each(function () {
                $(this).append('<a class="reopenBtn" href="#">(Gjenåpne)</a>');
            });

            $('.reopenBtn', _this.rootElement).on('click', null, function (e) {
                var clickedElement = $(e.target),
                    tr = clickedElement.closest('tr'),
                    id = tr.attr('data-id'),
                    title = $('.caseTitle', tr).text(),
                    confirmTxt = 'Vil du gjenåpne denne saken?\n' + title;

                e.preventDefault();
                if (confirm(confirmTxt)) {
                    _this.caseManager.changeStatus(id, _this.caseManager.statusClosed, _this.caseManager.statusOpen, function () {
                        _this.listClosedCases();
                    });
                }
            });
        });
    };
    
    /**
     * Fetches and diplays a list of all possible cases.
     */
    CaseList.prototype.listPossibleCases = function () {
        var _this = this,
            listReady = this.listCases(this.caseManager.statusPossible);
        
        listReady.done(function () {
            $('.rowButtons', _this.rootElement).each(function () {
                $(this).append('<a class="openBtn" href="#">(Åpne)</a>');
            });

            $('.openBtn', _this.rootElement).on('click', null, function (e) {
                var clickedElement = $(e.target),
                    tr = clickedElement.closest('tr'),
                    id = tr.attr('data-id'),
                    title = $('.caseTitle', tr).text(),
                    confirmTxt = 'Vil du åpne denne saken?\n' + title;

                e.preventDefault();
                if (confirm(confirmTxt)) {
                    _this.caseManager.changeStatus(id, _this.caseManager.statusPossible, _this.caseManager.statusOpen, function () {
                        _this.listPossibleCases();
                    });
                }
            });
        });
    };
    
    /**
     * Fetches and diplays a list of all cases with  given parent folder.
     *
     * @param {String} status One of the status "constants" in CaseManager.
     * @returns {Deferred}
     */
    CaseList.prototype.listCases = function (status) {
        var _this = this,
            retVal = $.Deferred(),
            deferred = this.caseManager.getCasesByStatus(status);

        deferred.done(function (items) {
            var output = $('.listWrapper', _this.rootElement),
                html,
                template;
            
            output.empty();   
            template = Handlebars.compile(listTemplate);
            html = template({
                "items": items,
                "status": status
            });
            output.append(html);
            
            $('a.edit-list-item', _this.rootElement).on('click', null, function (e) {
                var clickedElement = $(e.target),
                    tr = clickedElement.closest('tr'),
                    id = tr.attr('data-id');

                e.preventDefault();
                $(_this.parentApp.getRootElement()).trigger('case:editRequested', [id]);
            });
            
            retVal.resolve();
        });
        
        return retVal;
    };
    
    /**
     * Bukds the widget markup.
     *
     * @returns {$}
     */
    CaseList.prototype.buildUI = function () {
        var template,
            rootElement,
            html;

        template = Handlebars.compile(mainTemplate);
        html = template({"id": this.id});
        rootElement = $(html);

        return rootElement;
    };

    return CaseList;
});