'use strict';
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const dataKeeper_2 = require('./dataKeeper_2_njs.js');
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

  socket.on('blocksArray', blocksArray => {
    ctc.receiveBlocks(blocksArray, socket, io);
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

    // Alert clients that blocks are deleted
    ctc.sendToAllInSections('deleteBlocks', blockIDs, io, sectionNames);
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
// const { exit } = require('process');

// SEE IF I NEED THESE FUNCTIONS. CHANGE TO DATA KEEPER 2
// cleanup.deleteBadGridpoints(dataKeeper.getBlockData());
// cleanup.deleteBadBlocks(dataKeeper.getBlockData());
