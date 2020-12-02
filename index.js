'use strict';
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

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
  socket.on('message', data => { receiveMessage(socket, data) });
  socket.on('blocksArray', data => { receiveBlocksArray(socket, data) });
  socket.on('worker', data => { receiveWorker(socket, data) });
  socket.on('deleteBlocks', data => { deleteBlocks(socket, data) });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});


function receiveMessage(socket, message) {
  console.log(`Incoming message from ${socket.id}: ${message}`);
  socket.emit('message', `Hey, I'm your server. Thanks for your message! You sent me this: ${message}`);
}

function receiveBlocksArray(socket, blocksArray) {
  console.log(`Incoming blocksArray from ${socket.id}: ${blocksArray}`);

  // Add incoming blocks
  dataKeeper.addBlocksArray(blocksArray);

  // Send incoming blocks to all clients
  io.emit('blocksArray', blocksArray);

  saveFile();
}

function receiveWorker(socket, worker) {
  console.log(`Incoming worker from ${socket.id}: ${worker}`);

  // Send incoming worker to all clients except this one
  socket.broadcast.emit('worker', worker);
}

function deleteBlocks(socket, blockIDs) {
  dataKeeper.deleteBlocks(blockIDs)

  saveFile();

  // Alert clients that blocks are deleted
  socket.broadcast.emit('deleteBlocks', blockIDs);
}

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
