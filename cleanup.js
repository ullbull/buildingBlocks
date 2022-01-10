const dataKeeper_2 = require('./dataKeeper_2_njs.js');
const fileManager = require('./fileManager.js');

// Delete all gridpixels that has no linked blocks
function deleteBadGridpixels(sectionName) {
  const gridpixels = dataKeeper_2.getGridPixels(sectionName)
  const keysToDelete = [];

  for (const key in gridpixels) {
    if (Object.hasOwnProperty.call(gridpixels, key)) {
      const blockID = gridpixels[key];
      const blockIndex = dataKeeper_2.getBlockIndex(sectionName, blockID)
      if (blockIndex == -1) {
        console.log('Found bad grid pixel: ', key);
        keysToDelete.push(key);
      }
    }
  }

  // Delete bad gridpixels
  if(keysToDelete[0]) {
    console.log(`Deleting bad gridpixels: ${keysToDelete}`);
    const sectionNames = dataKeeper_2.deleteGridPixels_(keysToDelete);
    fileManager.saveSectionsToFiles(sectionNames);
  }
}

// Delete all blocks that has no grid pixel pointing to it
function deleteBadBlocks(sectionName) {
  let blockOK = false;
  const blockIDsToDelete = [];
  const blocks = dataKeeper_2.getBlocks(sectionName)
  const gridpixels = dataKeeper_2.getGridPixels(sectionName)

  blocks.forEach(block => {
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
  })

  // Delete bad blocks
  if(blockIDsToDelete[0]) {
    console.log(`Deleting bad blocks: ${blockIDsToDelete}`);
    const sectionNames = dataKeeper_2.deleteBlocks(blockIDsToDelete);
    fileManager.saveSectionsToFiles(sectionNames);
  }
}

module.exports = {
  deleteBadGridpixels,
  deleteBadBlocks,
}
