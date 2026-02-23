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

  async asyncGetRoom(roomId) {
    let room = this.rooms[roomId];
    if (room) {
      let members = room.members.map((id) => {
        let member = User.findById(id).select("-password");
        return member;
      });

      members = await Promise.all(members).then((membersData) => {
        return membersData;
      });
      return {
        ...room,
        members:members
      }
    }
  }

  getRoom(roomId) {
    return this.rooms[roomId];
  }

  addUserToRoom(roomId, userId) {
    if (this.rooms[roomId]) {
      this.rooms[roomId].members.push(userId);
    }
  }

  deleteRoom(roomId) {
    delete this.rooms[roomId];
  }

  updateRoomProgress(roomId, progress, userId) {
    if (this.rooms[roomId]) {
      this.rooms[roomId].progressBar = progress;
      for (let memberId of this.rooms[roomId].members) {
        if (userManager.getUser(memberId)) {
          userManager.getUser(memberId).send(
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
        (id) => id !== userId,
      );
    }
  }
}

export default new RoomManager();
