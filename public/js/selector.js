import * as helpers from './helpers.js';
import * as dataKeeper_2 from './dataKeeper_2.js';

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

function getBlockIDsOBJ(blocksToGet = 'selected') {
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

function getBlockIDs(blocksToGet = 'selected') {
  setBlocksToModify(blocksToGet);

  const blockIDs = [];
  for (const key in blocksToModify) {
    if (blocksToModify.hasOwnProperty(key)) {
      const block = blocksToModify[key];
      blockIDs.push(block.id);
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
  if (block) {
    if (block.hasOwnProperty('id')) {
      setBlocksToModify(to);
      blocksToModify[block.id] = helpers.copyObject(block);
    }
  }
}

function addBlocks(blocks, to = 'selected') {
  for (const key in blocks) {
    if (blocks.hasOwnProperty(key)) {
      const block = blocks[key];
      addBlock(block, to);
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

function removeBlocks(blocks, from = 'selected') {
  for (const key in blocks) {
    if (blocks.hasOwnProperty(key)) {
      const block = blocks[key];
      removeBlock(block, from);
    }
  }
}

function addBlocksBygridpixels(gridpixels, viewport, to = 'selected') {
  const blocks = {};
  for (const key in gridpixels) {
    if (gridpixels.hasOwnProperty(key)) {
      const block = dataKeeper_2.getBlockAtPosition_k(key);
      if (block) {
        blocks[block.id] = block;
      }
    }
  }
  addBlocks(blocks, to);
}

function removeBlocksBygridpixels(gridpixels, viewport, from = 'selected') {
  const blocks = {};
  for (const key in gridpixels) {
    if (gridpixels.hasOwnProperty(key)) {
      const block = dataKeeper_2.getBlockAtPosition_k(key);
      if (block) {
        blocks[block.id] = block;
      }
    }
  }
  removeBlocks(blocks, from);
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
  addBlocks,
  addBlocksArray,
  removeBlock,
  removeBlocks,
  addBlocksBygridpixels,
  removeBlocksBygridpixels,
  isEmpty
  // refresh
}