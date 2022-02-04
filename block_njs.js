const helpers = require('./helpers_njs.js');

const block_example = {
  id: "4f04294fcd875_1607847853215",
  x: 0,
  y: 0,
  anchorPoint: { x: 0, y: 0 },
  pixels: {
    "0,0": { x: 0, y: 0, color: "gray", clearEdges: ["top", "left"] },
    "1,0": { x: 1, y: 0, color: "gray", clearEdges: ["top"] },
    "2,0": { x: 2, y: 0, color: "gray", clearEdges: ["top"] },
    "3,0": { x: 3, y: 0, color: "gray", clearEdges: ["top", "right"] },
    "0,1": { x: 0, y: 1, color: "gray", clearEdges: ["bottom", "left"] },
    "1,1": { x: 1, y: 1, color: "gray", clearEdges: ["bottom"] },
    "2,1": { x: 2, y: 1, color: "gray", clearEdges: ["bottom"] },
    "3,1": { x: 3, y: 1, color: "gray", clearEdges: ["bottom", "right"] },
  },
};

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

// I think this function is not being used
// function moveBlock(block, position) {
//   // Delete grid pixels for this block
//   for (const key in block.pixels) {
//     if (block.pixels.hasOwnProperty(key)) {
//       const gridKey = blockPixelToGridKey(block, key);
//       delete g_viewport.blockData.gridpixels[gridKey];
//     }
//   }
//   g_viewport.blockData.gridpixels

//   // Move block
//   setBlockPosition(block, position);

//   // Add grid pixels for this block
//   for (const key in block.pixels) {
//     if (block.pixels.hasOwnProperty(key)) {
//       const gridPosition = getGridPixel(block, key);
//       g_viewport.AddGridpixel(gridPosition.x, gridPosition.y, block.id);
//     }
//   }
// }


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
function getGridPixel(block, key) {
  if (block.pixels.hasOwnProperty(key)) {
    const pixel = block.pixels[key];
    return {
      x: pixel.x + block.x - block.anchorPoint.x,
      y: pixel.y + block.y - block.anchorPoint.y
    };
  }
}

function getGridPixel_id(block, key) {
  const gridPixel = getGridPixel(block, key);
  gridPixel.id = block.id;
  return gridPixel;
}

function getGridPixelKeys(block) {
  const gridPixelKeys = [];

  for (const key in block.pixels) {
    if (block.pixels.hasOwnProperty(key)) {
      const gridPixelKey = blockPixelToGridKey(block, key);
      gridPixelKeys.push(gridPixelKey);
    }
  }
  return gridPixelKeys;
}

function blockPixelToGridKey(block, key) {
  const pixel = getGridPixel(block, key);
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
  // moveBlock,
  setBlockAnchorPoint,
  setBlockAnchorPointAutoShift,
  getGridPixel,
  getGridPixelKeys,
  blockPixelToGridKey,
  getPositionInBlock
};
