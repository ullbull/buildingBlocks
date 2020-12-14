import * as dataKeeper from './dataKeeper.js';
import * as dataKeeper_2 from './dataKeeper_2.js';
import * as layers from './layers.js';
import * as workerManager from './workerManager.js';
import * as toolManager from './toolManager.js';
import * as users from './users.js';

let socket = null;

function connect() {
  if(!socket) {
    socket = io();
  } else {
    console.log("Hey, what are you doing? You're already connected!")
  }
}

function handleIncomingData() {
  // Making sure we have a connection to the server
  if (!socket) {
    console.error('not connected!, trying to connect for you...');
    connect();
    if (socket) {
      console.log("Now you're connected :)");
    }
  }

  // Listening for incoming data from server

  socket.on('message', message => {
    console.log(message);
  })

  socket.on('sections', sections => {
    // Overwrites sections
    dataKeeper_2.setSections(sections);
    layers.background.refresh();
  })

  socket.on('blocks', blocksArray => {
    dataKeeper_2.addBlocks(blocksArray)
    toolManager.builder.refreshHoveredBlocks();
    layers.background.refresh();
    console.log('Got blocks:', blocksArray);
  })

  socket.on('worker', worker => {
    workerManager.addWorker(worker);
    layers.foreground.refresh();
  })

  socket.on('deleteBlocks', blockIDs => {
    dataKeeper_2.deleteBlocks(blockIDs);
    layers.background.refresh();
  })

  socket.on('hiddenBlockIDs', ({ userId, blockIDs }) => {
    users.setUserBlockIDs(userId, blockIDs);
    layers.background.refresh();
  })
}


function sendData(type, payload) {
  socket.emit(type, payload);
}

function deleteBlocks(blockIDs) {
  sendData('deleteBlocks', blockIDs);
}

function deleteBlocksA(blockArray) {
  const blockIDs = [];
  blockArray.forEach(block => {
    blockIDs.push(block.id);
  });
  sendData('deleteBlocks', blockIDs);
}

export {
  connect,
  handleIncomingData,
  sendData,
  deleteBlocks,
  deleteBlocksA
}