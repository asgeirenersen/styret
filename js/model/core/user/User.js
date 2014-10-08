define([], function () {

    var User = function (email, name, pictureUrl) {
        this.email = email
        this.name = name;
        this.pictureUrl = pictureUrl;
    };

    User.prototype.getEmail = function () {
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