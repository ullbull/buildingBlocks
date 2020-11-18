import * as helpers from './helpers.js';
import * as blockModule from './block.js';
import * as api from './api.js';

let blockData = { blocks: {}, gridPoints: {} };

async function initBlockData() {
  const blockData = await api.getData('/api');
  setBlockData(blockData);
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
    const wpxls = {};     // blockDouble's world pixels
    blockModule.getWorldPixelsFromContainer(blockDouble, wpxls);

    // Delete blocks grid points from block data
    for (const key in wpxls) {
      if (wpxls.hasOwnProperty(key)) {
        delete blockData.gridPoints[key];
      }
    }
  }

  // Add the block
  blockData.blocks[blockCopy.id] = blockCopy;

  // Add grid points
  const worldPixels = {};
  blockModule.getWorldPixelsFromContainer(blockCopy, worldPixels);
  for (const key in worldPixels) {
    if (worldPixels.hasOwnProperty(key)) {
      const worldPixel = worldPixels[key];
      addGridPoint_3(worldPixel, blockCopy.id);
    }
  }
}

function addMultipleBlocks(blocks) {
  for (const key in blocks) {
    if (blocks.hasOwnProperty(key)) {
      const block = blocks[key];
      addBlock(block);
    }
  }
}

function addBlockAndChildren(block) {
  addBlock(block);
  if (block.hasOwnProperty('children')) {
    addMultipleBlocks(block.children);
  }
}

function deletePixelFromContainer(container, worldPixel, bufx = 0, bufy = 0) {
  for (const key in container.content) {
    if (container.content.hasOwnProperty(key)) {
      const element = container.content[key];
      if (element.hasOwnProperty('content')) {
        // This element has content.
        // Make a copy and shift its position with containers position
        // Send that element through this function again
        // until it's just a pixel.

        // const elementCopy = helpers.copyObject(element);
        // elementCopy.x += container.x;
        // elementCopy.y += container.y;

        bufx += container.x;
        bufy += container.y;

        deletePixelFromContainer(element, worldPixel, bufx, bufy);
      }

      else {
        // This element is a pixel.
        const pixel_copy = helpers.copyObject(element);

        pixel_copy.x += bufx;
        pixel_copy.y += bufy;

        // const key = helpers.positionToKey(pixel_copy.x, pixel_copy.y);
        // worldPixels[key] = pixel_copy;

        if (pixel_copy.x == worldPixel.x) {
          console.log('deleting ', key);
          console.log('aka ', container.content[key]);
          // delete pixel from the container
          delete container.content[key];
        }

        /* 
        const shouldLookLikeThis = {
          '1,2': {
            x: 1,
            y: 2
          }
        }
        */
      }
    }
  }
}

function addGridPoint_3(pixel, belongsToId) {
  const key = helpers.positionToKey(pixel.x, pixel.y);

  // If this grid point belongs to a container, delete pixel from that container
  if (typeof blockData.gridPoints[key] != 'undefined') {
    // This pixel exists in blockData
    console.log('pixel exists!', pixel);

    const id = blockData.gridPoints[key];     // The existing pixel belongs to this id
    const container = blockData.blocks[id];   // The existing pixel belongs to this container

    // const position = blockModule.getPositionInBlock(container, x, y);
    // const pixelKey = helpers.positionToKey(position.x, position.y);

    // delete pixel from the container
    deletePixelFromContainer(container, pixel);

    // Check if container is empty
    const worldPixels = {};
    blockModule.getWorldPixelsFromContainer(container, worldPixels);
    let blockEmpty = true;
    for (const key in worldPixels) {
      if (worldPixels.hasOwnProperty(key)) {
        blockEmpty = false;
        break;
      }
    }

    // Delete block if it has no content
    if (blockEmpty) {
      delete blockData.blocks[id];
    } else {
      // find clear edges in that block
      console.log('find clear edges in', container.content);
      blockModule.findClearEdges(container.content);
      console.log('clear edges in should be updated now', container.content);
    }

  }

  /////////////////WORKING ON THIS FUNCTION EVERYTHING ABOVE THIS LINE CAN GO AWAY



  // Add grid point
  blockData.gridPoints[key] = belongsToId;
}

function addGridPoint_2(gridPoint) {
  const key = helpers.positionToKey(gridPoint.x, gridPoint.y);
  // Add grid point
  blockData.gridPoints[key] = gridPoint.id;
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
    delete block.content[pixelKey];

    // Check if block is empty
    let blockEmpty = true;
    for (const key in block.content) {
      if (block.content.hasOwnProperty(key)) {
        blockEmpty = false;
        break;
      }
    }

    // Delete block if it has no content
    if (blockEmpty) {
      delete blockData.blocks[id];
    } else {
      // find clear edges in that block
      blockModule.findClearEdges(block.content);
    }

  }

  // Add grid point
  blockData.gridPoints[key] = blockID;
  console.log('gp', gridPoint);
  console.log('blockData.gridPoints[key]', blockData.gridPoints[key]);
}

function deleteBlock(blockID) {
  const block = blockData.blocks[blockID];
  if (typeof block != 'undefined') {
    // Delete grid points
    const worldPixels = {};
    blockModule.getWorldPixelsFromContainer(block, worldPixels);
    for (const key in worldPixels) {
      if (worldPixels.hasOwnProperty(key)) {
        delete blockData.gridPoints[key];
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

function deleteGridPoint(x, y) {
  const key = helpers.positionToKey(x, y);
  delete blockData.gridPoints[key];
}

export {
  getBlockData,
  initBlockData,
  setBlockData,
  addBlock,
  addMultipleBlocks,
  addBlockAndChildren,
  addGridPoint,
  addGridPoint_2,
  deleteBlock,
  deleteBlocks,
  deleteBlockGlobally,
  deleteBlocksGlobally,
  deleteGridPoint
};
