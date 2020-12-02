let hiddenBlockIDs = {};

function addHiddenBlockID(blockID) {
  hiddenBlockIDs[blockID] = blockID;
}

function addHiddenBlockIDs(blockIDsArray) {
  blockIDsArray.forEach(blockID => {
    addHiddenBlockID(blockID);
  });
}

function addHiddenBlocks(blockArray) {
  blockArray.forEach(block => {
    addHiddenBlockID(block.id);
  });
}

function removeHiddenBlockID(blockID) {
  if(hiddenBlockIDs.hasOwnProperty(blockID)) {
    delete hiddenBlockIDs[blockID];
  }
}

function getHiddenBlockIDs() {
  return hiddenBlockIDs;
}

function resetHiddenBlockIDs() {
  const blockIDs = getHiddenBlockIDs();
  hiddenBlockIDs = {};
  return blockIDs;
}

function hasBlocks() {
  for (const key in hiddenBlockIDs) {
    if (hiddenBlockIDs.hasOwnProperty(key)) {
      return true;      
    } else {
      return false;
    }
  }
}

export {
  addHiddenBlockID,
  addHiddenBlockIDs,
  addHiddenBlocks,
  removeHiddenBlockID,
  getHiddenBlockIDs,
  resetHiddenBlockIDs,
  hasBlocks
}