import * as helpers from './helpers.js';
import * as selector from './selector.js';
import * as blockModule from './block.js';
import * as dataKeeper from './dataKeeper.js';
import * as api from './api.js';
import * as blockHider from './blockHider.js';
import * as remover from './remover.js';

function Builder(viewport) {
  this.viewport = viewport;
  this.block = blockModule.createBlock(0, 0, 4, 2);
  this.hideMe = false;
  this.hoveredBlock = null;
  this.clickedBlock = null;
  this.insideFrame = false;

  this.draw = function () {
    const alphaValue = (
      this.clickedBlock &&
      this.insideFrame
    ) ? 1 : 0.5;

    if (!this.hideMe) {
      this.viewport.DrawBlock(this.block, { alphaValue });
    } else {
      this.viewport.DrawBlock(this.hoveredBlock, { color: 'rgba(130,30,60,0.5' });
    }
  }

  this.build = function () {
    // Add block
    dataKeeper.addBlock(this.block);
    
    // Send blocks to server
    api.sendData('/api', this.block);

    // Delete hidden blocks
    dataKeeper.deleteBlocks(blockHider.resetHiddenBlockIDs());

    // Get new blockID
    this.block.id = helpers.generateID();
  }

  this.changeBlockToClickedBlock = function () {
    // Get clicked pixel
    const clickedPixel = blockModule.getPositionInBlock(this.clickedBlock, this.block.x, this.block.y);

    // Change this block to copy of clicked block
    this.block = helpers.copyObject(this.clickedBlock);

    // Set anchor point
    blockModule.setBlockAnchorPointAutoShift(this.block, clickedPixel.x, clickedPixel.y);

    // Get new blockID
    this.block.id = helpers.generateID();

    // Hide clicked block
    blockHider.addHiddenBlockID(this.clickedBlock.id);
  }

  this.mouseDown = function (event) {
    if (event.button == 0) {  // Left button down
      this.clickedBlock = helpers.getBlockByPosition(this.block.x, this.block.y, this.viewport);

      // Check if any block was clicked
      if (this.clickedBlock) {
        // Change this.block to clicked block
        this.changeBlockToClickedBlock();

        this.hideMe = false;
      }
    }
  }

  this.mouseUp = function (event) {
    if (event.button == 0) {  // Left button up 
      this.clickedBlock = null;
      this.insideFrame = helpers.insideFrame(event.x, event.y, window.innerWidth, window.innerHeight, 20);

      if (this.insideFrame) {
        this.build();
      } else {
        // Delete block if dropped outside frame
        dataKeeper.deleteBlocks(blockHider.resetHiddenBlockIDs());
      }
    }
  }

  this.mouseMove = function (event) {
    const worldPosition = this.viewport.CanvasToWorldPosition(event.x, event.y)
    blockModule.setBlockPosition(this.block, worldPosition);

    this.hoveredBlock = helpers.getBlockByPosition(worldPosition.x, worldPosition.y, this.viewport);
    this.insideFrame = helpers.insideFrame(event.x, event.y, window.innerWidth, window.innerHeight, 20)

    this.hideMe = (
      this.hoveredBlock &&
      !blockHider.getHiddenBlockIDs().hasOwnProperty(this.hoveredBlock.id) &&
      !this.clickedBlock
    );

  }

  this.keyDown = function (event) {

  }

  this.keyUp = function (event) {

  }
}

function Mover(viewport) {
  this.viewport = viewport;

  this.draw = function () {
  }

  this.mouseDown = function (event) {
  }

  this.mouseUp = function (event) {
  }

  this.mouseMove = function (event) {
    if (event.buttons == 4) {
      // Middle button down
      this.viewport.x -= event.movementX / this.viewport.pixelSize;
      this.viewport.y -= event.movementY / this.viewport.pixelSize;
    }
  }

  this.keyDown = function (event) {
  }

  this.keyUp = function (event) {
  }
}

