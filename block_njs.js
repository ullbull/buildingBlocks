const helpers = require('./helpers_njs.js');

function createBlock(x = 0, y = 0, width = 2, height = 2, color = 'gray', anchorPoint = { x: 0, y: 0 }) {
  let key;
  const id = helpers.generateID();

  let block = {
    id,
    x,
    y,
    anchorPoint: anchorPoint,
    pixels: {},
  }

  // Fill block with pixels
  for (let h = 0; h < height; h++) {
    for (let w = 0; w < width; w++) {
      key = helpers.positionToKey(w, h);

      // Add pixel to the block
      block.pixels[key] = createPixel(w, h, color);
    }
  }

  findClearEdges(block.pixels);
  return block;
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

function setBlockPosition(block, x, y) {
  // Move block
  block.x = x;
  block.y = y;
}

function moveBlock(block, position) {
  // Delete grid points for this block
  for (const key in block.pixels) {
    if (block.pixels.hasOwnProperty(key)) {
      const gridKey = blockPixelToGridKey(block, key);
      delete g_viewport.blockData.gridPoints[gridKey];
    }
  }
  g_viewport.blockData.gridPoints

  // Move block
  setBlockPosition(block, position);

  // Add grid points for this block
  for (const key in block.pixels) {
    if (block.pixels.hasOwnProperty(key)) {
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
  if (block.pixels.hasOwnProperty(key)) {
    const pixel = block.pixels[key];
    return {
      x: pixel.x + block.x - block.anchorPoint.x,
      y: pixel.y + block.y - block.anchorPoint.y
    };
  }
}

function getGridPointKeysFromBlock(block) {
  const gridPointKeys = [];

  for (const key in block.pixels) {
    if (block.pixels.hasOwnProperty(key)) {
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

module.exports = {
  createBlock,
  createPixel,
  findClearEdges,
  setBlockPosition,
  moveBlock,
  setBlockAnchorPoint,
  setBlockAnchorPointAutoShift,
  getGridPosition,
  getGridPointKeysFromBlock,
  getGridPoint,
  blockPixelToGridKey,
  getPositionInBlock
};
