const mongoose = require("mongoose");
const express = require("express");
const { MONGO_DB_CONFIG } = require("./config/app.config");
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);




mongoose.Promise = global.Promise;

mongoose
  .connect(MONGO_DB_CONFIG.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    () => {
      console.log("Database Connected");
    },
    (error) => {
      console.log("Database can't be connected: " + error);
    }
  );

app.get('/', (req, res) => {
  res.write(`<h1>Socket IO Start on Port : ${PORT} </h1>`);
  res.end
});

var clients = {};
const chatModel = require('./models/chat.model');

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("signin", (id) => {
    console.log(id);
    clients[id] = socket;
    console.log(clients);
  });

  socket.on("message", async (msg) => {
    console.log(msg);
    const chat = new chatModel({
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      message: msg.message
    });
    await chat.save();
    let targetId = msg.receiverId;
    if (clients[targetId]) {
      clients[targetId].emit("message", msg);
    }
  });


  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});


const PORT = process.env.PORT || 3700;
server.listen(PORT, () => {
  console.log(`Server is listening on port 3700`);
});