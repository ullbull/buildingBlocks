// Delete all gridpoints that has no linked blocks
function deleteBadGridpoints(blockData) {
  for (const key in blockData.gridPoints) {
    if (blockData.gridPoints.hasOwnProperty(key)) {
      const gridpoint = blockData.gridPoints[key];
      if (typeof blockData.blocks[gridpoint] == 'undefined') {
        console.log('Deleting bad gridpoint: ', key);
        delete blockData.gridPoints[key];
      }
    }
  }
}

// Delete all blocks that has no linked grid point
function deleteBadBlocks(blockData) {
  let blockOK;
  for (const blockKey in blockData.blocks) {
    if (blockData.blocks.hasOwnProperty(blockKey)) {
      const block = blockData.blocks[blockKey];
      blockOK = false;
      for (const gPkey in blockData.gridPoints) {
        if (blockData.gridPoints.hasOwnProperty(gPkey)) {
          const gridPoint = blockData.gridPoints[gPkey];
          if (gridPoint == blockKey) {
            blockOK = true;
            break;
          }
        }
      }
      if (!blockOK) {
        console.log(`Deleting bad block: ${blockKey}`);
        delete blockData.blocks[blockKey];
      }
    }
  }
}
exports.deleteBadGridpoints = deleteBadGridpoints;
exports.deleteBadBlocks = deleteBadBlocks;
