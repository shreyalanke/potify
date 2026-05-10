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
      if(roomManager.getRoom(roomId)){
        const room = roomManager.getRoom(roomId);
        room.members.forEach(member => {
          userManager.getUser(member._id)?.send(JSON.stringify({
            type: "roomUpdate",
            room: {
              ...room,
              roles: roomManager.getRolesMap(roomId),
              player: roomManager.getPlayerForClient(roomId)
            },
          }));
        })
      }
      
      const messageHistory = roomManager.getMessageHistory(roomId);
      if (messageHistory) {
        userManager.getUser(userId)?.send(JSON.stringify({
          type: "chat_history",
          messages: messageHistory,
        }));
      }
      
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
          const room = roomManager.getRoom(roomId);
          room.members.forEach(member => {
            userManager.getUser(member._id)?.send(JSON.stringify({
              type: "roomUpdate",
              room: {
                ...room,
                roles: roomManager.getRolesMap(roomId),
                player: roomManager.getPlayerForClient(roomId)
              },
            }));
          })
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
              player: roomManager.getPlayerForClient(roomId),
            }),
          );
        });
        break;
        case "isPlaying":
          await roomManager.playPause(roomId,  message.isPlaying);
          if(roomManager.getRoom(roomId)){
            roomManager.getRoom(roomId).members.forEach(member => {
              userManager.getUser(member._id)?.send(
                JSON.stringify({
                  type: "playerUpdate",
                  player: roomManager.getPlayerForClient(roomId),
                }),
              );
            });
          }
          break;
        case "seek":
          await roomManager.seek(roomId, message.currentTime);
          if(roomManager.getRoom(roomId)){
            roomManager.getRoom(roomId).members.forEach(member => {
              userManager.getUser(member._id)?.send(
                JSON.stringify({
                  type: "playerUpdate",
                  player: roomManager.getPlayerForClient(roomId),
                }),
              );
            });
          }
          break;
        case "add_to_queue":
          {
            try {
              const Song = (await import("../models/Song.js")).default;
              const song = await Song.findById(message.songId);
              
              if (!song) {
                userManager.getUser(userId)?.send(
                  JSON.stringify({
                    type: "queue_error",
                    message: "Song not found",
                  }),
                );
                break;
              }

              const room = roomManager.getRoom(roomId);
              const user = room?.members?.find(m => m._id === userId);
              const userName = user?.name || "Unknown";
              
              await roomManager.addToQueue(roomId, song, userId, userName);
              const queue = roomManager.getQueue(roomId);

              if(room){
                room.members.forEach(member => {
                  userManager.getUser(member._id)?.send(
                    JSON.stringify({
                      type: "queue_updated",
                      queue: queue,
                    }),
                  );
                });
              }
            } catch (error) {
              console.error("Error adding to queue:", error);
              userManager.getUser(userId)?.send(
                JSON.stringify({
                  type: "queue_error",
                  message: "Failed to add song to queue",
                }),
              );
            }
          }
          break;
        case "song_ended":
          {
            const room = roomManager.getRoom(roomId);
            const queuedSong = roomManager.dequeueFirstSong(roomId);

            if (queuedSong) {
              const { id, ...songData } = queuedSong;
              const Song = (await import("../models/Song.js")).default;
              const songDoc = await Song.findById(id);
              
              if (songDoc) {
                await roomManager.selectSong(roomId, id);
                
                if(room){
                  room.members.forEach(member => {
                    userManager.getUser(member._id)?.send(
                      JSON.stringify({
                        type: "play_song",
                        player: roomManager.getPlayerForClient(roomId),
                      }),
                    );
                  });
                }
              }
            } else {
              if(room){
                room.members.forEach(member => {
                  userManager.getUser(member._id)?.send(
                    JSON.stringify({
                      type: "queue_empty",
                    }),
                  );
                });
              }
            }
          }
          break;
        case "remove_member":
          {
            if (!roomManager.isHostOrAdmin(roomId, userId)) {
              userManager.getUser(userId)?.send(
                JSON.stringify({
                  type: "error",
                  message: "Only the host and admins can remove members",
                }),
              );
              break;
            }

            const targetUserId = message.targetUserId;
            if (!targetUserId) break;

            const targetUser = userManager.getUser(targetUserId);
            
            roomManager.removeUserFromRoom(roomId, targetUserId);
            
            if (targetUser) {
              targetUser.send(
                JSON.stringify({
                  type: "you_were_removed",
                })
              );
            }

            const room = roomManager.getRoom(roomId);
            if (room) {
              room.members.forEach(member => {
                userManager.getUser(member._id)?.send(
                  JSON.stringify({
                    type: "roomUpdate",
                    room: {
                      ...room,
                      roles: roomManager.getRolesMap(roomId),
                      player: roomManager.getPlayerForClient(roomId)
                    },
                  }),
                );
              });
            }
          }
          break;
        case "remove_from_queue":
          {
            if (!roomManager.isHostOrAdmin(roomId, userId)) {
              userManager.getUser(userId)?.send(
                JSON.stringify({
                  type: "error",
                  message: "Only hosts and admins can remove songs from the queue",
                }),
              );
              break;
            }

            const songId = message.songId;
            if (!songId) break;

            const room = roomManager.getRoom(roomId);
            if (!room) break;

            const updatedQueue = roomManager.removeUserFromQueueById(roomId, songId);
            
            if (updatedQueue !== null) {
              room.members.forEach(member => {
                userManager.getUser(member._id)?.send(
                  JSON.stringify({
                    type: "queue_updated",
                    queue: updatedQueue,
                  }),
                );
              });
            }
          }
          break;
        case "make_admin":
          {
            if (!roomManager.isHost(roomId, userId)) {
              userManager.getUser(userId)?.send(
                JSON.stringify({
                  type: "error",
                  message: "Only the host can promote members to admin",
                }),
              );
              break;
            }

            const targetUserId = message.targetUserId;
            if (!targetUserId || targetUserId === roomManager.getRoom(roomId)?.hostId) {
              break;
            }

            const success = roomManager.promoteToAdmin(roomId, targetUserId);
            
            if (success) {
              const room = roomManager.getRoom(roomId);
              if (room) {
                const rolesMap = roomManager.getRolesMap(roomId);
                room.members.forEach(member => {
                  userManager.getUser(member._id)?.send(
                    JSON.stringify({
                      type: "room_roles_updated",
                      roles: rolesMap,
                    }),
                  );
                });
              }
            }
          }
          break;
        case "send_message":
          {
            const room = roomManager.getRoom(roomId);
            if (!room) break;

            const isMember = room.members.some(m => m._id === userId);
            if (!isMember) {
              userManager.getUser(userId)?.send(
                JSON.stringify({
                  type: "error",
                  message: "You are not a member of this room",
                }),
              );
              break;
            }

            const messageText = message.message?.trim();
            if (!messageText) break;

            const sender = room.members.find(m => m._id === userId);
            const senderName = sender?.name || "Unknown";

            const messageObj = roomManager.addMessage(roomId, {
              text: messageText,
              senderId: userId,
              senderName: senderName,
            });

            room.members.forEach(member => {
              userManager.getUser(member._id)?.send(
                JSON.stringify({
                  type: "new_message",
                  message: messageObj,
                }),
              );
            });
          }
          break;
          
    }
  }
}
export default SocketManager;
