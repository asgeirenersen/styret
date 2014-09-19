define([
    'model/core/user/User',
    'jquery'
],
function (User, $) {

    UserManager = function (usersStruct) {
        this.users = this.populateUsers(usersStruct);
    };

    UserManager.prototype.getAllUsers = function () {
        return this.users;
    };

    UserManager.prototype.populateUsers = function (userStruct) {
        var users = [],
            i = 0;
        for (i; i < userStruct.length; i++) {
            users[i] = new User(userStruct[i]['email'], userStruct[i]['name'], null);
        }

        return users;
    };

    UserManager.prototype.getUserByEmail = function (email) {
        var i = 0;

        for (i; i < this.users.length; i++) {
            if (this.users[i]['email'] === email) {

                return this.users[i];
            }
        }

        return null;
    };

    return UserManager;
});
