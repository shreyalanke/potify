import { roomIdGenerator } from "../utils/index.js";
import userManager from "./userManager.js";
import User from "../models/User.js";
import Song from "../models/Song.js";

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
      player: {
        song: null,
        isPlaying: false,
        // duration: 0,
        lastUpdateTime: new Date().getTime(),
        currentTime: 0,
      }
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

  async selectSong(roomId, songId) {
    if (this.rooms[roomId]) {
      let song = await Song.findById(songId);
      this.rooms[roomId].player.song = song;
      this.rooms[roomId].player.song._id = this.rooms[roomId].player.song._id.toString();
      // this.rooms[roomId].player.duration = song.duration;
      this.rooms[roomId].player.isPlaying = true;
      this.rooms[roomId].player.currentTime = 0;
      this.rooms[roomId].player.lastUpdateTime = new Date().getTime();
    }
  }

  async playPause(roomId, isPlaying) {
    let room = this.rooms[roomId];
    if(room){
      room.player.isPlaying = isPlaying;
      if(isPlaying){
        room.player.lastUpdateTime = new Date().getTime() - room.player.currentTime * 1000;
      }else{
        room.player.currentTime = (new Date().getTime() - room.player.lastUpdateTime) / 1000;
      }     
    }
  }

  async seek(roomId, currentTime) {
    const room = this.rooms[roomId];
    if (!room) return;

    const safeCurrentTime = Math.max(0, Number(currentTime) || 0);
    room.player.currentTime = safeCurrentTime;

    if (room.player.isPlaying) {
      room.player.lastUpdateTime = new Date().getTime() - safeCurrentTime * 1000;
    }
  }

  getPlayerForClient(roomId) {
    const room = this.rooms[roomId];
    if (!room) return null;

    const serverTime = Date.now();
    const player = { ...room.player };

    if (player.isPlaying) {
      player.currentTime = Math.max(0, (serverTime - player.lastUpdateTime) / 1000);
    }

    return {
      ...player,
      serverTime,
    };
  }
}

export default new RoomManager();
