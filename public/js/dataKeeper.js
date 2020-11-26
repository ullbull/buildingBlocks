import * as helpers from './helpers.js';
import * as blockModule from './block.js';
import * as api from './api.js';

let blockData = { blocks: {}, gridPoints: {} };
const worker = blockModule.createBlock(0, 0, 4, 2, 'gray');
let workers = {};

async function initBlockData() {
  const blockData = await api.getData('/api');
  setBlockData(blockData);
}

async function initWorkers() {
  workers = await api.getData('/workers');
}

function getBlockData() {
  return blockData;
}

function setBlockData(data) {
  blockData = data;
}

function addBlock(block) {
  const blockCopy = helpers.copyObject(block);

  // If this block exist in block data
  const blockDouble = blockData.blocks[blockCopy.id];
  if (blockDouble) {
    // Delete blocks grid points from block data
    const gridPointKeys = blockModule.getGridPointKeysFromBlock(blockDouble);
    gridPointKeys.forEach(key => {
      delete blockData.gridPoints[key];
    });
  }

  // Add the block
  blockData.blocks[blockCopy.id] = blockCopy;
  // 
  // Add grid points
  for (const key in block.pixels) {
    if (block.pixels.hasOwnProperty(key)) {

      // Get grid point
      const gridPoint = blockModule.getGridPoint(block, key);

      // Add grid points
      addGridPoint(gridPoint);
    }
  }
}

function addBlocks(blocks) {
  for (const key in blocks) {
    if (blocks.hasOwnProperty(key)) {
      const block = blocks[key];
      addBlock(block);
    }
  }
}

function addBlocksArray(blocks) {
  blocks.forEach(block => {
    addBlock(block);
  });
}

function addBlockAndChildren(block) {
  addBlock(block);
  if (block.hasOwnProperty('children')) {
    addBlocks(block.children);
  }
}

function addGridPoint(gridPoint) {
  const x = gridPoint.x;
  const y = gridPoint.y;
  const blockID = gridPoint.id;
  const key = helpers.positionToKey(x, y);

  // If this grid point belongs to a block, delete pixel from that block
  if (typeof blockData.gridPoints[key] != 'undefined') {
    const id = blockData.gridPoints[key];
    const block = blockData.blocks[id];
    const position = blockModule.getPositionInBlock(block, x, y);
    const pixelKey = helpers.positionToKey(position.x, position.y);

    // delete pixel from the block
    delete block.pixels[pixelKey];

    // Check if block is empty
    let blockEmpty = true;
    for (const key in block.pixels) {
      if (block.pixels.hasOwnProperty(key)) {
        blockEmpty = false;
        break;
      }
    }

    // Delete block if it is empty of pixels
    if (blockEmpty) {
      delete blockData.blocks[id];
    } else {
      // find clear edges in that block
      blockModule.findClearEdges(block.pixels);
    }

  }

  // Add grid point
  blockData.gridPoints[key] = blockID;
}

function deleteBlock(blockID) {
  const block = blockData.blocks[blockID];
  if (typeof block != 'undefined') {
    // Delete grid points
    for (const key in block.pixels) {
      if (block.pixels.hasOwnProperty(key)) {
        const position = blockModule.getGridPosition(block, key);
        deleteGridPoint(position.x, position.y);
      }
    }

    // Delete block
    delete blockData.blocks[blockID];
  }
}

function deleteBlocks(blockIDs) {
  for (const key in blockIDs) {
    if (blockIDs.hasOwnProperty(key)) {
      const blockID = blockIDs[key];
      deleteBlock(blockID);
    }
  }
}

function deleteBlockGlobally(blockID) {
  deleteBlock(blockID);
  api.deleteBlocksFromServer({ blockID });
}

function deleteBlocksGlobally(blockIDs) {
  deleteBlocks(blockIDs);
  api.deleteBlocksFromServer(blockIDs);
}

function deleteBlocksGloballyArray(blockArray) {
  const blockIDs = {};
  blockArray.forEach(block => {
    blockIDs[block.id] = block.id;
  });
  deleteBlocksGlobally(blockIDs);
}

function deleteGridPoint(x, y) {
  const key = helpers.positionToKey(x, y);
  delete blockData.gridPoints[key];
}

export {
  worker,
  workers,
  getBlockData,
  initBlockData,
  initWorkers,
  setBlockData,
  addBlock,
  addBlocks,
  addBlocksArray,
  addBlockAndChildren,
  addGridPoint,
  deleteBlock,
  deleteBlocks,
  deleteBlockGlobally,
  deleteBlocksGlobally,
  deleteBlocksGloballyArray,
  deleteGridPoint
};
