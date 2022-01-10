const helpers = require('./helpers_njs.js');
const blockModule = require('./block_njs.js');

let blockData = { blocks: {}, gridpixels: {} };
const worker = blockModule.createBlock(0, 0, 4, 2, 'gray');
let workers = {};

function addWorker(worker) {
  workers[worker.id] = worker;
}

function setWorkers(wkrs) {
  workers = wkrs;
}

function getBlockData() {
  return blockData;
}

function setBlockData(data) {
  blockData = data;
}

function add(data, to) {
  try {
    to[data.id] = data;
  } catch (err) {
    console.error(err);
  }
}

function addData(data, to) {
  if(to == 'workers') {
    add(data, workers);
  } else {
    console.error(`The variable ${data} doesn't exist!`);
  }
}

function addBlock(block) {
  const blockCopy = helpers.copyObject(block);

  // If this block exist in block data
  const blockDouble = blockData.blocks[blockCopy.id];
  if (blockDouble) {
    // Delete blocks grid pixels from block data
    const gridPointKeys = blockModule.getGridPixelKeys(blockDouble);
    gridPointKeys.forEach(key => {
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

function deleteBlock(blockID) {
  const block = blockData.blocks[blockID];
  if (typeof block != 'undefined') {
    // Delete grid pixels
    for (const key in block.pixels) {
      if (block.pixels.hasOwnProperty(key)) {
        const position = blockModule.getGridPixel(block, key);
        deleteGridPixel(position.x, position.y);
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

function deleteGridPixel(x, y) {
  const key = helpers.positionToKey(x, y);
  delete blockData.gridpixels[key];
}

module.exports = {
  worker,
  workers,
  addWorker,
  setWorkers,
  addData,
  getBlockData,
  setBlockData,
  addBlock,
  addBlocks,
  addBlocksArray,
  addBlockAndChildren,
  addGridPoint,
  deleteBlock,
  deleteBlocks,
  deleteGridPixel,
};
