define([
    'model/core/user/User',
    'jquery'
],
function (User, $) {

    UserManager = function (usersStruct, userMapper) {
        this.users = this.populateUsers(usersStruct);
        this.currentUser = null;
        this.userMapper = userMapper;
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


    UserManager.prototype.getCurrentUser = function () {
        var deferred = $.Deferred(),
            _this = this;

        if (this.currentUser !== null) {
            deferred.resolve(this.currentUser);
        } else {
            this.userMapper.getMyProfile()
                .done(function (profile) {
                    var user = _this.getUserFromProfile(profile);
                    _this.cacheUser(user);
                    _this.currentUser = user;
                    deferred.resolve(user);
                });
        }

        return deferred;
    };

    /**
     * Adds or replaces a user to/in the cache.
     *
     * @param {User} user
     */
    UserManager.prototype.cacheUser = function (user) {
        var cachedUser = this.getUserByEmail(user.getEmail());

        if (cachedUser !== null) {
            cachedUser = user;
        } else {
            this.users.push(user);
        }
    }

    /**
     * Creates a user object based on a Google person profile resource
     *
     * @param {} profile Google person profile resource
     * @returns {User}
     */
    UserManager.prototype.getUserFromProfile = function (profile) {
        var email = profile['emails'][0]['value'],
            pictureUrl = null,
            user = null;

        if (profile['image']) {
            pictureUrl = profile['image']['url'];
        }

        user = new User(
                email,
                profile['displayName'],
                pictureUrl
            );

        return user;
    };

    return UserManager;
});
