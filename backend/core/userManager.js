class UserManager {
    constructor() { 
        this.users = {};
    }   
     getUser(userId) {
        return this.users[userId];
    }
    addUser(userId, ws) {
        this.users[userId] = ws;
    }
    removeUser(userId) {
        delete this.users[userId];
    }   
}

export default new UserManager();