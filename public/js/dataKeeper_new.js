import * as blockModule from './block.js';
import * as sectionManager from './sectionManager.js';
import * as helpers from './helpers.js';

const blockExample = {
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

const sectionExample = {
  "0,0": {
    blocks: {
      "19f33c0e0b50f_1641825802348": { id: "19f33c0e0b50f_1641825802348" },
    },
    gridpixels: {
      "5,3": "e9f33c0e0b50f_1641825802348",
      "5,4": "e9f33c0e0b50f_1641825802348",
    },
  },

  "1,0": {
    blocks: {
      "29f33c0e0b50f_1641825802355": { id: "29f33c0e0b50f_1641825802355" },
    },
    gridpixels: {
      "5,3": "e9f33c0e0b50f_1641825802355",
      "5,4": "e9f33c0e0b50f_1641825802355",
    },
  },
};

const blockDataExample = {
  blocks: {
    "4f04294fcd875_1607847853215": { id: "4f04294fcd875_1607847853215" },
  },
  gridpixels: {
    "5,3": "4f04294fcd875_1607847853215",
    "5,4": "4f04294fcd875_1607847853215",
  },
};

const sectionDataExample = {
  "4f04294fcd875_1607847853215": "0,0",
  "29f33c0e0b50f_1641825802355": "0,0",
}

const emptySection = {
  blocks: {},
  gridpixels: {}
}
const Sections = {};
const blockData = { blocks: {}, gridpixels: {} };

/**
 * @param {blockData} newBlockData
 */
function updateBlockData(newBlockData) {
  Object.assign(blockData.blocks, newBlockData.blocks);
  Object.assign(blockData.gridpixels, newBlockData.gridpixels);
}

function getAllSections() {
  return Sections;
}

function getBlockData() {
  return blockData;
}

// OverWrites section
function setSection_old(section, sectionName) {
  Sections[sectionName] = section;
}

function setSection(section, sectionName) {
  updateBlockData(section)
}

// Overwrites sections
function setSections(sections) {
  for (const sectionName in sections) {
    if (sections.hasOwnProperty(sectionName)) {
      const section = sections[sectionName];
      setSection(section, sectionName);
    }
  }
}

// Returns the section. If section doesn't exist
// an empty section is created.
function getSection_old(sectionName) {
  if (!Sections.hasOwnProperty(sectionName)) {
    Sections[sectionName] = helpers.copyObject(emptySection);
  }
  return Sections[sectionName];
}

function getSection(sectionName) {
  return blockData;
}

// Returns the sections. If any section doesn't exist
// an empty section is created.
function getSections_old(sectionNames) {
  const sections = {};

  sectionNames.forEach((sectionName) => {
    sections[sectionName] = getSection(sectionName);
  });

  return sections;
}

function getSections(sectionNames) {
  return blockData;
}

// Returns data from section or
// undefined if data doesn't exist.
function _getData(sectionName, dataName) {
  if (dataName == "blocks" || dataName == "gridpixels") {
    // return getSection(sectionName)[dataName];
    return blockData[dataName]
  } else {
    throw `${dataName} is not a valid data name!`;
  }
}

// Returns all blocks from section or
// empty array if blocks doesn't exist.
function getBlocks(sectionName = null) {
  return _getData(sectionName, "blocks");
}

// Returns all gridpixels from section or
// empty object if gridpixels doesn't exist.
function getGridPixels(sectionName = null) {
  return _getData(sectionName, "gridpixels");
}

// Returns the block or
// undefined if the block doesn't exist.
function getBlock(sectionName = null, blockID) {
  return getBlocks(sectionName)[blockID];
}

// Returns the block and sectionName or
// { undefined, undefined } if the block doesn't exist.
function findBlock(blockID) {
  const block = getBlock(null, blockID)
  const sectionName = null
  return {block, sectionName}
}

// Returns the block and sectionName or
// { undefined, undefined } if the block doesn't exist.
function findBlock_old(blockID) {
  for (const sectionName in Sections) {
    if (Sections.hasOwnProperty(sectionName)) {
      const block = getBlock(sectionName, blockID);
      if (block) {
        return { block, sectionName };
      }
    }
  }
  return { undefined, undefined };
}

// Returns section and sectionName or
// { undefined, undefined } if section doesn't exist
function findSection(key) {
  for (const sectionName in Sections) {
    if (Object.hasOwnProperty.call(Sections, sectionName)) {
      const section = Sections[sectionName];
      if (section.gridpixels.hasOwnProperty(key)) {
        return { section, sectionName };
      }
    }
  }
  return { undefined, undefined };
}

function addGridPixel(sectionName = null, key, blockID) {
  const { x, y } = helpers.keyToPosition(key);

  // If this grid pixel already belongs to a block,
  // we have to delete that pixel from existing block

  // Check if grid pixel exist
  if (typeof blockData.gridpixels[key] != "undefined") {
    const id = blockData.gridpixels[key];
    const block = blockData.blocks[id]
    const position = blockModule.getPositionInBlock(block, x, y);
    const pixelKey = helpers.positionToKey(position.x, position.y);

    // delete pixel from existing block
    delete block.pixels[pixelKey];

    // Check if block is empty
    let blockIsEmpty = true;
    for (const key in block.pixels) {
      if (block.pixels.hasOwnProperty(key)) {
        blockIsEmpty = false;
        break;
      }
    }

    // Delete block if it is empty of pixels
    if (blockIsEmpty) {
      delete blockData.blocks[id];
    } else {
      // find clear edges in that block
      blockModule.findClearEdges(block.pixels);
    }
  }

  // Add grid pixel
  blockData.gridpixels[key] = blockID;
}

// Adds the block in the blocks positions section.
// Returns the section name where block was added.
// Note that pixels in block could be in another section
// but will still be added in section for the blocks position.
function addBlock(block) {
  // Find out what section the block should be added to
  const sectionName = sectionManager.getSectionName(block.x, block.y);

  const gridPixelKeys = blockModule.getGridPixelKeys(block);

  // If the block already exists, we have to delete it and
  // it's grid pixels from stored data before adding the block

  // Check if this block exist
  const existingBlock = blockData.blocks[block.id];
  if (existingBlock) {
    // The block exists
    const oldKeys = blockModule.getGridPixelKeys(existingBlock);
    const gridpixels = getGridPixels(sectionName);

    // Delete blocks grid pixels from stored data
    oldKeys.forEach((key) => {
      delete gridpixels[key];
    });

    // Delete the block
    blockData.blocks.splice(index, 1);
  }

  // Add the block
  blockData.blocks[block.id] = block

  // Add gridpixels
  gridPixelKeys.forEach((key) => {
    addGridPixel(sectionName, key, block.id);
  });

  return sectionName;
}

// Adds the blocks in each block positions section.
// Returns an array holding all section names where a block was added.
// Note that pixels in a block could be in another section
// but will still be added in section for the blocks position.
function addBlocks(blocks) {
  const sectionNames = {};

  blocks.forEach((block) => {
    const name = addBlock(block);
    sectionNames[name] = name;
  });

  return Object.values(sectionNames);
}

// Returns the block at passed position
// or undefined if there is no block.
function _getBlockAtPosition(x, y, key) {
  let block;
  const sectionName = sectionManager.getSectionName(x, y);
  const gridpixels = getGridPixels(sectionName);
  const blocks = getBlocks(sectionName);

  if (gridpixels.hasOwnProperty(key)) {
    const blockID = gridpixels[key];
    // block = blocks.find((block) => block.id == blockID);
    block = blockData.blocks[blockID]
  }

  return block;
}

// Returns the block at passed position
// or undefined if there is no block.
function getBlockAtPosition(x, y) {
  const key = helpers.positionToKey(x, y);
  return _getBlockAtPosition(x, y, key);
}

// Returns the block at passed position
// or undefined if there is no block.
function getBlockAtPosition_k(key) {
  const p = helpers.keyToPosition(key);
  return _getBlockAtPosition(p.x, p.y, key);
}

// Deletes the block and returns section name
// where block was deleted
function deleteBlock(blockID) {
  // const { block, sectionName } = findBlock(blockID);
  const block = blockData.blocks[blockID]
  if (!block) {
    console.error("Could not find the block", blockID);
    return;
  }
  // const section = getSection(sectionName);
  // const index = section.blocks.findIndex((block) => block.id == blockID);

  // Delete grid pixels
  for (const key in block.pixels) {
    if (block.pixels.hasOwnProperty(key)) {
      const pos = blockModule.getGridPixel(block, key);
      deleteGridPixel(null, pos.x, pos.y);
    }
  }

  // Delete block
  section.blocks.splice(index, 1);
  delete blockData.blocks[blockID]

  return null;
}

// Deletes the blocks and returns an array holding
// all section names where a block was deleted.
function deleteBlocks(blockIDs) {
  const sectionNames = {};

  blockIDs.forEach((blockID) => {
    const name = deleteBlock(blockID);
    sectionNames[name] = name;
  });

  return Object.values(sectionNames);
}

// Deletes grid pixel and returns section name
// where grid pixel was deleted
function deleteGridPixel_(key) {
  // const { section, sectionName } = findSection(key);
  // if (!sectionName) {
  //   console.error("Could not find the grid pixel", key);
  //   return;
  // }

  // delete getGridPixels(sectionName)[key];
  // return sectionName;
  if (blockData.gridpixels.hasOwnProperty(key)) {
      delete blockData.gridpixels[key];
  }
  return null;
}

// Deletes the gridpixels and returns an array holding
// all section names where a grid pixel was deleted.
function deleteGridPixels_(keys) {
  const sectionNames = {};

  keys.forEach((key) => {
    const name = deleteGridPixel_(key);
    sectionNames[name] = name;
  });

  return Object.values(sectionNames);
}

function deleteGridPixel(sectionName, x, y) {
  const key = helpers.positionToKey(x, y);
  delete getGridPixels(sectionName)[key];
}

function deleteGridPixel_2(sectionName, key) {
  delete getGridPixels(sectionName)[key];
}

export {
  emptySection,
  setSections,
  getAllSections,
  getBlockData,
  getSection,
  setSection,
  getSections,
  getBlock,
  getBlocks,
  getGridPixels,
  addBlock,
  addBlocks,
  getBlockAtPosition,
  getBlockAtPosition_k,
  deleteBlock,
  deleteBlocks,
  deleteGridPixel_,
  deleteGridPixels_,
  deleteGridPixel,
  deleteGridPixel_2,
};
