import * as serverLink from './serverLink.js';

function hideBlocks(blockArray) {
  const hiddenBlockIDs = [];
  blockArray.forEach(block => {
    hiddenBlockIDs.push(block.id);
  });
  serverLink.sendData('hiddenBlockIDs', hiddenBlockIDs);
}

export {
  hideBlocks
}