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
    var EditCase = function (gapi, app, config, userManager) {
        if (instance === null) {
            instance = this;
        }
        this.gapi = gapi;
        this.parentApp = app;
        this.config = config;
        this.id = 'EditCase' + new Date().getTime();
        this.folderId = null;
        this.userManager = userManager;
        this.currentUser = null;
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

        $('button.btn-submit', this.rootElement).on('click', function () {
            if (_this.folderId === null) {
                _this.createCase().done(function () {
                    $(_this.parentApp.getRootElement()).trigger('case:added');
                });
            } else {
                _this.updateCase().done(function () {
                    $(_this.parentApp.getRootElement()).trigger('case:edited');
                });
            }

        });

        $('button.btn-cancel', this.rootElement).on('click', function () {
            $(_this.parentApp.getRootElement()).trigger('case:editCancelled');
        });
    };

    EditCase.prototype.populate = function (folderId) {
        var deferred,
            _this = this;
        this.folderId = folderId;

        deferred = this.caseManager.getCaseByFolderId(folderId);
        deferred.done(function (resp) {
            var theCase = _this.caseManager.getPopulatedCaseFromFolder(resp);
            $('input[name="title"]', _this.rootElement).val(theCase['title']);
            $('input[name="status"]', _this.rootElement).val([theCase['status']]);
            $('select[name="caseOwner"]', _this.rootElement).val([theCase['ownerEmail']]);
        });
    };

    EditCase.prototype.populateNew = function () {
        var _this = this;
        this.folderId = null;

        this.userManager.getCurrentUser()
            .done(function (user) {
                _this.currentUser = user;
                $('input[name="title"]', _this.rootElement).val('');
                $('input[name="status"]', _this.rootElement).val([_this.caseManager.statusOpen]);
                $('select[name="caseOwner"]', _this.rootElement).val([user.email]);
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
            $('input[name="status"]:checked', this.rootElement).val(),
            $('select[name="caseOwner"]', this.rootElement).val()
        );

        return deferred;
    };

    /**
     * Creates and saves a new case.
     *
     * @returns {Deferred}
     */
    EditCase.prototype.createCase = function () {
        var deferred;
        deferred = this.caseManager.createCase(
            $('input[name="title"]', this.rootElement).val(),
            $('input[name="status"]:checked', this.rootElement).val(),
            $('select[name="caseOwner"]', this.rootElement).val()
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
            },
            "users": this.parentApp.userManager.getAllUsers()
        });
        rootElement = $(html);

        return rootElement;
    };

    return EditCase;
});