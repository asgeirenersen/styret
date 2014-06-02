/* global require, define */
define([
    'AuthorizationManager',
    'widget/CaseList',
    'jquery'
], function (AuthorizationManager, CaseList, $) {
    
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
    };
    
    /**
     * Authorizes and adds the widgets.
     */
    App.prototype.start = function () {
        var _this = this,
            deferred = this.authorize(false);
        
        deferred.done(function () {
            console.log('Auth success!');
            _this.addWidgets();
        });
        deferred.fail(function () {
            console.log('Auth failed!');
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
                _this.showLogin();
                result.reject(false);
            } else {
                _this.hideLogin();
                result.resolve(true);
            }
        });
        
        return result;
    };
    
    App.prototype.showLogin = function () {
        $('.authorize-button', this.rootElement).css('display', 'block');
    };
    
    App.prototype.hideLogin = function () {
        $('.authorize-button', this.rootElement).css('display', 'none');
    };
    
    /**
     * Adds all widgets to the menu.
     */
    App.prototype.addWidgets = function () {
        var caseList = new CaseList(this.gapi, this, this.config);
        caseList.init();
        
        this.addWidget(caseList, 'Saksliste');
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
        rootElement.append('<button type="button" class="btn btn-danger authorize-button" style="visibility: hidden">Logg inn</button>');
        
        return rootElement;
    };
    
    App.prototype.addListeners = function () {
        var _this = this;

        $('authorize-button', this.rootElement).on('click', null, function () {
            _this.authorize(true);
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