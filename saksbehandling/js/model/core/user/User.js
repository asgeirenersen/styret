define([], function () {

    var User = function (id, name, pictureUrl) {
        this.id = id;
        this.name = name;
        this.pictureUrl = pictureUrl;
    };

    User.prototype.getId = function () {
        return this.id;
    };

    User.prototype.getName = function () {
        return this.name;
    };

    User.prototype.getPictureUrl = function () {
        return this.pictureUrl;
    };

    return User;
});