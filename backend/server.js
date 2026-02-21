import app from "./app.js";
import envConfig from "./config/index.js";
import { authMiddleware } from "./tokeniser.js";
import { roomIdGenerator } from "./utils/index.js";
import http from "http";
import {WebSocketServer} from "ws";

const PORT = envConfig.PORT || 5000;
let users = {};
let rooms = {};

app.use(authMiddleware);
app.get("/rooms", (req, res) => {
  let newRoomId = roomIdGenerator();
  rooms[newRoomId] = { id: newRoomId, members: [], hostId: req.user.id, progressBar: 0 };
  res.json({ success: true, roomId: newRoomId });

  console.log("Current rooms:", rooms);
});

app.get("/rooms/:roomId", (req, res) => {
  const { roomId } = req.params;
  if(rooms[roomId]){
    res.json({ success: true, room: rooms[roomId] });
  }else{
    res.status(404).json({ success: false, message: "Room not found" });
  }
});

const server = http.createServer(app);

const wss = new WebSocketServer({ server });
wss.on("connection", (ws, req) => {
  console.log(req.url)
  const url = new URL(req.url, `http://${req.headers.host}`);
  const roomId = url.searchParams.get("roomId");
  const userId = url.searchParams.get("userId");
  
  if(rooms[roomId]){
    users[userId] = ws;
    rooms[roomId].members.push(userId);
    console.log(`User ${userId} joined room ${roomId}`);
  }else{
    ws.close();
  }

  ws.on("message", (message) => {
    let parsedMessage;
    try {
      parsedMessage = JSON.parse(message);
      
      if(parsedMessage.type === "progress_update"){
        rooms[roomId].progressBar = parsedMessage.progress;
        for(let memberId of rooms[roomId].members){
          if(users[memberId] && memberId !== userId){
            users[memberId].send(JSON.stringify({ type: "progress_update", progress: parsedMessage.progress }));
          }
        }
      }
    } catch (error) {
      console.error("Invalid message format:", message);
      return;
    }
  });

  ws.on("close",()=>{
    delete users[userId];
    if(rooms[roomId]){
      rooms[roomId].members = rooms[roomId].members.filter(id => id !== userId);
    }
  });
});

let HOST = "0.0.0.0";

server.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});