require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
import { Socket } from 'socket.io';
const server = require('express')();

const http = require('http').createServer(server);

const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 8080;

const connectedUsers= {};

io.on('connection', function (socket: Socket) {
    const userId = socket.id;

    console.log('A user connected: ' + userId);

    // New User connected, generated object
    connectedUsers[userId] = {
      id: userId,
      rotation: 0,
      x: Math.floor(Math.random() * 700) + 50,
      y: Math.floor(Math.random() * 500) + 50,
    };

    socket.on('handleDisconnect', () => {
      socket.disconnect();
    })

    // this sets specific gotchi data for a specific player object
    socket.on('setUsersData', (gotchi) => {
      connectedUsers[userId].gotchi = gotchi;
    })

    // This  emits events to this particular you-ser (eg all the other players info)
    socket.emit('currentPlayers', connectedUsers);

    // this emits events to everyone else (current connectd player movement etc eg you-ser)
    socket.broadcast.emit('newPlayer',  connectedUsers[userId]);


    socket.on("playerMovement", function (data) {
      const { x, y } = data;
      connectedUsers[socket.id].x = x;
      connectedUsers[socket.id].y = y;

      console.log('playerMovement', data);
      // emit a message to all players about the player that moved
      socket.broadcast.emit("playerMoved", connectedUsers[socket.id]);
    });

    socket.on("playerStopped", function (data) {
      const { x, y } = data;
      connectedUsers[socket.id].x = x;
      connectedUsers[socket.id].y = y;
      socket.broadcast.emit("otherPlayerStopped",  connectedUsers[socket.id]);
    });


    socket.on('disconnect', function () {
      console.log('A user disconnected: ' + userId);
      delete connectedUsers[userId];
    });
});

http.listen(port, function () {
    console.log(`Listening on - PORT:${port}`);
});

