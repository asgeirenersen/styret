/* global require, define */
define([
    'AuthorizationManager',
    'widget/caselist/CaseList',
    'widget/newcase/NewCase',
    'jquery'
], function (AuthorizationManager, CaseList, NewCase, $) {
    
    /**
     * @param {object} config
     * @param {gapi} gapi Google api client
     * @param {string} clientId Google API client id
     * @param {$} wrapperElement The element where this app will inject itself
     */
    var App = function (config, gapi, clientId, wrapperElement) {
        this.widgets = [];
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
        var caseList = new CaseList(this.gapi, this, this.config);
        caseList.init();
        this.addWidget(caseList, 'Saksliste');
        
        
        var newCase = new NewCase(this.gapi, this, this.config);
        newCase.init();
        this.addWidget(newCase, 'Ny sak');
        
        this.switchToWidget(caseList);  
    };
    
    /**
     * Adds a widget to the app, and creates a link to it on the menu bar.
     * 
     * @param {Object} widget
     * @param {string} title
     */
    App.prototype.addWidget = function (widget, title) {
        var _this = this,
            link = $('<a href="#">' + title + '</a>'),
            item = $('<li></li>').append(link);
            
        this.widgets.push(widget);
        link.on('click', widget, function () {
            _this.switchToWidget(widget);
        });
        this.widgets.push(widget);
        
        $('ul.nav', this.rootElement).append(item);
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
        var menuBar,
            rootElement;
        
        rootElement = $('<div></div>');
        rootElement.attr('id', this.id);
        menuBar = $('<div class="navbar navbar-default"></div>');
        menuBar.append('<div class="navbar-collapse collapse"><ul class="nav navbar-nav"></ul></div>');
        rootElement.append(menuBar);
        rootElement.append('<button type="button" class="btn btn-danger authorize-button" style="display: none">Logg inn</button>');
        
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
    };
    
    /**
     * @returns {$} The root element for the app.
     */
    App.prototype.getRootElement = function () {
        return this.rootElement;
    };
    
    return App;
});