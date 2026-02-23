import { roomIdGenerator } from "../utils/index.js";
import userManager from "./userManager.js";
import User from "../models/User.js";

class RoomManager {
  constructor() {
    this.rooms = {};
  }

  createRoom(hostId) {
    const roomId = roomIdGenerator();
    this.rooms[roomId] = {
      id: roomId,
      hostId: hostId,
      members: [],
      progressBar: 0,
    };
    return roomId;
  }

  getRoom(roomId) {
    return this.rooms[roomId];
  }

  async addUserToRoom(roomId, userId) {
    if (this.rooms[roomId]) {
      let member;
      this.rooms[roomId].members.forEach(user => {
        if(user._id == userId){
          member = user;
        }
      });

      if(!member){
        member = await User.findById(userId).select("-password");
        member._id = member._id.toString();
        this.rooms[roomId].members.push(member);
      }
    }
  }

  deleteRoom(roomId) {
    delete this.rooms[roomId];
  }

  // TODO(KARAN): remove this piece of shit
  updateRoomProgress(roomId, progress, userId) {
    if (this.rooms[roomId]) {
      this.rooms[roomId].progressBar = progress;
      for (let member of this.rooms[roomId].members) {
        if (userManager.getUser(member._id)) {
          userManager.getUser(member._id).send(
            JSON.stringify({
              type: "progress_update",
              progress: progress,
            }),
          );
        }
      }
    }
  }

  removeUserFromRoom(roomId, userId) {
    if (this.rooms[roomId]) {
      this.rooms[roomId].members = this.rooms[roomId].members.filter(
        (member) => {
          return member._id != userId;
        }
      );
    }
  }
}

export default new RoomManager();
