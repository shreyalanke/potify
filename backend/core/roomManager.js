import { roomIdGenerator } from "../utils/index.js";
import userManager from "./userManager.js";

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
