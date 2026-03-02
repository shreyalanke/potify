import express from "express";
import roomManager from "../core/roomManager.js";
import { authMiddleware } from "../tokeniser.js";
const router = express.Router();


router.use(authMiddleware);

router.get("/", (req, res) => {
  
  const newRoomId = roomManager.createRoom(req.user.id);
  res.json({ success: true, roomId: newRoomId });

  console.log("Current rooms:", roomManager.rooms);
});

router.get("/:roomId", (req, res) => {
  const { roomId } = req.params;
  const room = roomManager.getRoom(roomId);
  if(room){
    res.json({ success: true, room: room});
  }else{
    res.status(404).json({ success: false, message: "Room not found" });
  }
});

router.post("/:roomId/leave", (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;
  const room = roomManager.getRoom(roomId);
  
  if(!room){
    return res.status(404).json({ success: false, message: "Room not found" });
  }

  // If the user is the host, delete the entire room
  if(room.hostId === userId){
    roomManager.deleteRoom(roomId);
    return res.json({ success: true, message: "Room deleted successfully" });
  }

  // Otherwise, just remove the user from the room
  roomManager.removeUserFromRoom(roomId, userId);
  res.json({ success: true, message: "Left room successfully" });
});

export default router;