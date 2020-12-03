import * as dataKeeper from './dataKeeper.js';
import * as layers from './layers.js';
import * as workerManager from './workerManager.js';
import * as toolManager from './toolManager.js';
import * as users from './users.js';
import * as blockHider from './blockHider.js';

const socket = io();

socket.on('message', message => {
  console.log(message);
})

socket.on('blockData', blockData => {
  dataKeeper.setBlockData(blockData);
  layers.background.refresh();
})

socket.on('blocksArray', blocksArray => {
  dataKeeper.addBlocksArray(blocksArray)
  toolManager.builder.refreshHoveredBlocks();
  layers.background.refresh();
})

socket.on('worker', worker => {
  workerManager.addWorker(worker);
  layers.foreground.refresh();
})

socket.on('deleteBlocks', blockIDs => {
  dataKeeper.deleteBlocks(blockIDs);
  layers.background.refresh();
})

socket.on('hiddenBlockIDs', ({ userId, blockIDs }) => {
  users.setUserBlockIDs(userId, blockIDs);
  layers.background.refresh();
})


function sendData(type, payload) {
  socket.emit(type, payload);
}

function deleteBlocks(blockIDs) {
  sendData('deleteBlocks', blockIDs);
}
function deleteBlocksA(blockArray) {
  const blockIDs = {};
  blockArray.forEach(block => {
    blockIDs[block.id] = block.id;
  });
  sendData('deleteBlocks', blockIDs);
}
export {
  socket,
  sendData,
  deleteBlocks,
  deleteBlocksA
}