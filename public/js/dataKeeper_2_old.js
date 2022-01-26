import * as blockModule from './block.js';
import * as sectionManager from './sectionManager.js';
import * as helpers from './helpers.js';

const sectionExample = {
  "0,0": {
    blocks: [],
    gridpixels: {
      "5,3": "id_string-30295",
      "5,4": "id_string-30295"
    }
  },

  "1,0": {
    blocks: [],
    gridpixels: {
      "5,3": "id_string-30295",
      "5,4": "id_string-30295"
    }
  }
};

// Should be able to change to const
let Sections = {};
const emptySection = {
  blocks: [],
  gridpixels: {}
}

function getAllSections() {
  return Sections;
}

// OverWrites section
function setSection(section, sectionName) {
  Sections[sectionName] = section;
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
function getSection(sectionName) {
  if (!Sections.hasOwnProperty(sectionName)) {
    Sections[sectionName] = helpers.copyObject(emptySection);
  }
  return Sections[sectionName];
}

// Returns the sections. If any section doesn't exist
// an empty section is created.
function getSections(sectionNames) {
  const sections = {};

  sectionNames.forEach(sectionName => {
    sections[sectionName] = getSection(sectionName);
  });

  return sections;
}

// Returns data from section or
// undefined if data doesn't exist.
function getData(sectionName, dataName) {
  if (dataName == 'blocks' || dataName == 'gridpixels') {
    return getSection(sectionName)[dataName];
  }
  else {
    throw (`${dataName} is not a valid data name!`);
  }
}

// Returns all blocks from section or
// empty array if blocks doesn't exist.
function getBlocks(sectionName) {
  return getData(sectionName, 'blocks');
}

// Returns all gridpixels from section or
// empty object if gridpixels doesn't exist.
function getGridPixels(sectionName) {
  return getData(sectionName, 'gridpixels');
}

// Returns the block or
// undefined if the block doesn't exist.
function getBlock(sectionName, blockID) {
  return getBlocks(sectionName).find(block => block.id === blockID);
}

// Returns the block and sectionName or
// { undefined, undefined } if the block doesn't exist.
function findBlock(blockID) {
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

// Returns index of block or
// -1 if block doesn't exist
function getBlockIndex(sectionName, blockID) {
  return getBlocks(sectionName).findIndex(block => block.id === blockID);
}

function addGridPixel(sectionName, key, blockID) {
  const { x, y } = helpers.keyToPosition(key);
  const section = getSection(sectionName);

  // If this grid pixel already belongs to a block,
  // we have to delete that pixel from existing block

  // Check if grid pixel exist
  if (typeof section.gridpixels[key] != 'undefined') {
    const id = section.gridpixels[key];
    const block = getBlock(sectionName, id);
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
      delete section.blocks[id];
    } else {
      // find clear edges in that block
      blockModule.findClearEdges(block.pixels);
    }
  }

  // Add grid pixel
  section.gridpixels[key] = blockID;
}

// Adds the block in block positions section.
// Returns the section name where block was added.
// Note that pixels in block could be in another section
// but will still be added in section for the blocks position.
function addBlock(block) {
  // Find out what section the block should be added to
  const sectionName = sectionManager.getSectionName(block.x, block.y);

  const section = getSection(sectionName);
  const gridPointKeys = blockModule.getGridPixelKeys(block);

  // If the block already exists, we have to delete it and
  // it's grid pixels from stored data before adding the block

  // Check if this block exist
  // const index = section.blocks.findIndex(x => x.id == block.id);
  const index = getBlockIndex(sectionName, block.id);
  if (index != -1) {
    // The block exists
    const oldKeys = blockModule.getGridPixelKeys(section.blocks[index]);
    const gridpixels = getGridPixels(sectionName);

    // Delete blocks grid pixels from stored data
    oldKeys.forEach(key => {
      delete gridpixels[key];
    });

    // Delete the block
    section.blocks.splice(index, 1);
  }

  // Add the block
  getBlocks(sectionName).push(block);

  // Add gridpixels
  gridPointKeys.forEach(key => {
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

  blocks.forEach(block => {
    const name = addBlock(block);
    sectionNames[name] = name;
  });

  return Object.values(sectionNames);
}

// Returns the block at passed position
// or undefined if there is no block.
function _getBlockAtPosition(x, y, key) {
  let block;
  const sectionName = sectionManager.getSectionName(x, y)
  const gridpixels = getGridPixels(sectionName);
  const blocks = getBlocks(sectionName);

  if (gridpixels.hasOwnProperty(key)) {
    const blockID = gridpixels[key];
    block = blocks.find(block => block.id == blockID);
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
  const { block, sectionName } = findBlock(blockID);
  if (!block) {
    console.error("Could not find the block", blockID);
    return;
  }
  const section = getSection(sectionName);
  const index = section.blocks.findIndex(block => block.id == blockID);

  // Delete grid pixels
  for (const key in block.pixels) {
    if (block.pixels.hasOwnProperty(key)) {
      const pos = blockModule.getGridPixel(block, key);
      deleteGridPixel(sectionName, pos.x, pos.y);
    }
  }

  // Delete block
  section.blocks.splice(index, 1);

  return sectionName;
}

// Deletes the blocks and returns an array holding 
// all section names where a block was deleted.
function deleteBlocks(blockIDs) {
  const sectionNames = {};

  blockIDs.forEach(blockID => {
    const name = deleteBlock(blockID);
    sectionNames[name] = name;
  })

  return Object.values(sectionNames);
}

// Deletes grid pixel and returns section name 
// where grid pixel was deleted
function deleteGridPixel_(key) {
  const { section, sectionName } = findSection(key);
  if (!sectionName) {
    console.error("Could not find the grid pixel", key);
    return;
  }

  delete getGridPixels(sectionName)[key];
  return sectionName;
}

// Deletes the gridpixels and returns an array holding 
// all section names where a grid pixel was deleted.
function deleteGridPixels_(keys) {
  const sectionNames = {};

  keys.forEach(key => {
    const name = deleteGridPixel_(key);
    sectionNames[name] = name;
  })

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
  setSections,
  getAllSections,
  getSection,
  setSection,
  getSections,
  getBlocks,
  getGridPixels,
  addBlock,
  addBlocks,
  getBlockAtPosition,
  getBlockAtPosition_k,
  getBlockIndex,
  deleteBlock,
  deleteBlocks,
  deleteGridPixel_,
  deleteGridPixels_,
  deleteGridPixel,
  deleteGridPixel_2
};
