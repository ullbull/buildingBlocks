import * as helpers from './helpers.js';
import * as blockModule from './block.js';
import * as api from './api.js';
import { Block, createBlock } from './BlockC.js';
import { ViewPort } from './ViewPort.js';

function addBlockTo(blockData, block) {
  const blockCopy = new Block(block.GetBluePrint(), block.viewPort);

  // // If this block exist in block data
  // const blockDouble = blockData.blocks[blockCopy.id];
  // if (blockDouble) {
  //   const gridPointKeys = blockModule.getGridPointKeysFromBlock(blockDouble);
  //   // Delete blocks grid points from block data
  //   gridPointKeys.forEach(key => {
  //     delete blockData.gridPoints[key];
  //   });
  // }

  // Add the block
  blockData.blocks[blockCopy.id] = blockCopy;

  // // Add grid points
  // for (const key in block.pixels) {
  //   if (block.pixels.hasOwnProperty(key)) {

  //     // Get grid point
  //     const gridPoint = blockModule.getGridPoint(block, key);

  //     // Add grid points
  //     addGridPointTo(blockData, gridPoint);
  //   }
  // }
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

export {
  addBlockTo,
  addMultipleBlocksTo,
  addBlockAndChildrenTo,
  addGridPointTo
};
