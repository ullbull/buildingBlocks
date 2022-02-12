import * as helpers from './helpers.js';
import * as dataKeeper from './dataKeeper.js';

let selectedBlocks = {};
let lastSelectedBlocks = {};
const keySelected = "selected";
const keyLastSelected = "last_selected";
let blocksToModify = selectedBlocks;

function setBlocksToModify(name) {
  switch (name) {
    case keySelected:
      blocksToModify = selectedBlocks;
      break;

    case keyLastSelected:
      blocksToModify = lastSelectedBlocks;
      break;

    default:
      console.error(`Bad name '${name}'`);
      break;
  }

}

function getBlocks(blocksToGet = keySelected) {
  setBlocksToModify(blocksToGet);
  return blocksToModify;
}

function getBlocksArray(blocksToGet = keySelected) {
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

// function getBlockIDsOBJ(blocksToGet = keySelected) {
//   setBlocksToModify(blocksToGet);

//   const blockIDs = {};
//   for (const key in blocksToModify) {
//     if (blocksToModify.hasOwnProperty(key)) {
//       const block = blocksToModify[key];
//       blockIDs[block.id] = block.id;
//     }
//   }
//   return blockIDs;
// }

function getBlockIDs(blocksToGet = keySelected) {
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
function resetBlocks(blocksToReset = keySelected) {
  setBlocksToModify(blocksToReset)
  const blockIDs = getBlockIDs(blocksToReset);
  for (const key in blocksToModify) delete blocksToModify[key];
  return blockIDs;
}

function addBlock(block, to = keySelected) {
  if (block) {
    if (block.hasOwnProperty('id')) {
      setBlocksToModify(to);
      blocksToModify[block.id] = helpers.copyObject(block);
    }
  }
}

function addBlocks(blocks, to = keySelected) {
  for (const key in blocks) {
    if (blocks.hasOwnProperty(key)) {
      const block = blocks[key];
      addBlock(block, to);
    }
  }
}

function addBlocksArray(blocksArray, to = keySelected) {
  blocksArray.forEach(block => {
    addBlock(block, to);
  });
}

function removeBlock(block, from = keySelected) {
  setBlocksToModify(from);
  if (typeof block != 'undefined') {
    if (block.hasOwnProperty('id')) {
      delete blocksToModify[block.id];
    }
  }
}

function removeBlocks(blocks, from = keySelected) {
  for (const key in blocks) {
    if (blocks.hasOwnProperty(key)) {
      const block = blocks[key];
      removeBlock(block, from);
    }
  }
}

function addBlocksByGridpixels(gridpixels, viewport, to = keySelected) {
  const blocks = {};
  for (const key in gridpixels) {
    if (gridpixels.hasOwnProperty(key)) {
      const block = dataKeeper.getBlockAtPosition({"key": key});
      if (block) {
        blocks[block.id] = block;
      }
    }
  }
  addBlocks(blocks, to);
}

function removeBlocksByGridpixels(gridpixels, viewport, from = keySelected) {
  const blocks = {};
  for (const key in gridpixels) {
    if (gridpixels.hasOwnProperty(key)) {
      const block = dataKeeper.getBlockAtPosition({"key": key});
      if (block) {
        blocks[block.id] = block;
      }
    }
  }
  removeBlocks(blocks, from);
}


function isEmpty(blocksToCheck = keySelected) {
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
  lastSelectedBlocks,
  keySelected,
  keyLastSelected,
  getBlocks,
  getBlocksArray,
  getBlockIDs,
  resetBlocks,
  addBlock,
  addBlocks,
  addBlocksArray,
  removeBlock,
  removeBlocks,
  addBlocksByGridpixels,
  removeBlocksByGridpixels,
  isEmpty
}