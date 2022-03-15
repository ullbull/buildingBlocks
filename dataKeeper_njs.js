const blockModule = require('./block_njs.js');
const sectionTools = require('./sectionTools_njs.js');
const helpers = require('./helpers_njs.js');

const BlockExample = {
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

const SectionExample = {
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

const BlockDataExample = {
  blocks: {
    "4f04294fcd875_1607847853215": { id: "4f04294fcd875_1607847853215" },
  },
  gridpixels: {
    "5,3": "4f04294fcd875_1607847853215",
    "5,4": "4f04294fcd875_1607847853215",
  },
};

// key = blockID, value = sectionName
const SectionDataExample = {
  "4f04294fcd875_1607847853215": "0,0",
  "29f33c0e0b50f_1641825802355": "0,0",
};

const EmptySection = {
  blocks: {},
  gridpixels: {},
};
let SectionData = {};
let BlockData = { blocks: {}, gridpixels: {} };

/**
 * Erase all stored data.
 */
function _init() {
  SectionData = {};
  BlockData = { blocks: {}, gridpixels: {} };
}

/**
 * Merges newBlockData into blockData
 * @param {BlockData} blockData
 * @param {BlockData} newBlockData
 */
function mergeBlockData(blockData, newBlockData) {
  Object.assign(blockData.blocks, newBlockData.blocks);
  Object.assign(blockData.gridpixels, newBlockData.gridpixels);
}

function _addToSectionData(blockID, sectionName ){
  SectionData[blockID] = sectionName;
}

/**
 * Adds data to sectionData. Overwrites if data exists.
 * @param {BlockData} blockData
 * @param {string} sectionName
 * @private
 */
function _updateSectionData(blockData, sectionName) {
  for (const blockID in blockData.blocks) {
    if (blockData.blocks.hasOwnProperty(blockID)) {
      const block = blockData.blocks[blockID];
      _addToSectionData(block.id, sectionName);
    }
  }
}

/**
 * Adds data to BlockData. Overwrites if data exists.
 * @param {BlockData} newBlockData
 * @private
 */
function _updateBlockData(newBlockData) {
  mergeBlockData(BlockData, newBlockData)
}

/**
 * Adds or overwrites a section in BlockData and updates SectionData.
 * @param {BlockData} blockData
 * @param {string} sectionName
 */
function addSection(blockData, sectionName) {
  _updateBlockData(blockData);
  _updateSectionData(blockData, sectionName);
}

/**
 * Adds or overwrites sections in BlockData and updates SectionData.
 * @param {{"0,0": BlockData}} sections
 */
function addSections(sections) {
  for (const sectionName in sections) {
    if (sections.hasOwnProperty(sectionName)) {
      const section = sections[sectionName];
      addSection(section, sectionName);
    }
  }
}

/**
 * Erase all stored data and set new data
 * @param {BlockData} blockData 
 */
function setNewBlockData(blockData) {
  // Erase all stored data
  _init();

  // Add new data
  addSections(blockData);
}

/**
 * Returns one section from stored data or empty section if the section doesn't exist.
 * @param {string} sectionName
 * @returns {BlockData}
 * @private
 */
function getBlockData(sectionName = null) {
  if (sectionName == null) {
    return helpers.copyObject(BlockData);
  }

  const section = helpers.copyObject(EmptySection);
  const blocks = getBlocks(sectionName);
  
  // Add blocks and gridpixels to section
  addBlocksToData(blocks, section);
  
  return section;
}

/**
 * Returns sections of stored data or empty section if the sections doesn't exist.
 * @param {string[]} sectionNames 
 * @returns {BlockData}
 */
function getBlockDataSections(sectionNames) {
  const blockData = helpers.copyObject(EmptySection)
  sectionNames.forEach(sectionName => {
    const section = getBlockData(sectionName);
    mergeBlockData(blockData, section);
  });
  return blockData;
}

/**
 * Returns the sectionName where the block is stored.
 * @param {string} blockID 
 * @returns {string} sectionName or undefined
 */
function getSectionName(blockID) {
  return SectionData[blockID];
}

/**
 * 
 * @returns Array of section names for all stored data
 */
function getAllSectionNames() {
  const sectionNames = {}
  for (const key in SectionData) {
    if (SectionData.hasOwnProperty(key)){
      const sectionName = SectionData[key];
      sectionNames[sectionName] = sectionName;
    }
  }
  return Object.values(sectionNames);
}

/**
 * Returns gridpixels from section or
 * empty object if section doesn't exist. 
 * @param {string} sectionName 
 * @returns {BlockDataExample.gridpixels}
 */
function getGridpixels(sectionName) {
  const section = getSection(sectionName);
  return section.gridpixels;
}

function getAllGridpixels(){
  return BlockData.gridpixels;
}

/**
 * Returns blocks from section or
 * empty object if section doesn't exist. 
 * @param {string} sectionName
 * @returns {BlockData.blocks} blocks
 */
 function getBlocks(sectionName) {
  const blocks = {};
  for (const [blockID, value_sectionName] of Object.entries(SectionData)) {
    if (value_sectionName == sectionName) {
      const block = getBlock(blockID);
      if (block) {
        blocks[blockID] = block;
      }
    }
  }
  return blocks;
}

/**
 * Returns the block from stored data or
 * undefined if the block doesn't exist. 
 * @param {string} blockID 
 * @returns block or undefined
 */
function getBlock(blockID) {
  return getBlockFromData(blockID, BlockData)
}

/**
 * Returns the block or
 * undefined if the block doesn't exist. 
 * @param {string} blockID 
 * @param {object} blockData 
 * @returns block or undefined
 */
function getBlockFromData(blockID, blockData) {
  return blockData.blocks[blockID];
}

/**
 * Returns the block and sectionName or
 * { undefined, undefined } if no block was found.
 * @param {string} blockID
 * @param {BlockDataExample} blockData 
 * @returns {block, sectionName}
 */
function findBlock(blockID) {
  const block = getBlockFromData(blockID, BlockData);
  const sectionName = getSectionName(blockID);
  return { block, sectionName };
}

/**
 * Adds a gridPixel to blockData
 * @param {string} key gridPixelKey
 * @param {string} blockID 
 * @param {BlockDataExample} blockData 
 */
function addGridPixelToData(key, blockID, blockData) {
  const { x, y } = helpers.keyToPosition(key);

  // If this grid pixel already belongs to a block,
  // we have to delete that pixel from existing block

  // Check if grid pixel exist
  if (typeof blockData.gridpixels[key] != "undefined") {
    const id = blockData.gridpixels[key];
    const block = getBlockFromData(id, blockData);
    if (!block) {
      console.log("Something is wrong!")
      return;
    }
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

/**
 * Adds a block to blockData
 * @param {object} block 
 * @param {object} blockData
 * @returns {string} sectionName where the block was added
 */
function addBlockToData(block, blockData) {
  // Find out what section the block should be added to
  const sectionName = sectionTools.getSectionName(block.x, block.y);

  const gridPixelKeys = blockModule.getGridPixelKeys(block);

  // If the block already exists in blockData, we have to delete it and
  // it's grid pixels from blockData before adding the block

  // Check if this block exists
  const existingBlock = blockData.blocks[block.id];
  if (existingBlock) {
    // The block exists
    const oldKeys = blockModule.getGridPixelKeys(existingBlock);

    // Delete blocks grid pixels from blockData
    oldKeys.forEach((key) => {
      delete blockData.gridpixels[key];
    });

    // Delete the block
    delete blockData.blocks[block.id]
  }

  // Add the block
  blockData.blocks[block.id] = block;

  // Add gridpixels
  gridPixelKeys.forEach((key) => {
    addGridPixelToData(key, block.id, blockData);
  });

  return sectionName;
}

/**
 * Adds blocks to blockData
 * @param {object} blocks
 * @param {BlockDataExample} blockData
 * @returns {array} sectionNames where the blocks where added.
 */
function addBlocksToData(blocks, blockData) {
  const sectionNames = {};

  for (const key in blocks) {
    if (blocks.hasOwnProperty(key)){
      const block = blocks[key];
      // if (!block){
      //   console.log(blocks, blockData)
      //   continue;
      // }
      const sectionName = addBlockToData(block, blockData);
      sectionNames[sectionName] = sectionName;
    }
  }

  return Object.values(sectionNames);
}

/**
 * Adds block to BlockData
 * @param {object} block
 * @returns {string} sectionName where the block was added.
 */
function addBlock(block) {
  const sectionName = addBlockToData(block, BlockData);
  _addToSectionData(block.id, sectionName);
  return sectionName;
}

/**
 * Adds blocks to BlockData
 * @param {object} blocks
 * @returns {array} sectionNames where the blocks where added.
 */
function addBlocks(blocks) {
  const sectionNames = {};

  // Note: Looping through all blocks and calling addBlock
  // instead of just calling addBlockToData,
  // because addBlock will also add block id to SectionData.
  for (const key in blocks) {
    if (blocks.hasOwnProperty(key)){
      const block = blocks[key];
      const sectionName = addBlock(block);
      sectionNames[sectionName] = sectionName;
    }
  }

  return Object.values(sectionNames);
}

/**
 * Returns the block at passed position
 * or undefined if there is no block.
 * @param {{key: string} | {x: int, y: int}} args 
 * @returns block
 */
function getBlockAtPosition(args) {
  let gridpixelKey = args.key;
  let x = args.x;
  let y = args.y;
  if (!gridpixelKey) {
    gridpixelKey = helpers.positionToKey(x, y);
  }

  let block = undefined;
  const gridpixels = getAllGridpixels();

  if (gridpixels.hasOwnProperty(gridpixelKey)) {
    const blockID = gridpixels[gridpixelKey];
    block = getBlock(blockID);
  }
  return block;
}

/**
 * Deletes the block and returns the section name
 * where the block was deleted. 
 * @param {string} blockID 
 * @param {object} blockData 
 * @returns {string} sectionName
 */
function deleteBlockFromData(blockID, blockData) {
  const block = getBlockFromData(blockID, blockData)
  if (!block) {
    console.error("Could not find the block", blockID);
    return;
  }
  
  // Delete grid pixels
  for (const key in block.pixels) {
    if (block.pixels.hasOwnProperty(key)) {
      const pos = blockModule.getGridPixel(block, key);
      deleteGridpixelFromData(pos, blockData);
    }
  }
  
  // Delete block
  delete blockData.blocks[blockID];
  
  const sectionName = getSectionName(blockID);
  return sectionName;
}

/**
 * Deletes the blocks and returns an array of section names
 * where any block was deleted. 
 * @param {string[]} blockIDs
 * @param {object} blockData 
 * @returns {string[]} sectionName
 */
function deleteBlocksFromData(blockIDs, blockData) {
  const sectionNames = {};

  blockIDs.forEach((blockID) => {
    const name = deleteBlockFromData(blockID, blockData);
    sectionNames[name] = name;
  });

  // Return sectionNames as array
  return Object.values(sectionNames);
}

/**
 * Deletes the block from stored data
 * and returns the section name
 * where the block was deleted. 
 * @param {string} blockIDs
 * @returns {string} sectionName
 */
function deleteBlock(blockID) {
  const sectionName = deleteBlockFromData(blockID, BlockData);
  // Delete block from SectionData
  delete SectionData[blockID];
  return sectionName
}

/**
 * Deletes the blocks from stored data
 * and returns an array of section names
 * where any block was deleted. 
 * @param {string[]} blockIDs
 * @returns {string[]} sectionName
 */
function deleteBlocks(blockIDs) {
  const sectionNames = deleteBlocksFromData(blockIDs, BlockData);
  // Delete block from SectionData
  blockIDs.forEach(blockID => {
    delete SectionData[blockID];
  });
  return sectionNames;
}

/**
 * Deletes the blocks from stored data
 * and returns an array of section names
 * where any block was deleted.
 * @param {string[]} sectionNames 
 * @returns {string[]}
 */
 function flushData(sectionNames) {
  const section = getBlockDataSections(sectionNames);
  const blockIDs = Object.keys(section.blocks);
  return deleteBlocks(blockIDs);
}

/**
 * 
 * @param {{key: string} or {x: int, y: int}} args 
 * @param {BlockDataExample} blockData 
 * @returns {string} sectionName or undefined
 */
function deleteGridpixelFromData(args, blockData){
  let key = args.key;
  let x = args.x;
  let y = args.y;
  if (!key) {
    key = helpers.positionToKey(x, y);
  }
  const block = getBlockAtPosition({"key": key});

  let sectionName = undefined;
  if (block) {
    sectionName = getSectionName(block.id);
  }

  delete blockData.gridpixels[key];
  return sectionName;
}

/**
 * 
 * @param {{key: string} or {x: int, y: int}} args 
 * @returns {string} sectionName or undefined
 */
function deleteGridpixel(args){
  deleteGridpixelFromData(args, BlockData);
}

/**
 * 
 * @param {string[]} gridpixelKeys 
 * @returns {string[]} array of sectionNames or empty array
 */
function deleteGridpixels(gridpixelKeys){
  const sectionNames = [];
  gridpixelKeys.forEach(key => {
    const sectionName = deleteGridpixelFromData({ "key": key }, BlockData);
    if (sectionName) {
      sectionNames.push(sectionName);
    }
  });
  return sectionNames;
}

module.exports = {
  BlockData,
  EmptySection,
  mergeBlockData,
  addSection,
  getBlockData,
  getBlockDataSections,
  addSections,
  setNewBlockData,
  getSectionName,
  getBlocks,
  getAllSectionNames,
  getGridpixels,
  getAllGridpixels,
  getBlockFromData,
  getBlock,
  findBlock,
  addGridPixelToData,
  addBlockToData,
  addBlocksToData,
  addBlock,
  addBlocks,
  getBlockAtPosition,
  deleteBlockFromData,
  deleteBlocksFromData,
  deleteBlock,
  deleteBlocks,
  flushData,
  deleteGridpixelFromData,
  deleteGridpixel,
  deleteGridpixels
};
