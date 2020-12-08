const blockModule = require('./block_njs.js');
const sectionManager = require('./sectionManager_njs.js');
const helpers = require('./helpers_njs.js');

const BlockDataExample = {
  "0,0": {
    blocks: [],
    gridPoints: {
      "5,3": "id_string-30295",
      "5,4": "id_string-30295"
    }
  },

  "1,0": {
    blocks: [],
    gridPoints: {
      "5,3": "id_string-30295",
      "5,4": "id_string-30295"
    }
  }
};

let Sections = {};
const emptySection = {
  blocks: [],
  gridPoints: {}
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

// Returns the section name or
// undefined if section doesn't exist
function getSectionName(blockID) {
  const { block, sectionName } = getBlockAndSectionName(blockID);
  return sectionName;
}

// Returns data from section or
// undefined if data doesn't exist.
function getData(sectionName, dataName) {
  if (dataName == 'blocks' ||
    dataName == 'gridPoints') {
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

// Returns all gridPoints from section or
// empty object if gridPoints doesn't exist.
function getGridPoints(sectionName) {
  return getData(sectionName, 'gridPoints');
}

// Returns the block or
// undefined if the block doesn't exist.
function getBlock(sectionName, blockID) {
  return getBlocks(sectionName).find(block => block.id === blockID);
}

// Returns the block and sectionName or
// { undefined, undefined } if the block doesn't exist.
function getBlockAndSectionName(blockID) {
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

function getBlockIndex(sectionName, blockID) {
  return getBlocks(sectionName).findIndex(block => block.id === blockID);
}

function addGridPoint(sectionName, key, blockID) {
  const { x, y } = helpers.keyToPosition(key);
  const section = getSection(sectionName);

  // If this grid point already belongs to a block,
  // we have to delete that pixel from existing block

  // Check if grid point exist
  if (typeof section.gridPoints[key] != 'undefined') {
    const id = section.gridPoints[key];
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

  // Add grid point
  section.gridPoints[key] = blockID;
}

// Adds the block in block positions section.
// Returns the section name where block was added.
// Note that pixels in block could be in another section
// but will still be added in section for the blocks position.
function addBlock(block) {
  // Find out what section the block should be added to
  const sectionName = sectionManager.getSectionName(block.x, block.y);

  const section = getSection(sectionName);
  const gridPointKeys = blockModule.getGridPointKeysFromBlock(block);

  // If the block already exists, we have to delete it and
  // it's grid points from stored data before adding the block

  // Check if this block exist
  // const index = section.blocks.findIndex(x => x.id == block.id);
  const index = getBlockIndex(sectionName, block.id);
  if (index != -1) {
    // The block exists
    const oldKeys = blockModule.getGridPointKeysFromBlock(section.blocks[index]);
    const gridPoints = getGridPoints(sectionName);

    // Delete blocks grid points from stored data
    oldKeys.forEach(key => {
      delete gridPoints[key];
    });

    // Delete the block
    section.blocks.splice(index, 1);
  }

  // Add the block
  getBlocks(sectionName).push(block);

  // Add gridPoints
  gridPointKeys.forEach(key => {
    addGridPoint(sectionName, key, block.id);
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
  const gridPoints = getGridPoints(sectionName);
  const blocks = getBlocks(sectionName);

  if (gridPoints.hasOwnProperty(key)) {
    const blockID = gridPoints[key];
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
  const { block, sectionName } = getBlockAndSectionName(blockID);
  if (!block) {
    console.error("Could not find the block", blockID);
    return;
  }
  const section = getSection(sectionName);
  const index = section.blocks.findIndex(block => block.id == blockID);

  // Delete grid points
  for (const key in block.pixels) {
    if (block.pixels.hasOwnProperty(key)) {
      const pos = blockModule.getGridPosition(block, key);
      deleteGridPoint(sectionName, pos.x, pos.y);
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

function deleteGridPoint(sectionName, x, y) {
  const key = helpers.positionToKey(x, y);
  delete getGridPoints(sectionName)[key];
}

module.exports = {
  setSections,
  getAllSections,
  getSection,
  setSection,
  getSections,
  getBlocks,
  getGridPoints,
  addBlock,
  addBlocks,
  getBlockAtPosition,
  getBlockAtPosition_k,
  deleteBlocks
};
