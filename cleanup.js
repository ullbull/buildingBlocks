const dataKeeper_2 = require('./dataKeeper_2_njs.js');
const fileManager = require('./fileManager.js');

// Delete all gridpoints that has no linked blocks
function deleteBadGridpoints(sectionName) {
  const gridpoints = dataKeeper_2.getGridPoints(sectionName)
  const keysToDelete = [];

  for (const key in gridpoints) {
    if (Object.hasOwnProperty.call(gridpoints, key)) {
      const blockID = gridpoints[key];
      const blockIndex = dataKeeper_2.getBlockIndex(sectionName, blockID)
      if (blockIndex == -1) {
        console.log('Found bad gridpoint: ', key);
        keysToDelete.push(key);
      }
    }
  }

  // Delete bad gridpoints
  if(keysToDelete[0]) {
    console.log(`Deleting bad gridpoints: ${keysToDelete}`);
    const sectionNames = dataKeeper_2.deleteGridPoints_(keysToDelete);
    fileManager.saveSectionsToFiles(sectionNames);
  }
}

// Delete all blocks that has no gridpoint pointing to it
function deleteBadBlocks(sectionName) {
  let blockOK = false;
  const blockIDsToDelete = [];
  const blocks = dataKeeper_2.getBlocks(sectionName)
  const gridpoints = dataKeeper_2.getGridPoints(sectionName)

  blocks.forEach(block => {
    blockOK = false;
    for (const key in gridpoints) {
      if (Object.hasOwnProperty.call(gridpoints, key)) {
        const blockID = gridpoints[key];
        if (block.id == blockID) {
          console.log(`OK ${block.id}`)
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
  deleteBadGridpoints,
  deleteBadBlocks,
}
