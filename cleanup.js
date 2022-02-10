const dataKeeper = require('./dataKeeper_njs.js');

// Delete all gridpixels that has no linked blocks
function deleteBadGridpixels(blockData) {
  const gridpixels = blockData.gridpixels
  const keysToDelete = [];

  for (const key in gridpixels) {
    if (Object.hasOwnProperty.call(gridpixels, key)) {
      const blockID = gridpixels[key];
      const block = dataKeeper.getBlockFromData(blockID, blockData)
      if (!block) {
        console.log('Found bad grid pixel: ', key);
        keysToDelete.push(key);
      }
    }
  }

  let sectionNames = [];
  // Delete bad gridpixels
  if(keysToDelete[0]) {
    console.log(`Deleting bad gridpixels: ${keysToDelete}`);
    sectionNames = dataKeeper.deleteGridpixels(keysToDelete);
  }
  return sectionNames;
}

// Delete all blocks that has no grid pixel pointing to it
function deleteBadBlocks(blockData) {
  let blockOK = false;
  const blockIDsToDelete = [];
  const blocks = blockData.blocks;
  const gridpixels = blockData.gridpixels;

  for (const key in blocks) {
    if (blocks.hasOwnProperty(key)) {
      const block = blocks[key];
      blockOK = false;
      for (const key in gridpixels) {
        if (Object.hasOwnProperty.call(gridpixels, key)) {
          const blockID = gridpixels[key];
          if (block.id == blockID) {
            blockOK = true;
            break;
          }
        }
      }
      if (!blockOK) {
        console.log(`Found bad block: ${block.id}`);
        blockIDsToDelete.push(block.id);
      }
    }
  }

  const sectionNames = [];
  // Delete bad blocks
  if(blockIDsToDelete[0]) {
    console.log(`Deleting bad blocks: ${blockIDsToDelete}`);
    sectionNames = dataKeeper.deleteBlocks(blockIDsToDelete);
  }
  return sectionNames;
}

module.exports = {
  deleteBadGridpixels,
  deleteBadBlocks,
}
