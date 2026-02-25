import { WebSocketServer } from "ws";
import roomManager from "./roomManager.js";
import userManager from "./userManager.js";

class SocketManager {
  constructor(server) {
    this.wss = new WebSocketServer({ server });

    this.init();
  }

  init() {
    this.wss.on("connection", async (ws, req) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const roomId = url.searchParams.get("roomId");
      const userId = url.searchParams.get("userId");

      if (!await this.joinSocket(roomId, userId, ws)) {
        return;
      }
      ws.roomId = roomId;
      ws.on("message", (message) => {
        let parsedMessage;
        try {
          parsedMessage = JSON.parse(message);
          this.messageHandler(parsedMessage, userId, ws,roomId);
        } catch (error) {
          console.error("Invalid message format:", message);
          return;
        }
      });
      ws.on("close", () => {
        userManager.removeUser(userId);
        if (roomManager.getRoom(roomId)) {
          roomManager.removeUserFromRoom(roomId, userId);
        }
      });
    });
  }

  async joinSocket(roomId, userId, ws) {
    if (roomManager.getRoom(roomId)) {
      userManager.addUser(userId, ws);

      await roomManager.addUserToRoom(roomId, userId);
      console.log(`User ${userId} joined room ${roomId}`);

      return true;
    } else {
      ws.close();
      return false;
    }
  }

  async messageHandler(message, userId, ws,roomId) {
    switch (message.type) {
      case "selectSong":
        await roomManager.selectSong(roomId, message.songId);

        roomManager.getRoom(roomId).members.forEach(member => {
          userManager.getUser(member._id)?.send(
            JSON.stringify({
              type: "song_selected",
              player: roomManager.getRoom(roomId).player,
            }),
          );
        });
        break;
    }
  }
}
export default SocketManager;
