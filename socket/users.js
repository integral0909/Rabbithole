module.exports = function () {
    /**
     * available users
     * the id value is considered unique (provided by socket.io)
     */
    var usersList = [];

    /**
     * User object
     */
    var User = function (id, username, connected, socketID) {
        this.connected = connected;
        this.ID = id;
        this.username = username;
        this.socketID = socketID
    };

    return {
        addUser: function (id, username, connected, socketID) {
            var user = new User(id, username, connected, socketID);
            usersList.push(user);
        },

        removeUser: function (id) {
            var index = 0;
            while (index < usersList.length && usersList[index].socketID != id) {
                index++;
            }
            usersList.splice(index, 1);
        },

        updateUser: function (id, username, connected, socketID) {
            var user = usersList.find(function (element, i, array) {
                return element.ID == id;
            });
            user.connected = connected;
            user.username = username;
            user.socketID = socketID;
        },

        getUser: function (id) {
            return usersList.find(function (element, i, array) {
                return element.ID == id;
            });
        },
        getMatchedUsers: function (id) {
            return usersList.filter(function (element){
                return element.ID == id;
            });
        },
        getUserBySocketID: function (socketID) {
            return usersList.find(function (element, i, array) {
             return element.socketID == socketID;
             });
        },

        getUsers: function () {
            return usersList;
        }
    }
};