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
    'jquery'
], function (FolderManager, CaseManager, $) {
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
        
        $('button', this.rootElement).on('click', function () {
            _this.createCase().done(function () {
                $(_this.parentApp.getRootElement()).trigger('case:added');
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
                $('input[name="description"]', this.rootElement).val(),
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
        var rootElement = $('<div></div>'),
            head = $('<h2></h2>').text('Opprett ny sak'),
            form = $('<form name="newCase" role="form"></form>'),
            titleLabel = $('<label>Tittel</label>'),
            titleInput = $('<input type="text" name="title" class="form-control">'),
            descriptionLabel = $('<label>Beskrivelse</label>'),
            descriptionInput = $('<textarea name="description" rows="5" cols="30" class="form-control"></textarea>'),
            btn = $('<div><button type="button" class="btn btn-sm btn-primary">Lagre</button></div>'),
            radioOpen = $('<label class="radio-inline"><input type="radio" name="status" value="' + this.caseManager.statusOpen + '" checked> Åpen</label>'),
            radioPossible = $('<label class="radio-inline"><input type="radio" name="status" value="' + this.caseManager.statusPossible + '"> Kanskje</label>'),
            radioClosed = $('<label class="radio-inline"><input type="radio" name="status" value="' + this.caseManager.statusClosed + '"> Lukket</label>'),
            formGroupStr = '<div class="form-group"></div>';
    
        form.append($(formGroupStr).append(titleLabel.append(titleInput)));
        form.append($(formGroupStr).append(descriptionLabel.append(descriptionInput)));
        form.append($(radioOpen));
        form.append($(radioClosed));
        form.append($(radioPossible));
        form.append(btn);
        
        rootElement.append(head);
        rootElement.append(form);
        
        return rootElement;
    };
    
    return NewCase;
});