/**
 * A widget for creating a new case.
 *
 * @param {type} FolderManager
 * @param {type} CaseManager
 * @param {type} $
 * @returns {NewCase}
 */
define([
    'model/google/folder/FolderManager',
    'model/core/case/CaseManager',
    'jquery',
    'handlebars',
    'text!widget/newcase/main.html'
], function (FolderManager, CaseManager, $, Handlebars, mainTemplate) {
    var instance = null;

    /**
     * 
     * @param {Object} gapi Instance of Google API client
     * @param {object} app
     * @param {object} config
     * @returns {NewCase}
     */
    var NewCase = function (gapi, app, config) {
        if (instance === null) {
            instance = this;
        }
        this.gapi = gapi;
        this.parentApp = app;
        this.config = config;
        this.id = 'NewCase' + new Date().getTime();
        this.folderManager = new FolderManager(gapi);
        this.caseManager = new CaseManager(this.config, this.folderManager);
        this.rootElement;
    };
    
    /**
     * Initializes the widget.
     * Must be called before using the widget.
     *
     * @returns {undefined}
     */
    NewCase.prototype.init = function () {
        var _this = this;

        this.rootElement = this.buildUI();
        this.parentApp.getRootElement().append(this.rootElement);

        $('button.btn-submit', this.rootElement).on('click', function () {
            _this.createCase().done(function () {
                $(_this.parentApp.getRootElement()).trigger('case:added');
            });
        });

        $('button.btn-cancel', this.rootElement).on('click', function () {
            _this.updateCase().done(function () {
                $(_this.parentApp.getRootElement()).trigger('case:editCancelled');
            });
        });
    };

    /**
     * Displays the widget.
     *
     * @returns {undefined}
     */
    NewCase.prototype.show = function () {
        this.rootElement.css('display', 'block');
    };
    
    /**
     * Hides the widget.
     *
     * @returns {undefined}
     */
    NewCase.prototype.hide = function () {
        this.rootElement.css('display', 'none');
    };
    
    /**
     * Creates and saves a new case.
     * @returns {Deferred}
     */
    NewCase.prototype.createCase = function () {
        var deferred;
        deferred = this.caseManager.createCase(
                $('input[name="title"]', this.rootElement).val(),
                $('input[name="status"]:checked', this.rootElement).val()
        );

        return deferred;
    };
    
    /**
     * Builds the widget UI.
     *
     * @returns {$}
     */
    NewCase.prototype.buildUI = function () {
        var template,
            rootElement,
            html;

        template = Handlebars.compile(mainTemplate);
        html = template({
            "id": this.id,
            "statusNames": {
                "open": this.caseManager.statusOpen,
                "closed": this.caseManager.statusClosed,
                "possible": this.caseManager.statusPossible
            }
        });
        rootElement = $(html);

        return rootElement;
    };
    
    return NewCase;
});