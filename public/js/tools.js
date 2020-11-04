import * as helpers from './helpers.js';
import * as selector from './selector.js';
import * as blockModule from './block.js';
import * as add from './addData.js';
import * as api from './api.js';
import * as blockHider from './blockHider.js';
import * as remover from './remover.js';

const builder = {
  viewport: {},   // must give it a viewport
  block: blockModule.createBlock(0, 0, 4, 2),

  draw: function () {
    this.viewport.DrawBlock(this.block);
  },

  mouseDown: function (event) {
    const wp = this.viewport.CanvasToWorldPosition(event.x, event.y);
    if (event.button == 0) {  // Left button down

      // Check if any block was clicked
      const clickedBlock = helpers.getBlockByPosition(wp.x, wp.y, this.viewport);
      if (clickedBlock) {
        // Change this block to copy of clicked block
        this.block = helpers.copyObject(clickedBlock);
        // Get new blockID
        this.block.id = helpers.generateID();

        // Set anchor point
        const clickedPixel = blockModule.getPositionInBlock(clickedBlock, wp.x, wp.y);
        const anchorPoint = { x: clickedPixel.x, y: clickedPixel.y };
        blockModule.setBlockAnchorPoint(this.block, anchorPoint);
        blockModule.setBlockPosition(this.block, wp);

        // Hide clicked block
        blockHider.addHiddenBlockID(clickedBlock.id);
      }
    }
  },

  mouseUp: function (event) {
    if (event.button == 0) {  // Left button up 
      // Add block
      add.addBlockTo(this.viewport.blockData, this.block);

      // Send blocks to server
      api.sendData('/api', this.block);

      // Delete hidden blocks
      remover.deleteBlocksGlobally(this.viewport.blockData, blockHider.resetHiddenBlockIDs());

      // Get new blockID
      this.block.id = helpers.generateID();
    }
  },
  mouseMove: function (event) {
    const worldPosition = this.viewport.CanvasToWorldPosition(event.x, event.y)
    blockModule.setBlockPosition(this.block, worldPosition);

    const hoveredBlock = helpers.getBlockByPosition(worldPosition.x, worldPosition.y, this.viewport);
    if (hoveredBlock) console.log(hoveredBlock.id, 'builder id', this.block.id);
  },

  keyDown: function (event) {

  },

  keyUp: function (event) {

  }
}

const mover = {
  draw: function () {
    console.log("mover draw");
  },
  mouseDown: function (event) {
  },
  mouseUp: function (event) {
  },
  mouseMove: function (event) {
    viewport.x -= event.movementX / viewport.pixelSize;
    viewport.y -= event.movementY / viewport.pixelSize;
  },
  keyDown: function (event, viewport) {
  },
  keyUp: function (event, viewport) {
  }
}

const boxSelection = {
  viewport: {},   // must give it a viewport
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  color: 'rgba(200,200,255,0.5)',
  gridPoints: {},

  initGridPoints: function () {
    let point = {};
    let key;
    this.gridPoints = {};

    // Create gridpoints for both positive and negative box size
    let x;
    let y;
    let width = (this.width < 0) ? this.width * -1 : this.width;
    let height = (this.height < 0) ? this.height * -1 : this.height;

    for (let w = 0; w < width; w++) {
      for (let h = 0; h < height; h++) {
        x = (this.width < 0) ? (w * -1) - 1 : w;
        y = (this.height < 0) ? (h * -1) - 1 : h;
        point = {
          x: Math.floor(this.x + x),
          y: Math.floor(this.y + y)
        };
        key = helpers.positionToKey(point.x, point.y);
        this.gridPoints[key] = 'SelectionBox';
      }
    }
  },

  setWidth: function (width) {
    this.width = width;
    this.initGridPoints();
  },

  setHeight: function (height) {
    this.height = height;
    this.initGridPoints();
  },

  draw: function () {
    this.viewport.DrawRectangle(this.x, this.y, this.width, this.height, this.color);
  },

  //////////////////////////////////////////

  mouseDown: function (event) {
    this.setWidth(0);
    this.setHeight(0);
    this.x = helpers.getXGrid(event.x, this.viewport.pixelSize);
    this.y = helpers.getYGrid(event.y, this.viewport.pixelSize);

    if (!(event.ctrlKey || event.buttons == 2)) {
      // Reset selected blocks
      selector.resetBlocks();
    }
  },

  mouseUp: function (event) {
  },

  mouseMove: function (event) {
    if (event.buttons == 1 || event.buttons == 2) {
      // Left or right button down
      this.setWidth(this.viewport.CanvasXToWorld(event.x) - this.x);
      this.setHeight(this.viewport.CanvasYToWorld(event.y) - this.y);

      if (event.buttons == 1) {   // Left button down
        selector.addBlocksByGridPoints(this.gridPoints, this.viewport)
      }
      if (event.buttons == 2) {   // Right button down
        selector.removeBlocksByGridPoints(this.gridPoints, this.viewport);
      }
    }
  },

  keyDown: function (event) {
  },
  keyUp: function (event) {
  }
}

export {
  builder,
  mover,
  boxSelection
}