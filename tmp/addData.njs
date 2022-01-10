const helpers = require('./helpers.njs');
const blockModule = require('./block.njs');

function addBlockTo(blockData, block) {
  const blockCopy = helpers.copyObject(block);

  // If this block exist in block data
  const blockDouble = blockData.blocks[blockCopy.id];
  if (blockDouble) {
    const gridPointKeys = blockModule.getGridPixelKeys(blockDouble);
    // Delete blocks grid pixels from block data
    gridPointKeys.forEach(key => {
      console.log('delete gridpint', key);
      delete blockData.gridpixels[key];
    });
  }

  // Add the block
  blockData.blocks[blockCopy.id] = blockCopy;

  // Add grid pixels
  for (const key in block.pixels) {
    if (block.pixels.hasOwnProperty(key)) {

      // Get grid pixel
      const gridPoint = blockModule.getGridPixel(block, key);

      // Add grid pixels
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

  // If this grid pixel belongs to a block, delete pixel from that block
  if (typeof blockData.gridpixels[key] != 'undefined') {
    const id = blockData.gridpixels[key];
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

  // Add grid pixel
  blockData.gridpixels[key] = blockID;
}

function deleteBlockFrom(blockData, blockID) {
  const block = blockData.blocks[blockID];
  if (typeof block != 'undefined') {
    // Delete grid pixels
    for (const key in block.pixels) {
      if (block.pixels.hasOwnProperty(key)) {
        const position = blockModule.getGridPixel(block, key);
        deleteGridPixelFrom(blockData, position.x, position.y);
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
        deleteBlockFrom(blockData, child.id);
      }
    }
  }
  // delete block
  deleteBlockFrom(blockData, block.id);
}

function deleteGridPixelFrom(blockData, x, y) {
  const key = helpers.positionToKey(x, y);
  delete blockData.gridpixels[key];
}

module.exports = {
  addBlockTo,
  addMultipleBlocksTo,
  addBlockAndChildrenTo,
  addGridPointTo,
  deleteBlockFrom,
  deleteBlockAndChildrenFrom,
  deleteGridPixelFrom
};
