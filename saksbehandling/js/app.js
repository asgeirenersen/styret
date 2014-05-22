/* global require, define */
define([
    'widget/CaseList',
    'jquery'
], function (CaseList, $) {
    
    var App = function (config, gapi, appContainer) {
        this.gapi = gapi;
        this.config = config;
        this.id = 'App_' + new Date().getTime();
        this.rootElement = $('<div></div>');
        this.rootElement.attr('id', this.id);
        appContainer.append(this.rootElement);
    };
    
    App.prototype.start = function () {
        var caseList = new CaseList(this.gapi, this, this.config);
        caseList.init();
    };
    
    App.prototype.getRootElement = function () {
        return this.rootElement;
    };
    
    return App;
});