let selectedBlocks = {};

function getBlocks() {
  return selectedBlocks;
}

function resetBlocks() {
  selectedBlocks = {};
}

function addBlock(block) {
  if (typeof block != 'undefined') {
    if (block.hasOwnProperty('id')) {
      selectedBlocks[block.id] = block;
    }
  }
}

function removeBlock(block) {
  if (typeof block != 'undefined') {
    if (block.hasOwnProperty('id')) {
      delete selectedBlocks[block.id];
    }
  }
}

export {
  getBlocks,
  resetBlocks,
  addBlock,
  removeBlock
}