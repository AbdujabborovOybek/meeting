const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("Yangi foydalanuvchi ulandi");

  socket.on("camera-data", (data) => {
    socket.broadcast.emit("camera-data", data);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server ${PORT}-portda ishga tushdi`));
