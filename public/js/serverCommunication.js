import * as dataKeeper from './dataKeeper.js';
import * as layers from './layers.js';

const socket = io();

socket.on('message', message => {
  console.log(message);
})

socket.on('blockData', blockData => {
  console.log('Got blockData!');
  console.log(blockData);

  dataKeeper.setBlockData(blockData);
  layers.background.refresh();
})

socket.on('blocksArray', blocksArray => {
  dataKeeper.addBlocksArray(blocksArray)
  layers.background.refresh();
})

socket.on('worker', worker => {
  dataKeeper.addWorker(worker);
  layers.foreground.refresh();
})

socket.on('deleteBlocks', blockIDs => {
  dataKeeper.deleteBlocks(blockIDs);
  layers.background.refresh();
})

function sendData(type, payload) {
  socket.emit(type, payload);
}

function deleteBlocksFromServer(blockIDs) {
  sendData('deleteBlocks', blockIDs);
}

function deleteBlockGlobally(blockID) {
  dataKeeper.deleteBlock(blockID);
  deleteBlocksFromServer({ blockID });
}

function deleteBlocksGlobally(blockIDs) {
  dataKeeper.deleteBlocks(blockIDs);
  deleteBlocksFromServer(blockIDs);
}

function deleteBlocksGloballyArray(blockArray) {
  const blockIDs = {};
  blockArray.forEach(block => {
    blockIDs[block.id] = block.id;
  });
  deleteBlocksGlobally(blockIDs);
}

export {
  socket,
  sendData,
  deleteBlocksFromServer,
  deleteBlockGlobally,
  deleteBlocksGlobally,
  deleteBlocksGloballyArray
}