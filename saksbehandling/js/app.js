/* global require, define */
define([
    'widget/CaseList',
    'jquery'
], function (CaseList, $) {
    
    var App = function (config, gapi, appContainer) {
        this.widgets = [];
        this.gapi = gapi;
        this.config = config;
        this.appContainer = appContainer;
        this.id = 'App_' + new Date().getTime();
        this.rootElement = this.buildUI();
        this.appContainer.append(this.rootElement);
    };
    
    App.prototype.start = function () {
        var caseList = new CaseList(this.gapi, this, this.config);
        caseList.init();
        
        this.addWidget(caseList, 'Saksliste');
        this.switchToWidget(caseList);
    };
    
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
    
    App.prototype.switchToWidget = function (widget) {
        var i = 0;
        for (i; i < this.widgets.length; i = i + 1) {
            if (this.widgets[i] !== widget) {
                this.widgets[i].hide();
            }
        }
        widget.show();
    };
    
    App.prototype.buildUI = function () {
        var menuBar,
            rootElement;
        
        rootElement = $('<div></div>');
        rootElement.attr('id', this.id);
        menuBar = $('<div class="navbar navbar-default"></div>');
        menuBar.append('<div class="navbar-collapse collapse"><ul class="nav navbar-nav"></ul></div>');
        rootElement.append(menuBar);
        
        return rootElement;
    }
    
    App.prototype.getRootElement = function () {
        return this.rootElement;
    };
    
    return App;
});