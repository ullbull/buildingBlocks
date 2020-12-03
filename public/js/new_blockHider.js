import * as serverLink from './serverLink.js';
import * as users from './users.js';

function hideBlocks_ID(blockIDs) {
  serverLink.sendData('hiddenBlockIDs', blockIDs);
}

function hideBlocks(blocksArray) {
  const blockIDs = [];
  blocksArray.forEach(block => {
    blockIDs.push(block);
  });
  hideBlocks_ID(blockIDs);
}

function getHiddenBlockIDs() {
  const userIDs = [];
  const allUsers = users.getAllUsers();

  allUsers.forEach(user => {
    userIDs.push(user.id);
  });

  return userIDs;
}

export {
  hideBlocks_ID,
  hideBlocks,
  getHiddenBlockIDs
}