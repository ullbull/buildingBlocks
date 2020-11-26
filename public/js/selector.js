import * as helpers from './helpers.js';
import * as dataKeeper from './dataKeeper.js';

let selectedBlocks = {};
let idleBlocks = {};
let blocksToModify = selectedBlocks;

function setBlocksToModify(name) {
  switch (name) {
    case 'selected':
      blocksToModify = selectedBlocks;
      break;

    case 'idle':
      blocksToModify = idleBlocks;
      break;

    default:
      console.error(`Bad name '${name}'`);
      break;
  }

}

function getBlocks(blocksToGet = 'selected') {
  setBlocksToModify(blocksToGet);
  return blocksToModify;
}

function getBlocksArray(blocksToGet = 'selected') {
  setBlocksToModify(blocksToGet);

  const blocks = [];
  for (const key in blocksToModify) {
    if (blocksToModify.hasOwnProperty(key)) {
      const block = blocksToModify[key];
      blocks.push(block);
    }
  }
  return blocks;
}

function getBlockIDs(blocksToGet = 'selected') {
  setBlocksToModify(blocksToGet);

  const blockIDs = {};
  for (const key in blocksToModify) {
    if (blocksToModify.hasOwnProperty(key)) {
      const block = blocksToModify[key];
      blockIDs[block.id] = block.id;
    }
  }
  return blockIDs;
}

// Reset blocks and return blockIDs
function resetBlocks(blocksToReset = 'selected') {
  setBlocksToModify(blocksToReset)
  const blockIDs = getBlockIDs(blocksToReset);
  for (const key in blocksToModify) delete blocksToModify[key];
  return blockIDs;
}

function addBlock(block, to = 'selected') {
  if (typeof block != 'undefined') {
    if (block.hasOwnProperty('id')) {
      setBlocksToModify(to);
      blocksToModify[block.id] = helpers.copyObject(block);
    }
  }
}

function addBlocksArray(blocksArray, to = 'selected') {
  blocksArray.forEach(block => {
    addBlock(block, to);
  });
}

function removeBlock(block, from = 'selected') {
  setBlocksToModify(from);
  if (typeof block != 'undefined') {
    if (block.hasOwnProperty('id')) {
      delete blocksToModify[block.id];
    }
  }
}

function addBlocksByGridPoints(gridPoints, viewport, to = 'selected') {
  for (const key in gridPoints) {
    if (gridPoints.hasOwnProperty(key)) {
      addBlock(helpers.getBlockByKey(key, viewport), to);
    }
  }
}

function removeBlocksByGridPoints(gridPoints, viewport, from = 'selected') {
  for (const key in gridPoints) {
    if (gridPoints.hasOwnProperty(key)) {
      removeBlock(helpers.getBlockByKey(key, viewport), from);
    }
  }
}

function isEmpty(blocksToCheck = 'selected') {
  setBlocksToModify(blocksToCheck);
  for (const key in blocksToModify) {
    if (blocksToModify.hasOwnProperty(key)) {
      return false;      
    }
  }
  return true;
}

// function refresh() {
//   const oldBlocks = helpers.copyObject(selectedBlocks);
//   resetBlocks();
//   for (const key in oldBlocks) {
//     if (oldBlocks.hasOwnProperty(key)) {
//       const oldBlock = oldBlocks[key];
//       const updatedBlock = dataKeeper.getBlockData().blocks[oldBlock.id];
//       addBlock(updatedBlock);
//     }
//   }
// }

export {
  selectedBlocks,
  idleBlocks,
  getBlocks,
  getBlocksArray,
  getBlockIDs,
  resetBlocks,
  addBlock,
  addBlocksArray,
  removeBlock,
  addBlocksByGridPoints,
  removeBlocksByGridPoints,
  isEmpty
  // refresh
}