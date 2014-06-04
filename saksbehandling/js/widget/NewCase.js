
define(['model/google/folder/FolderManager', 'jquery'], function (FolderManager, $) {
    var instance = null;

    var NewCase = function (gapi, app, config) {
        if (instance === null) {
            instance = this;
        }
        this.gapi = gapi;
        this.parentApp = app;
        this.config = config;
        this.id = 'NewCase' + new Date().getTime();
        this.folderManager = new FolderManager(gapi);
        this.rootElement;
    };
    
    NewCase.prototype.init = function () {
        var _this = this;

        this.rootElement = this.buildUI();
        this.parentApp.getRootElement().append(this.rootElement);
        
        $('button', this.rootElement).on('click', function () {
            
        });
    };
    
    NewCase.prototype.buildUI = function () {
        var rootElement = $('<div></div>'),
            head = $('<h2></h2>').text('Opprett ny sak'),
            form = $('<form name="newCase" class="newCase"></form>'),
            titleLabel = $('<label>Tittel</label>'),
            titleInput = $('<input type="text" name="title">'),
            descriptionLabel = $('<label>Beskrivelse</label>'),
            descriptionInput = $('<textarea name="description" rows="5" cols="30"></textarea>'),
            btn = $('<button type="button" class="btn btn-sm btn-primary">Lagre</button>');
    
        form.append(titleLabel.append(titleInput));
        form.append(descriptionLabel.append(descriptionInput));
        form.append(btn);
        
        rootElement.append(head);
        rootElement.append(form);
        
        return rootElement;
    };
});