define(['jquery',], function($) {

    var pickerFactory = function(am) {
        var _this = this,
            deferred = $.Deferred();

        this.gapi = am.gapi;
        this.oauthToken = am.oauthToken;
        this.apiKey = am.apiKey;
        this.apiLoaded = false;

        this.gapi.load('picker', {'callback': function() {
            _this.apiLoaded = true;
            deferred.resolve(_this);
        }});

        return deferred.promise();
    };

    pickerFactory.prototype.build = function() {
        var uploadView = new google.picker.DocsUploadView().
            setIncludeFolders(true);
        var picker = new google.picker.PickerBuilder().
            addView(uploadView).
            addView(google.picker.ViewId.DOCS).
            setOAuthToken(this.oauthToken).
            setDeveloperKey(this.apiKey).
            enableFeature(google.picker.Feature.MULTISELECT_ENABLED).
            setCallback(function(data) {
                var url = 'nothing';
                if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
                  var doc = data[google.picker.Response.DOCUMENTS][0];
                  url = doc[google.picker.Document.URL];
                }
                var message = 'You picked: ' + url;
                document.getElementById('result').innerHTML = message;
            }).
            build();

        return picker;
    };

    return pickerFactory;
});