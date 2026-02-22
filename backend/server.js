import app from "./app.js";
import envConfig from "./config/index.js";
import http from "http";
import SocketManager from "./core/socketManager.js";

const PORT = envConfig.PORT || 5000;
let users = {};
let rooms = {};

const server = http.createServer(app);
const socketManager = new SocketManager(server);



server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});