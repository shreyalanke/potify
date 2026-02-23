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

router.get("/:roomId", async (req, res) => {
  const { roomId } = req.params;
  const room = await roomManager.asyncGetRoom(roomId);
  if(room){
    res.json({ success: true, room: room});
  }else{
    res.status(404).json({ success: false, message: "Room not found" });
  }
});

export default router;