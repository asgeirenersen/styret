/**
 * A widget for creating a new case.
 *
 * @param {type} FolderManager
 * @param {type} CaseManager
 * @param {type} $
 * @returns {EditCase}
 */
define([
    'model/google/folder/FolderManager',
    'model/core/case/CaseManager',
    'jquery',
    'handlebars',
    'text!widget/editcase/main.html'
], function (FolderManager, CaseManager, $, Handlebars, mainTemplate) {
    var instance = null;

    /**
     * 
     * @param {Object} gapi Instance of Google API client
     * @param {object} app
     * @param {object} config
     * @returns {EditCase}
     */
    var EditCase = function (gapi, app, config) {
        if (instance === null) {
            instance = this;
        }
        this.gapi = gapi;
        this.parentApp = app;
        this.config = config;
        this.id = 'EditCase' + new Date().getTime();
        this.folderId = null;
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
    EditCase.prototype.init = function () {
        var _this = this;

        this.rootElement = this.buildUI();
        this.parentApp.getRootElement().append(this.rootElement);
        
        $('button', this.rootElement).on('click', function () {
            _this.updateCase().done(function () {
                $(_this.parentApp.getRootElement()).trigger('case:edited');
            });
        });
    };
    
    EditCase.prototype.populate = function (folderId) {
        var deferred = this.caseManager.getCaseByFolderId(folderId);
        this.folderId = folderId;
        deferred.done(function (resp) {
            $('input[name="title"]', this.rootElement).val(resp['title']);
            //$('input[name="description"]', this.rootElement).val(resp['description']);
            $('input[name="status"]', this.rootElement).val([resp['status']]);
        });
    };

    /**
     * Displays the widget.
     *
     * @returns {undefined}
     */
    EditCase.prototype.show = function () {
        this.rootElement.css('display', 'block');
    };
    
    /**
     * Hides the widget.
     *
     * @returns {undefined}
     */
    EditCase.prototype.hide = function () {
        this.rootElement.css('display', 'none');
    };
    
    /**
     * Creates and saves a new case.
     * @returns {Deferred}
     */
    EditCase.prototype.updateCase = function () {
        var deferred;
        deferred = this.caseManager.updateCase(
                this.folderId,
                $('input[name="title"]', this.rootElement).val(),
                //$('input[name="description"]', this.rootElement).val(),
                $('input[name="status"]:checked', this.rootElement).val()
        );

        return deferred;
    };
    
    /**
     * Builds the widget UI.
     *
     * @returns {$}
     */
    EditCase.prototype.buildUI = function () {
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
    
    return EditCase;
});