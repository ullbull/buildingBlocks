import * as helpers from './helpers.js';

let selectedBlocks = {};

function getBlocks() {
  return selectedBlocks;
}

function getBlocksArray() {
  const blocks = [];
  for (const key in selectedBlocks) {
    if (selectedBlocks.hasOwnProperty(key)) {
      const block = selectedBlocks[key];
      blocks.push(block);
    }
  }
  return blocks;
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

function addBlocksByGridPoints(gridPoints, viewport) {
  for (const key in gridPoints) {
    if (gridPoints.hasOwnProperty(key)) {
      addBlock(helpers.getBlockByKey(key, viewport));
    }
  }
}

function removeBlocksByGridPoints(gridPoints, viewport) {
  for (const key in gridPoints) {
    if (gridPoints.hasOwnProperty(key)) {
      removeBlock(helpers.getBlockByKey(key, viewport));
    }
  }
}

export {
  getBlocks,
  getBlocksArray,
  resetBlocks,
  addBlock,
  removeBlock,
  addBlocksByGridPoints,
  removeBlocksByGridPoints
}