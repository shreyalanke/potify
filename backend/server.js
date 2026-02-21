import app from "./app.js";
import envConfig from "./config/index.js";
import http from "http";
import {WebSocketServer} from "ws";

const PORT = envConfig.PORT || 5000;

const server = http.createServer(app);

const wss = new WebSocketServer({ server });
wss.on("connection", (ws) => {
  console.log("New WebSocket connection established");
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});