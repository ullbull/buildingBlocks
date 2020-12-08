'use strict';
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const connection = require('./connectionToClients.js');
const dataKeeper = require('./dataKeeper_njs.js');
const dataKeeper_2 = require('./dataKeeper_2_njs.js');
const users = require('./users_njs.js');
const fileManager = require('./fileManager.js');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

fileManager.loadFile('0,0');

// Run when client connects
io.on('connection', socket => {
  console.log('User connected', socket.id);
  socket.emit('message', `Welcome ${socket.id}`);

  // Listen for data from client
  socket.on('subscribe', sectionNames => {

    // Leave all rooms
    let user = users.getUser(socket.id);
    if (user) {
      user.subscriptions.forEach(sectionName => {
        socket.leave(sectionName);
      });
    }

    // Add user
    user = users.addUser(socket.id, sectionNames);

    // Join rooms
    sectionNames.forEach(sectionName => {
      socket.join(sectionName);
    });

    console.log('user joined', user);

    // Welcome current user
    socket.emit('message', `Welcome to room ${sectionNames}`);

    // Send sections to client
    socket.emit('sections', fileManager.getSections(sectionNames));

    // Broadcast when a user connects
    sectionNames.forEach(sectionName => {
      socket.broadcast.to(sectionName).emit('message',
        `${user.id} has joined us`
      );
    })

    // // Send users and room info
    // io.to(user.room).emit('roomUsers', {
    //   room: user.room,
    //   users: getRoomUsers(user.room)
    // }); 
  });

  socket.on('addSubscription', sectionNames => {
    users.addSubscriptions(socket.id, sectionName)
  });

  socket.on('message', message => {
    console.log(`Incoming message from ${socket.id}: ${message}`);
    socket.emit('message', `Hey, I'm your server. Thanks for your message! You sent me this: ${message}`);

  });

  socket.on('requestSections', sectionNames => {

    // Send sections to client
    socket.emit('sections', fileManager.getSections(sectionNames));
  })

  socket.on('blocksArray', blocksArray => {
    const user = users.getUser(socket.id);

    // Send incoming blocks to all clients in room
    user.subscriptions.forEach(sectionName => {
      io.to(sectionName).emit('blocksArray', blocksArray);
    });

    // Add the blocks on server
    const sectionNames = dataKeeper_2.addBlocks(blocksArray);

    resetHiddenBlocks(socket.id);

    // Save all sections where a block has been added
    fileManager.saveSectionsToFiles(sectionNames);
  });

  socket.on('worker', worker => {
    // Send incoming worker to all clients except this one
    socket.broadcast.emit('worker', worker);
  });

  socket.on('deleteBlocks', blockIDs => {
    // Delete blocks
    const sectionNames = dataKeeper_2.deleteBlocks(blockIDs)

    // Save all sections where a block has been deleted
    fileManager.saveSectionsToFiles(sectionNames);

    // Alert all clients that blocks are deleted
    io.emit('deleteBlocks', blockIDs);
  });

  socket.on('hiddenBlockIDs', blockIDs => {
    const userId = socket.id;
    users.setUserBlockIDs(userId, blockIDs);

    // Alert all clients that blocks are hidden
    io.emit('hiddenBlockIDs', { userId, blockIDs });
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});



/* 
// Send to this client
socket.emit();

// Send to all clients except this one
socket.broadcast.emit();

// Send to all clients
io.emit();
*/




function addBlocks(blocks) {
  // Add incoming blocks
  dataKeeper.addBlocksArray(blocks);

  // Send incoming blocks to all clients
  io.emit('blocksArray', blocks);
}

function resetHiddenBlocks(userId) {
  // Send empty hidden block ID array to all clients
  const blockIDs = [];
  io.emit('hiddenBlockIDs', { userId, blockIDs });
}

// Cleanup if block data is corrupt
const cleanup = require("./cleanup.js");
const { exit } = require('process');
cleanup.deleteBadGridpoints(dataKeeper.getBlockData());
cleanup.deleteBadBlocks(dataKeeper.getBlockData());
