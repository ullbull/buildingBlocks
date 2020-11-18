import * as helpers from './helpers.js';
import * as selector from './selector.js';
import * as blockModule from './block.js';
import * as dataKeeper from './dataKeeper.js';
import * as api from './api.js';
import * as blockHider from './blockHider.js';
import * as position from './positionTranslator.js';
import * as mouse from './mouse.js';
import * as linkKeeper from './linkKeeper.js';


function Builder() {
  this.block = blockModule.createBlock(0, 0, 4, 2);
  this.block2 = blockModule.createBlock(5, 5, 4, 2, 'blue');
  this.blocks = {};
  this.blocks[this.block.id] = this.block;
  this.blocks[this.block2.id] = this.block2;
  dataKeeper.addBlock(this.block);
  dataKeeper.addBlock(this.block2);
  linkKeeper.addLinkO(this.block, this.block2);
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
      mouse.viewPort.DrawBlock(this.block, { alphaValue });
    } else {
      mouse.viewPort.DrawBlock(this.hoveredBlock, { color: 'rgba(130,30,60,0.5' });
    }
  }

  this.build = function (method = 'build') {
    // // Add block
    // dataKeeper.addBlock(this.block);
    // // Add children
    // dataKeeper.addBlocks(linkKeeper.getChildren(this.block));
    // Add blocks

    const block = helpers.copyObject(this.block);

    if (method == 'build') {
      block.id = helpers.generateID()
    }

    dataKeeper.addBlock(block);

    // Send blocks to server
    api.sendData('/api', block);

    // Delete hidden blocks
    dataKeeper.deleteBlocksGlobally(blockHider.resetHiddenBlockIDs());

    // // Get new blockID
    // this.block.id = helpers.generateID();
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
      this.clickedBlock = helpers.getBlockByPosition(this.block.x, this.block.y, mouse.viewPort);

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
        dataKeeper.deleteBlocksGlobally(blockHider.resetHiddenBlockIDs());
      }
    }
  }

  this.mouseMove = function (event) {
    const worldPosition = position.canvasToWorldPosition(event.x, event.y, mouse.viewPort)
    blockModule.setBlockPosition(this.block, worldPosition);

    this.hoveredBlock = helpers.getBlockByPosition(worldPosition.x, worldPosition.y, mouse.viewPort);
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

function Mover() {
  this.draw = function () {
  }

  this.mouseDown = function (event) {
  }

  this.mouseUp = function (event) {
  }

  this.mouseMove = function (event) {
    if (event.buttons == 4) {
      // Middle button down
      mouse.getViewPort().x -= event.movementX / mouse.getViewPort().pixelSize;
      mouse.getViewPort().y -= event.movementY / mouse.getViewPort().pixelSize;
    }
  }

  this.keyDown = function (event) {
  }

  this.keyUp = function (event) {
  }
}

function BoxSelection() {
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
    const movementPxX = Math.abs(event.movementX) / mouse.viewPort.pixelSize;
    const movementPxY = Math.abs(event.movementY) / mouse.viewPort.pixelSize;
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
      mouse.viewPort.DrawRectangle(
        this.x, this.y, this.width, this.height, this.color
      );
    }
  }

  /////////////////////////////////////////////////////

  this.mouseDown = function (event) {
    if (mouse.leftButton || mouse.rightButton) {
      this.setWidth(0);
      this.setHeight(0);
      this.x = mouse.wp.x;
      this.y = mouse.wp.y;

      if (!(event.ctrlKey || event.altKey || mouse.rightButton)) {
        // Reset selected blocks
        selector.resetBlocks();
      }
    }
  }

  this.mouseUp = function (event) {
    // this.hideMe = true;
    this.setWidth(0);
    this.setHeight(0);
  }

  this.mouseMove = function (event) {

    const select = (
      event.buttons == 1 && !event.altKey
    );

    const deselect = (
      event.buttons == 2 ||
      event.buttons == 1 && event.altKey
    );

    if (select || deselect) {
      // Left or right button down
      this.setWidth(mouse.wp.x - this.x);
      this.setHeight(mouse.wp.y - this.y);

      if (select) {   // Left button down
        selector.addBlocksByGridPoints(this.gridPoints, mouse.viewPort)
      }
      if (deselect) {   // Right button down
        selector.removeBlocksByGridPoints(this.gridPoints, mouse.viewPort);
      }
    }
    else if (event.ctrlKey || event.altKey) {
      this.x = mouse.wp.x;
      this.y = mouse.wp.y;

      this.addGridPointsByMovement(event);

      if (event.ctrlKey) {
        selector.addBlocksByGridPoints(this.gridPoints, mouse.viewPort)
      } else if (event.altKey) {
        selector.removeBlocksByGridPoints(this.gridPoints, mouse.viewPort);
      }
    }
  }

  this.keyDown = function (event) {
    if (event.ctrlKey || event.altKey) {
      const hoveredBlock = helpers.getBlockByPosition(
        mouse.wp.x, mouse.wp.y, mouse.viewPort
      );

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