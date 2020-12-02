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

export {
  socket,
  sendData,
  deleteBlocksFromServer
}