function BoxSelection(viewport) {
  this.viewport = viewport;
  this.x = 0;
  this.y = 0;
  this.width = 0;
  this.height = 0;
  this.color = 'rgba(200,200,255,0.5)';
  this.gridPoints = {};
  // this.hideMe = true;

  this.initGridPoints = function () {
    this.clearGridPoints();

    // Create gridpoints for both positive and negative box size
    let x;
    let y;
    let width = (this.width < 0) ? this.width * -1 : this.width;
    let height = (this.height < 0) ? this.height * -1 : this.height;

    for (let w = 0; w < width; w++) {
      for (let h = 0; h < height; h++) {
        x = (this.width < 0) ? (w * -1) - 1 : w;
        y = (this.height < 0) ? (h * -1) - 1 : h;

        const point = {
          x: Math.floor(this.x + x),
          y: Math.floor(this.y + y)
        };

        this.addGridPoint(point.x, point.y);
      }
    }
  }

  this.clearGridPoints = function () {
    this.gridPoints = {};
  }

  this.addGridPoint = function (x, y) {
    const key = helpers.positionToKey(x, y);
    this.gridPoints[key] = 'SelectionBox';
  }

  this.addGridPointsByMovement = function (event) {
    const movementPxX = Math.abs(event.movementX) / this.viewport.pixelSize;
    const movementPxY = Math.abs(event.movementY) / this.viewport.pixelSize;
    let x = this.wp.x;
    let y = this.wp.y;

    // for (let ix = 0; ix < movementPxX; ix++) {
    //   for (let iy = 0; iy < movementPxY; iy++) { 
    //     x = (event.movementX < 0) ? this.wp.x + ix : this.wp.x - ix;
    //     y = (event.movementY < 0) ? this.wp.y + iy : this.wp.y - iy; 
    //     this.addGridPoint(x, y);
    //   }
    // }

    for (let ix = 0; ix < movementPxX; ix++) {
      this.addGridPoint(x, y);
      x = (event.movementX < 0) ? x + 1 : x - 1;
    }
    for (let iy = 0; iy < movementPxY; iy++) {
      this.addGridPoint(x, y);
      y = (event.movementY < 0) ? y + 1 : y - 1;
    }
  }

  this.setWidth = function (width) {
    this.width = width;
    this.initGridPoints();
  }

  this.setHeight = function (height) {
    this.height = height;
    this.initGridPoints();
  }

  this.draw = function () {
    if (true) {
      this.viewport.DrawRectangle(this.x, this.y, this.width, this.height, this.color);
    }
  }

  /////////////////////////////////////////////////////

  this.mouseDown = function (event) {
    this.setWidth(0);
    this.setHeight(0);
    this.x = this.wp.x;
    this.y = this.wp.y;

    if (!(event.ctrlKey || event.altKey || event.buttons == 2)) {
      // Reset selected blocks
      selector.resetBlocks();
    }
  }

  this.mouseUp = function (event) {
    // this.hideMe = true;
    this.setWidth(0);
    this.setHeight(0);
  }

  this.mouseMove = function (event) {
    this.wp = this.viewport.CanvasToWorldPosition(event.x, event.y);

    const select = (
      event.buttons == 1 && !event.altKey
    );

    const deselect = (
      event.buttons == 2 ||
      event.buttons == 1 && event.altKey
    );

    if (select || deselect) {
      // Left or right button down
      this.setWidth(this.viewport.CanvasXToWorld(event.x) - this.x);
      this.setHeight(this.viewport.CanvasYToWorld(event.y) - this.y);

      if (select) {   // Left button down
        selector.addBlocksByGridPoints(this.gridPoints, this.viewport)
      }
      if (deselect) {   // Right button down
        selector.removeBlocksByGridPoints(this.gridPoints, this.viewport);
      }
    }
    else if (event.ctrlKey || event.altKey) {
      this.x = this.wp.x;
      this.y = this.wp.y;

      this.addGridPointsByMovement(event);

      if (event.ctrlKey) {
        selector.addBlocksByGridPoints(this.gridPoints, this.viewport)
      } else if (event.altKey) {
        selector.removeBlocksByGridPoints(this.gridPoints, this.viewport);
      }
    }
  }

  this.keyDown = function (event) {
    if (event.ctrlKey || event.altKey) {
      const hoveredBlock = helpers.getBlockByPosition(this.wp.x, this.wp.y, this.viewport);
      if (event.ctrlKey) {
        // Add hovered block
        selector.addBlock(hoveredBlock);
      }
      else if (event.altKey) {
        event.preventDefault();
        // Remove hovered block
        selector.removeBlock(hoveredBlock);
      }
    }
  }

  this.keyUp = function (event) {
    this.clearGridPoints();
  }
}

export {
  Builder,
  Mover,
  BoxSelection
}