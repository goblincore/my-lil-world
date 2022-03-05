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

const connectedGotchis = {};

io.on('connection', function (socket: Socket) {
    const userId = socket.id;

    console.log('A user connected: ' + userId);

    // New User connected, generated object
    connectedGotchis[userId] = {
      id: userId,
      rotation: 0,
      x: Math.floor(Math.random() * 700) + 50,
      y: Math.floor(Math.random() * 500) + 50,
    };

    socket.on('handleDisconnect', () => {
      socket.disconnect();
    })

    // this sets specific gotchi data for a specific player object
    socket.on('setGotchiData', (gotchi) => {
      connectedGotchis[userId].gotchi = gotchi;
    })

    // This  emits events to this particular user (all other players)
    socket.emit('currentPlayers', connectedGotchis);

    // this emits events to everyone else (current connectd player movement etc)
    socket.broadcast.emit('newPlayer',  connectedGotchis[userId]);

    socket.on('disconnect', function () {
      console.log('A user disconnected: ' + userId);
      delete connectedGotchis[userId];
    });
});

http.listen(port, function () {
    console.log(`Listening on - PORT:${port}`);
});

