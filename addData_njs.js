const helpers = require('./helpers_njs.js');
const blockModule = require('./block_njs.js');
const api = require('./api_njs.js');

function addBlockTo(blockData, block) {
  const blockCopy = helpers.copyObject(block);

  // If this block exist in block data
  const blockDouble = blockData.blocks[blockCopy.id];
  if (blockDouble) {
    const gridPointKeys = blockModule.getGridPointKeysFromBlock(blockDouble);
    // Delete blocks grid points from block data
    gridPointKeys.forEach(key => {
      delete blockData.gridPoints[key];
    });
  }

  // Add the block
  blockData.blocks[blockCopy.id] = blockCopy;

  // Add grid points
  for (const key in block.pixels) {
    if (block.pixels.hasOwnProperty(key)) {

      // Get grid point
      const gridPoint = blockModule.getGridPoint(block, key);

      // Add grid points
      addGridPointTo(blockData, gridPoint);
    }
  }
}

function addMultipleBlocksTo(blockData, blocks) {
  for (const key in blocks) {
    if (blocks.hasOwnProperty(key)) {
      const block = blocks[key];
      addBlockTo(blockData, block);
    }
  }
}

function addBlockAndChildrenTo(blockData, block) {
  addBlockTo(blockData, block);
  if (block.hasOwnProperty('children')) {
    addMultipleBlocksTo(blockData, block.children);
  }
}

function addGridPointTo(blockData, gridPoint) {
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

function deleteBlockFrom(blockData, blockID) {
  const block = blockData.blocks[blockID];
  if (typeof block != 'undefined') {
    // Delete grid points
    for (const key in block.pixels) {
      if (block.pixels.hasOwnProperty(key)) {
        const position = blockModule.getGridPosition(block, key);
        deleteGridPointFrom(blockData, position.x, position.y);
      }
    }

    // Delete block
    delete blockData.blocks[blockID];
  }
}

function deleteBlockAndChildrenFrom(blockData, block) {
  // Delete children
  if (block.hasOwnProperty('children')) {
    console.log(block.children);
    for (const key in block.children) {
      if (block.children.hasOwnProperty(key)) {
        const child = block.children[key];
        console.log(child);
        // Delete locally
        deleteBlockFrom(blockData, child.id);

        // Delete from server
        api.deleteBlockFromServer(child.id);
      }
    }
  }
  // Delete locally
  deleteBlockFrom(blockData, block.id);

  // Delete from server
  api.deleteBlockFromServer(block.id);
}

function deleteGridPointFrom(blockData, x, y) {
  const key = helpers.positionToKey(x, y);
  delete blockData.gridPoints[key];
}

module.exports = {
  addBlockTo,
  addMultipleBlocksTo,
  addBlockAndChildrenTo,
  addGridPointTo,
  deleteBlockFrom,
  deleteBlockAndChildrenFrom,
  deleteGridPointFrom
};
