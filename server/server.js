const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: [
      "https://meeting-azure.vercel.app",
      "http://127.0.0.1/:3000",
      "http://127.0.0.1/:3001",
    ],
  },
});

const PORT = 8090 || process.env.PORT;
io.on("connection", (socket) => {
  console.log("Connected");

  socket.on("message", (message) => {
    socket.broadcast.emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected");
  });
});

function error(err, req, res, next) {
  // log it
  if (!test) console.error(err.stack);

  // respond with 500 "Internal Server Error".
  res.status(500);
  res.send("Internal Server Error");
}
app.use(error);

app.get("/ping", (req, res) => {
  res.send("pong");
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
