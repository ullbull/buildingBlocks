'use strict';
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const users = require('./users_njs.js');

const PORT = process.env.PORT || 3000;
const WS_PORT = 8082;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Run when client connects
io.on('connection', socket => {
  console.log('User connected', socket.id);
  socket.emit('message', `Welcome ${socket.id}`);

  // Send block data when a new client connects
  socket.emit('blockData', dataKeeper.getBlockData());

  // Listen for data from client
  socket.on('joinRoom', room => {
    const user = users.userJoin(socket.id, room);

    socket.join(user.room);
    console.log('user joined', user);

    // Welcome current user
    socket.emit('message', `Welcome to room ${room}`);

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        `${user.id} has joined us`
      );

    // // Send users and room info
    // io.to(user.room).emit('roomUsers', {
    //   room: user.room,
    //   users: getRoomUsers(user.room)
    // }); 
  });

  socket.on('message', message => {
    console.log(`Incoming message from ${socket.id}: ${message}`);
    socket.emit('message', `Hey, I'm your server. Thanks for your message! You sent me this: ${message}`);

  });

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

  socket.on('blocksArray', blocksArray => {
    // console.log(`Incoming blocksArray from ${socket.id}: ${blocksArray}`);
    addBlocks(blocksArray);
    resetHiddenBlocks(socket.id);
    saveFile();
  });

  socket.on('worker', worker => {
    console.log(`Incoming worker from ${socket.id}: ${worker}`);

    // Send incoming worker to all clients except this one
    socket.broadcast.emit('worker', worker);
  });

  socket.on('deleteBlocks', blockIDs => {
    // Delete blocks
    dataKeeper.deleteBlocks(blockIDs)

    saveFile();

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

const fileStream = require('fs');
const dataKeeper = require('./dataKeeper_njs.js');
let fileVersion = 1;
const dirPath = './blockData/';
const fileName = '0,0';
const fileExtension = '.json'
const filePath = dirPath + fileName + fileExtension;

const rawData = fileStream.readFileSync(filePath);
dataKeeper.setBlockData(JSON.parse(rawData));
console.log(dataKeeper.getBlockData());

// Cleanup if block data is corrupt
const cleanup = require("./cleanup.js");
cleanup.deleteBadGridpoints(dataKeeper.getBlockData());
cleanup.deleteBadBlocks(dataKeeper.getBlockData());

function saveFile() {
  let dataString = JSON.stringify(dataKeeper.getBlockData());
  // let dataString = JSON.stringify(blockData, null, 2);

  fileVersion = (++fileVersion > 2) ? 1 : fileVersion;
  const tempFilePath = dirPath + fileName + '_' + (fileVersion) + fileExtension

  // Save temporary file
  fileStream.writeFile(tempFilePath, dataString, (err) => {
    if (err) {
      console.error('Error in write file: ', err);
      return;
    }
    console.log(`write to temp file ${tempFilePath} successful!`);

    // Save was successful! Now rename the temporary file
    fileStream.copyFile(tempFilePath, filePath, (err) => {
      if (err) {
        console.error(`Error when trying to rename ${tempFilePath} to ${filePath}:\n`, err);
        return;
      }
      console.log(`Rename file ${tempFilePath} to ${filePath} successful!`);
      // console.log(`Save file ${filePath} successful!`);
    });
  });
}