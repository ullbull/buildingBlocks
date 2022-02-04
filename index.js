'use strict';
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const dataKeeper = require('./dataKeeper_njs.js');
const users = require('./users_njs.js');
const fileManager = require('./fileManager.js');
const ctc = require('./connectionToClients.js');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Load files to memory
fileManager.loadFile('0,0');

// Run when client connects
io.on('connection', socket => {
  console.log('User connected', socket.id);

  // Add user
  users.addUser(socket.id, []);

  socket.emit('message', `You are connected!`);

  // Listen for data from client

  socket.on('subscribe', sectionNames => {
    ctc.subscribe(sectionNames, socket);
  });

  socket.on('addSubscription', sectionNames => {
    users.addSubscriptions(socket.id, sectionNames)
  });

  socket.on('message', message => {
    console.log(`Incoming message from ${socket.id}: ${message}`);
    socket.emit('message', `Hey, I'm your server. Thanks for your message! You sent me this: ${message}`);

  });

  socket.on('requestSections', sectionNames => {

    // Send sections to client
    socket.emit('sections', fileManager.getSections(sectionNames));
  })

  socket.on('buildBlocks', blocksArray => {
    ctc.buildBlocks(blocksArray, socket, io);
  });

  socket.on('moveBlocks', blocksArray => {
    ctc.moveBlocks(blocksArray, socket, io);
  });

  socket.on('worker', worker => {
    // Send incoming worker to all clients except this one
    socket.broadcast.emit('worker', worker);
  });

  socket.on('deleteBlocks', blockIDs => {
    ctc.deleteBlocks(blockIDs, io);
  });

  socket.on('hiddenBlockIDs', blockIDs => {
    const userId = socket.id;
    users.setUserBlockIDs(userId, blockIDs);

    // Alert all clients that blocks are hidden
    io.emit('hiddenBlockIDs', { userId, blockIDs });
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    console.log('Disconnecting user', socket.id)
    const user = users.removeUser(socket.id);

    if (user) {
      console.log(`User ${user.id} disconnected`);
    } else {
      console.error(`The user ${socket.id} doesn't exist!`);
    }

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




// function addBlocks(blocks) {
//   // Add incoming blocks
//   dataKeeper.addBlocksArray(blocks);

//   // Send incoming blocks to all clients
//   io.emit('blocksArray', blocks);
// }


// Cleanup if block data is corrupt
const cleanup = require("./cleanup.js");

const sections = dataKeeper.getAllSections();
for (const sectionName in sections) {
  cleanup.deleteBadGridpixels(sectionName);
  cleanup.deleteBadBlocks(sectionName);
}
