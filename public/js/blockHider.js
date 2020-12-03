import * as serverLink from './serverLink.js';
import * as users from './users.js';

function hideBlocks_ID(blockIDs) {
  serverLink.sendData('hiddenBlockIDs', blockIDs);
}

function hideBlocks(blocksArray) {
  const blockIDs = [];
  blocksArray.forEach(block => {
    blockIDs.push(block.id);
  });
  hideBlocks_ID(blockIDs);
}

function getHiddenBlockIDs() {
  const hiddenBlockIDs = [];
  const allUsers = users.getAllUsers();

  allUsers.forEach(user => {
    if (user.hasOwnProperty('blockIDs')) {
      user.blockIDs.forEach(blockID => {
        hiddenBlockIDs.push(blockID);
      });
    }
  });
  return hiddenBlockIDs;
}

function resetHiddenBlocks() {
  const hiddenBlockIDs = getHiddenBlockIDs();
  serverLink.sendData('hiddenBlockIDs', []);
  return hiddenBlockIDs;
}

export {
  hideBlocks_ID,
  hideBlocks,
  getHiddenBlockIDs,
  resetHiddenBlocks
}