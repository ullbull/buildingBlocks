import * as helpers from './helpers.js';

function createBlock(x = 0, y = 0, width = 0, height = 0, color = 'gray', anchorPoint = { x: 0, y: 0 }) {
  let key;
  const id = helpers.generateID();

  let block = {
    id,
    x,
    y,
    anchorPoint: anchorPoint,
    content: {},
  }

  // Fill block with pixels
  for (let h = 0; h < height; h++) {
    for (let w = 0; w < width; w++) {
      key = helpers.positionToKey(w, h);

      // Add pixel to block
      block.content[key] = createPixel(w, h, color);
    }
  }

  findClearEdges(block.content);
  return block;
}

function createBlock_new(x = 0, y = 0, width = 0, height = 0, color = 'gray', anchorPoint = { x: 0, y: 0 }) {
  const container = createContainer(x, y, anchorPoint);
  const block = createBlock(x, y, width, height, color, anchorPoint)
  addToContainer(block, container);
  return container;
}

function createContainer(x = 0, y = 0, anchorPoint = { x: 0, y: 0 }) {
  const id = helpers.generateID();

  let container = {
    id,
    x,
    y,
    anchorPoint: anchorPoint,
    content: {},
  }

  return container;
}

function addToContainer(content, container) {
  container.content[content.id] = content;
}

function getWorldPixelsFromContainer(container, worldPixels) {
  for (const key in container.content) {
    if (container.content.hasOwnProperty(key)) {
      const element = container.content[key];
      if (element.hasOwnProperty('content')) {
        // This element has content.
        // Make a copy and shift its position with containers position
        // Send that element through this function again
        // until it's just a pixel.

        const elementCopy = helpers.copyObject(element);
        elementCopy.x += container.x;
        elementCopy.y += container.y;

        getWorldPixelsFromContainer(elementCopy, worldPixels);
      }

      else {
        // This element is a pixel.
        const pixel_copy = helpers.copyObject(element);

        pixel_copy.x += container.x;
        pixel_copy.y += container.y;

        const key = helpers.positionToKey(pixel_copy.x, pixel_copy.y);
        worldPixels[key] = pixel_copy;
        
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

function getGridPointsInContainer(container) {
  const gridPoints = {};
  const worldPixels = {};
  getWorldPixelsFromContainer(container, worldPixels);
  for (const key in worldPixels) {
    if (worldPixels.hasOwnProperty(key)) {
      const pixel = worldPixels[key];
      gridPoints[key] = container.id;
      
      /* 
      const shouldLookLikeThis = {
        '1,2': '12_123431224'
      }
      */
    }
  }
  return gridPoints;
}

function createPixel(x, y, color) {
  return { x, y, color };
}


function findClearEdges(pixels) {
  let x;
  let y;
  let key2;

  for (const key in pixels) {
    if (pixels.hasOwnProperty(key)) {
      let pixel = pixels[key];
      pixel.clearEdges = [];

      // Top
      x = pixel.x;
      y = pixel.y - 1;
      key2 = helpers.positionToKey(x, y);
      if (typeof pixels[key2] == 'undefined') {
        pixel.clearEdges.push('top');
      }

      // Bottom
      x = pixel.x;
      y = pixel.y + 1;
      key2 = helpers.positionToKey(x, y);
      if (typeof pixels[key2] == 'undefined') {
        pixel.clearEdges.push('bottom');
      }

      // Left
      x = pixel.x - 1;
      y = pixel.y;
      key2 = helpers.positionToKey(x, y);
      if (typeof pixels[key2] == 'undefined') {
        pixel.clearEdges.push('left');
      }

      // Right
      x = pixel.x + 1;
      y = pixel.y;
      key2 = helpers.positionToKey(x, y);
      if (typeof pixels[key2] == 'undefined') {
        pixel.clearEdges.push('right');
      }
    }
  }
}

function setBlockPosition(block, position) {
  // Move block
  block.x = position.x;
  block.y = position.y;
}

function moveBlock(block, position) {
  // Delete grid points for this block
  for (const key in block.content) {
    if (block.content.hasOwnProperty(key)) {
      const gridKey = blockPixelToGridKey(block, key);
      delete g_viewport.blockData.gridPoints[gridKey];
    }
  }
  g_viewport.blockData.gridPoints

  // Move block
  setBlockPosition(block, position);

  // Add grid points for this block
  for (const key in block.content) {
    if (block.content.hasOwnProperty(key)) {
      const gridPosition = getGridPosition(block, key);
      g_viewport.AddGridPoint(gridPosition.x, gridPosition.y, block.id);
    }
  }
}


function setBlockAnchorPoint(block, x, y) {
  if (block.hasOwnProperty('children')) {
    for (const key in block.children) {
      if (block.children.hasOwnProperty(key)) {
        const child = block.children[key];
        child.anchorPoint = { x, y };
      }
    }
  }

  block.anchorPoint = { x, y };
}

function setBlockAnchorPointAutoShift(block, x, y) {
  const xDistance = x - block.anchorPoint.x;
  const yDistance = y - block.anchorPoint.y;

  setBlockAnchorPoint(block, x, y);

  block.x += xDistance;
  block.y += yDistance;
}

// Translate block pixel to position on grid
function getGridPosition(block, key) {
  if (block.content.hasOwnProperty(key)) {
    const pixel = block.content[key];
    return {
      x: pixel.x + block.x - block.anchorPoint.x,
      y: pixel.y + block.y - block.anchorPoint.y
    };
  }
}

function getGridPosition_new(block, key) {
  if (block.content.hasOwnProperty(key)) {
    const pixel = block.content[key];
    return {
      x: pixel.x + block.x - block.anchorPoint.x,
      y: pixel.y + block.y - block.anchorPoint.y
    };
  }
}

function getGridPointKeysFromBlock(block) {
  const gridPointKeys = [];

  for (const key in block.content) {
    if (block.content.hasOwnProperty(key)) {
      const gridPointKey = blockPixelToGridKey(block, key);
      gridPointKeys.push(gridPointKey);
    }
  }
  return gridPointKeys;
}

function getGridPoint(block, key) {
  const gridPoint = getGridPosition(block, key);
  gridPoint.id = block.id;
  return gridPoint;
}

function blockPixelToGridKey(block, key) {
  const pixel = getGridPosition(block, key);
  return helpers.positionToKey(pixel.x, pixel.y);
}

function getPositionInBlock(block, x, y) {
  return {
    //   2 -   1     +       0             = 1
    x: x - block.x + block.anchorPoint.x,
    y: y - block.y + block.anchorPoint.y
  };
}

export {
  createBlock,
  createBlock_new,
  createContainer,
  addToContainer,
  getWorldPixelsFromContainer,
  getGridPointsInContainer,
  createPixel,
  findClearEdges,
  setBlockPosition,
  moveBlock,
  setBlockAnchorPoint,
  setBlockAnchorPointAutoShift,
  getGridPosition,
  getGridPosition_new,
  getGridPointKeysFromBlock,
  getGridPoint,
  blockPixelToGridKey,
  
  getPositionInBlock
};
