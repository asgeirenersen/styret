
/**
* @param {Object} gapi Instance of Google API client
*/
FolderManager = function (gapi) {
    var _this = this;
    this.ready = false;
    this.gapi = gapi;
    this.gapi.client.load('drive', 'v2', function () {
        _this.ready = true;
    });
}

FolderManager.prototype.getById = function (id) {
    if (!this.ready) {
        alert("Not so fast!");
        return;
    }
    var request = this.gapi.client.drive.files.get({
    'fileId': id
    });
    request.execute(function(resp) {
        console.log('Title: ' + resp.title);
        console.log('Description: ' + resp.description);
        console.log('MIME type: ' + resp.mimeType);
    });
}
