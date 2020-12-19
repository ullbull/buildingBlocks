const dataKeeper_2 = require('./dataKeeper_2_njs.js');
const fileManager = require('./fileManager.js');

function deleteBadGridpoints(sectionName) {
  deleteBadGridpoints_(dataKeeper_2.getSection(sectionName), sectionName)
}

// Delete all gridpoints that has no linked blocks
function deleteBadGridpoints_(section, sectionName) {
  for (const key in section.gridPoints) {
    if (section.gridPoints.hasOwnProperty(key)) {
      const blockID = section.gridPoints[key];
      const blockIndex = dataKeeper_2.getBlockIndex(sectionName, blockID)
      if (blockIndex == -1) {
        console.log('Deleting bad gridpoint: ', key);
        // delete section.gridPoints[key];
      }
    }
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
