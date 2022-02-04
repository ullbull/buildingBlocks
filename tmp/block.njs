const helpers = require('./helpers.njs');

function createBlock(x = 0, y = 0, width = 0, height = 0, color = 'gray', anchorPoint = { x: 0, y: 0 }) {
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

function setBlockPosition(block, position) {
  if (block.hasOwnProperty('children')) {
    // Find distance to new position
    const xDistance = position.x - block.x;
    const yDistance = position.y - block.y;

    // Move children according to distance
    for (const key in block.children) {
      if (block.children.hasOwnProperty(key)) {
        const child = block.children[key];
        child.x += xDistance;
        child.y += yDistance;
      }
    }
  }

  // Move block
  block.x = position.x;
  block.y = position.y;
}

function moveBlock(block, position) {
  // Delete grid pixels for this block
  for (const key in block.pixels) {
    if (block.pixels.hasOwnProperty(key)) {
      const gridKey = blockPixelToGridKey(block, key);
      delete g_viewport.blockData.gridpixels[gridKey];
    }
  }
  g_viewport.blockData.gridpixels

  // Move block
  setBlockPosition(block, position);

  // Add grid pixels for this block
  for (const key in block.pixels) {
    if (block.pixels.hasOwnProperty(key)) {
      const gridPosition = getGridPixel(block, key);
      g_viewport.AddGridpixel(gridPosition.x, gridPosition.y, block.id);
    }
  }
}


function setBlockAnchorPoint(block, anchorPoint) {
  if (block.hasOwnProperty('children')) {
    for (const key in block.children) {
      if (block.children.hasOwnProperty(key)) {
        const child = block.children[key];
        child.anchorPoint = anchorPoint;
      }
    }
  }

  block.anchorPoint = anchorPoint;
}

// Translate block pixel to position on grid
function getGridPixel(block, key) {
  if (block.pixels.hasOwnProperty(key)) {
    const pixel = block.pixels[key];
    return {
      x: pixel.x + block.x - block.anchorPoint.x,
      y: pixel.y + block.y - block.anchorPoint.y
    };
  } else {
    console.error('Property not found! ', key);
  }
}

function getGridPixelKeys(block) {
  const gridPointKeys = [];

  for (const key in block.pixels) {
    if (block.pixels.hasOwnProperty(key)) {
      const gridPointKey = blockPixelToGridKey(block, key);
      gridPointKeys.push(gridPointKey);
    }
  }
  return gridPointKeys;
}

function getGridPixel(block, key) {
  const gridPoint = getGridPixel(block, key);
  gridPoint.id = block.id;
  return gridPoint;
}

function blockPixelToGridKey(block, key) {
  const pixel = getGridPixel(block, key);
  return helpers.positionToKey(pixel.x, pixel.y);
}


function getPositionInBlock(block, x, y) {
  return {
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
  getGridPixel,
  getGridPixelKeys,
  getGridPixel,
  blockPixelToGridKey,
  getPositionInBlock
};
