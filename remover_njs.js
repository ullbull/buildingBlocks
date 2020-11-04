const helpers = require('./helpers_njs.js');
const blockModule = require('./block_njs.js');
const api = require('./api_njs.js');


function deleteBlockLocally(blockData, blockID) {
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

function deleteBlocksLocally(blockData, blockIDs) {
  for (const key in blockIDs) {
    if (blockIDs.hasOwnProperty(key)) {
      const blockID = blockIDs[key];
      deleteBlockLocally(blockData, blockID);
    }
  }
}

function deleteBlockGlobally(blockData, blockID) {
  deleteBlockLocally(blockData, blockID);
  api.deleteBlocksFromServer({ blockID });
}

function deleteBlocksGlobally(blockData, blockIDs) {
  deleteBlocksLocally(blockData, blockIDs);
  api.deleteBlocksFromServer(blockIDs);
}

function deleteBlockAndChildren(blockData, block) {
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
  deleteBlockLocally(blockData, block.id);

  // Delete from server
  api.deleteBlockFromServer(block.id);
}

function deleteGridPointFrom(blockData, x, y) {
  const key = helpers.positionToKey(x, y);
  delete blockData.gridPoints[key];
}

module.exports = {
  deleteBlockLocally,
  deleteBlocksLocally,
  deleteBlockGlobally,
  deleteBlocksGlobally,
  deleteBlockAndChildren,
  deleteGridPointFrom
}
