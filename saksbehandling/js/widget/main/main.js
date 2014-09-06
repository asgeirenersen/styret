/* global require, define */
define([
    'AuthorizationManager',
    'widget/caselist/CaseList',
    'widget/newcase/NewCase',
    'widget/editcase/EditCase',
    'jquery',
    'handlebars',
    'text!widget/main/main.html'
], function (AuthorizationManager, CaseList, NewCase, EditCase, $, Handlebars, mainTemplate) {
    
    /**
     * @param {object} config
     * @param {gapi} gapi Google api client
     * @param {string} clientId Google API client id
     * @param {$} wrapperElement The element where this app will inject itself
     */
    var App = function (config, gapi, clientId, wrapperElement) {
        this.widgets = [];
        this.caseList;
        this.newCase;
        this.editCase;
        this.gapi = gapi;
        this.clientId = clientId;
        this.scopes = 'https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/drive';
        this.am = new AuthorizationManager(gapi, clientId);
        this.config = config;
        this.wrapperElement = wrapperElement;
        this.id = 'App_' + new Date().getTime();
        this.rootElement = this.buildUI();
        this.wrapperElement.append(this.rootElement);
        this.addListeners();
    };
    
    /**
     * Authorizes and adds the widgets.
     */
    App.prototype.start = function () {
        var _this = this,
            deferred = this.authorize(false);
        
        deferred.done(function () {
            _this.addWidgets();
        });
    };
    
    /**
     * 
     * @param {boolean} userInitiated Is the authorization triggered by a user action?
     * @returns {Deferred}
     */
    App.prototype.authorize = function (userInitiated) {
        var _this = this,
            result = $.Deferred(),
            deferred = this.am.authorize(this.scopes, !userInitiated);
        
        deferred.done(function (loggedIn) {
            if (!loggedIn) {
                console.log('Auth failed!');
                _this.showLogin();
                result.reject(false);
            } else {
                console.log('Auth success!');
                _this.hideLogin();
                result.resolve(true);
            }
        });
        
        return result;
    };
    
    /**
     * Show the login button.
     */
    App.prototype.showLogin = function () {
        $('.authorize-button', this.rootElement).css('display', 'block');
    };
    
    /**
     * Hide the login button.
     */
    App.prototype.hideLogin = function () {
        $('.authorize-button', this.rootElement).css('display', 'none');
    };
    
    /**
     * Adds all available widgets to the menu.
     */
    App.prototype.addWidgets = function () {
        this.caseList = new CaseList(this.gapi, this, this.config);
        this.caseList.init();
        this.addWidget(this.caseList, 'Saksliste');
        
        
        this.newCase = new NewCase(this.gapi, this, this.config);
        this.newCase.init();
        this.addWidget(this.newCase, 'Ny sak');

        
        this.editCase = new EditCase(this.gapi, this, this.config);
        this.editCase.init();
        this.addWidget(this.editCase, '');
        
        this.switchToWidget(this.caseList);
    };
    
    /**
     * Adds a widget to the app, and creates a link to it on the menu bar.
     * 
     * @param {Object} widget
     * @param {string} title
     */
    App.prototype.addWidget = function (widget, title) {
        this.widgets.push(widget);
    };
    
    /**
     * Displays the specified widget and closes the currently active one.
     * 
     * @param {Object} widget
     */
    App.prototype.switchToWidget = function (widget) {
        var i = 0;
        for (i; i < this.widgets.length; i = i + 1) {
            if (this.widgets[i] !== widget) {
                this.widgets[i].hide();
            }
        }
        widget.show();
    };
    
    /**
     * Builds the markup for the application.
     * 
     * @returns {$} The root element containing the DOM fragment for the app.
     */
    App.prototype.buildUI = function () {
        var rootElement,
            html;

        mainTemplate = Handlebars.compile(mainTemplate);
        html = mainTemplate({"id": this.id});
        rootElement = $(html);

        return rootElement;
    };
    
    /**
     * Adds event listeners to the UI elements.
     */
    App.prototype.addListeners = function () {
        var _this = this;

        $('.authorize-button', this.rootElement).on('click', null, function () {
            _this.authorize(true).done(function () {
                _this.addWidgets();
            });
        });

        $(this.rootElement).on('case:added', function (event) {
            _this.switchToWidget(_this.caseList);
            _this.caseList.listOpenCases();
        });

        $(this.rootElement).on('case:editRequested', function (event, id) {
            _this.switchToWidget(_this.editCase);
            _this.editCase.populate(id);
        }); 

        $(this.rootElement).on('case:edited', function (event, id) {
            _this.switchToWidget(_this.caseList);
            _this.caseList.listOpenCases();
        });

        $(this.rootElement).on('case:newRequested', function (event) {
            _this.switchToWidget(_this.newCase);
        });

        $(this.rootElement).on('case:editCancelled', function (event) {
            _this.switchToWidget(_this.caseList);
        }); 
    };
    
    /**
     * @returns {$} The root element for the app.
     */
    App.prototype.getRootElement = function () {
        return this.rootElement;
    };
    
    return App;
});