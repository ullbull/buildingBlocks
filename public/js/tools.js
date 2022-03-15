import * as helpers from "./helpers.js";
import * as selector from "./selector.js";
import * as blockModule from "./block.js";
import * as blockHider from "./blockHider.js";
import * as position from "./positionTranslator.js";
import * as mouse from "./mouse.js";
import * as layers from "./layers.js";
import { appStatus } from "./appStatus.js";
import * as connection from "./connectionToServer.js";
import * as dataKeeper from "./dataKeeper.js";

function Builder() {
  this.id = helpers.generateID();
  this.x = 0;
  this.y = 0;
  this.eventPosition = { x: 0, y: 0 }; // position from last event
  this.initialBlock = blockModule.createBlock(0, 0, 4, 2);
  this.blocks = [this.initialBlock];

  this.drawMe = true;
  this.drawPreviousSelectedBlocks = false;
  this.drawHoveredBlocks = false;

  this.hoveredBlock = null;
  this.hoveredBlocks = [null];
  this.clickedBlock = null;

  this.setEventPosition = function (event) {
    this.eventPosition.x = event.x;
    this.eventPosition.y = event.y;
  };

  this.isInsideFrame = function () {
    return helpers.isInsideFrame(
      this.eventPosition.x,
      this.eventPosition.y,
      window.innerWidth,
      window.innerHeight,
      20
    );
  };

  this.isBlocksInsideFrame = function () {
    const gridpixels = blockModule.getGridpixelsFromBlocks(this.blocks);
    const viewport = mouse.getViewport();
    const width = viewport.GetWorldWidth();
    const height = viewport.GetWorldHeight();
    
    for (const key in gridpixels) {
      if (Object.hasOwnProperty.call(gridpixels, key)) {
        const gridpixel = gridpixels[key];
        if (
          // Note: Must add viewport position to the frame
          // Must subtract 1 grid square from width and height
          // because gridpixels position is in upper left corner.
          helpers.isInsideFrame(
            gridpixel.x - viewport.x,
            gridpixel.y - viewport.y,
            width - 1,
            height - 1,
          ) == false
        ) {
          return false;
        }
      }
    }
    return true;
  };

  this.draw = function (options = {}) {
    //TODO: figure out how to draw the blocks at different states  
    const orig_options = helpers.copyObject(options)

    if (this.drawMe) {      
      if (this.clickedBlock) {
        if (!this.isInsideFrame()) {
          // Draw nothing
          this.drawPreviousSelectedBlocks = false;
        }
        else if (!this.isBlocksInsideFrame()) {
          // Draw blocks
          options.alphaValue = 0.5;
          this._drawMe(options);

          // Draw previous blocks
          options.alphaValue = 1;
          this._drawPreviousSelectedBlocks(options);
          
          this.drawPreviousSelectedBlocks = false;
        } else {
          this._drawMe(options);
        }
      } else {
        this._drawMe(options);
      }
    }

    this.drawHoveredBlocks =
      this.hoveredBlocks[0] &&
      !this.drawPreviousSelectedBlocks &&
      !this.clickedBlock;
    this.drawMe = !this.drawHoveredBlocks;

    if (this.drawPreviousSelectedBlocks) {
      this._drawPreviousSelectedBlocks(options);
    }
    if (this.drawHoveredBlocks) {
      this._drawHoveredBlocks(options);
    }
  };

  this._drawMe = function (options) {
    options.name = "me"
    mouse.viewport.DrawBlocks(this.blocks, options);
  }

  this._drawHoveredBlocks = function (options) {
    options.name = "hovered"
    options.color = "rgba(130,30,60,0.5)";
    mouse.viewport.DrawBlocks(this.hoveredBlocks, options);
  }
  
  this._drawSelectedBlocks = function (options) {
  }

  this._drawPreviousSelectedBlocks = function (options) {
    options.name = "prev.sel."
    options.color = "rgba(100,30,60,0.5)";
    mouse.viewport.DrawBlocks(selector.getBlocksArray(
      selector.keyPreviousSelected), options);
  }
  

  this.build = function (method = "build") {
    // 'build' adds a block with new id

    // 'move' deletes the block first,
    // then adds a block with same id

    // Should restructure this function

    const blocksCopy = helpers.copyObject(this.blocks);

    if (method == "build") {
      // Get new id for each block
      blocksCopy.forEach((block) => {
        block.id = helpers.generateID();
      });
    }

    // select the blocks as idle blocks
    selector.resetBlocks(selector.keyPreviousSelected);
    selector.addBlocksArray(blocksCopy, selector.keyPreviousSelected);

    // Send blocks to server
    if (method == "build") {
      connection.sendData("buildBlocks", blocksCopy);
    } else if (method == "move") {
      connection.sendData("moveBlocks", blocksCopy);
    }
    // Reset hidden blocks
    blockHider.resetHiddenBlocks();
  };

  this.setPosition = function (x, y) {
    // Get move distance
    const xd = x - this.x;
    const yd = y - this.y;

    this.x = x;
    this.y = y;

    this.blocks.forEach((block) => {
      blockModule.setBlockPosition(block, block.x + xd, block.y + yd);
    });
  };

  this.refreshHoveredBlocks = function () {
    // this.hoveredBlock = helpers.getBlockByPosition(
    //   mouse.wp.x, mouse.wp.y, mouse.viewport);
    this.hoveredBlock = dataKeeper.getBlockAtPosition({
      x: mouse.wp.x,
      y: mouse.wp.y,
    });

    this.hoveredBlocks = [this.hoveredBlock];
    if (this.hoveredBlock) {
      if (selector.selectedBlocks[this.hoveredBlock.id]) {
        // Hovering selected blocks
        this.hoveredBlocks = selector.getBlocksArray("selected");
      } else if (selector.lastSelectedBlocks[this.hoveredBlock.id]) {
        // Hovering idle blocks
        this.hoveredBlocks = selector.getBlocksArray(
          selector.keyPreviousSelected
        );
      }
    }
  };

  this.mouseDown = function (event) {
    if (event.button == 0) {
      // Left button down

      // Set clicked block
      // this.clickedBlock = helpers.getBlockByPosition(
      //   this.x, this.y, mouse.viewport);
      this.clickedBlock = dataKeeper.getBlockAtPosition({
        x: this.x,
        y: this.y,
      });

      // Check if any block was clicked
      if (this.clickedBlock) {
        layers.background.refresh();
        // Apply hovered blocks to this.blocks
        // and hide them from viewPort
        this.blocks = helpers.copyObject(this.hoveredBlocks);

        try {
          // blockHider.addHiddenBlocks(this.blocks);
          blockHider.hideBlocks(this.blocks);
        } catch (error) {
          console.error(error);
        }

        // this.drawMe = false;
      }
    }
  };

  this.mouseUp = function (event) {
    // Don't know if this is necessary
    this.setEventPosition(event);
    this.setPosition(mouse.wp.x, mouse.wp.y);

    if (event.button == 0) {
      // Left button up
      layers.background.refresh();

      if (this.isInsideFrame()) {
        // Determine build method
        let method = "build";
        if (this.clickedBlock) {
          method = "move";
        }

        // Build
        this.build(method);
      } else {
        // Blocks was dropped outside frame.

        // Delete blocks
        connection.deleteBlocks(blockHider.resetHiddenBlocks());

        // Reset idle blocks
        selector.resetBlocks(selector.keyPreviousSelected);

        // Change blocks to initial block
        blockModule.setBlockPosition(this.initialBlock, mouse.wp.x, mouse.wp.y);
        this.blocks = [this.initialBlock];
      }

      this.clickedBlock = null;
    }
  };

  this.mouseMove = function (event) {
    // Set position
    this.setEventPosition(event);
    this.setPosition(mouse.wp.x, mouse.wp.y);

    if (!this.isBlocksInsideFrame()) {
      console.log("Outside");
    }

    this.refreshHoveredBlocks();

    const hideMe =
      this.hoveredBlock &&
      !blockHider.getHiddenBlockIDs().includes(this.hoveredBlock.id) &&
      !this.clickedBlock;
    this.drawMe != hideMe;
  };

  this.keyDown = function (event) {
    if (event.altKey) {
      if (this.hoveredBlock) this.drawPreviousSelectedBlocks = true;
    }
  };

  this.keyUp = function (event) {
    this.drawPreviousSelectedBlocks = false;

    if (event.key == "Delete") {
      // Delete hovered blocks if any blocks are hovered
      if (this.hoveredBlocks[0]) {
        let hoveredSelected =
          selector.getBlocks("selected")[this.hoveredBlock.id];
        connection.deleteBlocksA(this.hoveredBlocks);

        // Reset hovered blocks
        this.hoveredBlocks = [];

        if (hoveredSelected) {
          // Reset selected blocks
          selector.resetBlocks("selected");

          // Change blocks to initial block
          blockModule.setBlockPosition(
            this.initialBlock,
            mouse.wp.x,
            mouse.wp.y
          );
          this.blocks = [this.initialBlock];
        }
      }
      // Delete selected blocks if no block is hovered
      else if (!helpers.isObjectEmpty(selector.selectedBlocks)) {
        connection.deleteBlocks(selector.resetBlocks("selected"));

        // Change blocks to initial block
        blockModule.setBlockPosition(this.initialBlock, mouse.wp.x, mouse.wp.y);
        this.blocks = [this.initialBlock];
      }
    }
  };
}

function Mover() {
  this.draw = function () {};

  this.mouseDown = function (event) {};

  this.mouseUp = function (event) {};

  this.mouseMove = function (event) {
    if (event.buttons == 4) {
      // Middle button down
      mouse
        .getViewport()
        .SetPosition(
          mouse.getViewport().x -
            event.movementX / mouse.getViewport().pixelSize,
          mouse.getViewport().y -
            event.movementY / mouse.getViewport().pixelSize
        );
    }
  };

  this.keyDown = function (event) {};

  this.keyUp = function (event) {};
}

function BoxSelection() {
  this.x = 0;
  this.y = 0;
  this.width = 0;
  this.height = 0;
  this.color = "rgba(200,200,255,0.1)";
  this.strokeWidth = 1;
  this.gridpixels = {};

  this.initGridpixels = function () {
    this.clearGridpixels();

    // Create gridpixels for both positive and negative box size
    let x;
    let y;
    let width = this.width < 0 ? this.width * -1 : this.width;
    let height = this.height < 0 ? this.height * -1 : this.height;

    for (let w = 0; w < width; w++) {
      for (let h = 0; h < height; h++) {
        x = this.width < 0 ? w * -1 - 1 : w;
        y = this.height < 0 ? h * -1 - 1 : h;

        const point = {
          x: Math.floor(this.x + x),
          y: Math.floor(this.y + y),
        };

        this.addGridPixel(point.x, point.y);
      }
    }
  };

  this.clearGridpixels = function () {
    this.gridpixels = {};
  };

  this.addGridPixel = function (x, y) {
    const key = helpers.positionToKey(x, y);
    this.gridpixels[key] = "SelectionBox";
  };

  this.addGridpixelsByMovement = function (event) {
    const movementPxX = Math.abs(event.movementX) / mouse.viewport.pixelSize;
    const movementPxY = Math.abs(event.movementY) / mouse.viewport.pixelSize;
    let x = mouse.wp.x;
    let y = mouse.wp.y;

    // for (let ix = 0; ix < movementPxX; ix++) {
    //   for (let iy = 0; iy < movementPxY; iy++) {
    //     x = (event.movementX < 0) ? this.wp.x + ix : this.wp.x - ix;
    //     y = (event.movementY < 0) ? this.wp.y + iy : this.wp.y - iy;
    //     this.addGridPixel(x, y);
    //   }
    // }

    for (let ix = 0; ix < movementPxX; ix++) {
      this.addGridPixel(x, y);
      x = event.movementX < 0 ? x + 1 : x - 1;
    }
    for (let iy = 0; iy < movementPxY; iy++) {
      this.addGridPixel(x, y);
      y = event.movementY < 0 ? y + 1 : y - 1;
    }
  };

  this.setWidth = function (width) {
    this.width = width;
    this.initGridpixels();
  };

  this.setHeight = function (height) {
    this.height = height;
    this.initGridpixels();
  };

  this.draw = function (options = {}) {
    options.stroke = this.strokeWidth;
    mouse.viewport.DrawRectangle(
      this.x,
      this.y,
      this.width,
      this.height,
      this.color,
      options
    );

    if (appStatus.debug) {
      mouse.viewport.Drawgridpixels(this.gridpixels, { color: "red" });
    }
  };

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
  };

  this.mouseUp = function (event) {
    // this.drawMe = false;
    this.setWidth(0);
    this.setHeight(0);
  };

  this.mouseMove = function (event) {
    const select = event.buttons == 1 && !event.altKey;

    const deselect = event.buttons == 2 || (event.buttons == 1 && event.altKey);

    if (select || deselect) {
      // Left or right button down
      this.setWidth(mouse.wp.x - this.x);
      this.setHeight(mouse.wp.y - this.y);

      if (select) {
        // Left button down
        selector.addBlocksByGridpixels(this.gridpixels, mouse.viewport);
      }
      if (deselect) {
        // Right button down
        selector.removeBlocksByGridpixels(
          this.gridpixels,
          mouse.viewport,
          "selected"
        );
        // selector.removeBlocksByGridpixels(this.gridpixels, mouse.viewport, 'idle');
      }
    } else if (event.ctrlKey || event.altKey) {
      this.x = mouse.wp.x;
      this.y = mouse.wp.y;

      this.addGridpixelsByMovement(event);

      if (event.ctrlKey) {
        selector.addBlocksByGridpixels(this.gridpixels, mouse.viewport);
      } else if (event.altKey) {
        selector.removeBlocksByGridpixels(
          this.gridpixels,
          mouse.viewport,
          "selected"
        );
        selector.removeBlocksByGridpixels(
          this.gridpixels,
          mouse.viewport,
          selector.keyPreviousSelected
        );
      }
    }
  };

  this.keyDown = function (event) {
    if (event.ctrlKey || event.altKey) {
      // const hoveredBlock = helpers.getBlockByPosition(
      //   mouse.wp.x, mouse.wp.y, mouse.viewport
      // );
      const hoveredBlock = dataKeeper.getBlockAtPosition({
        x: mouse.wp.x,
        y: mouse.wp.y,
      });

      if (event.ctrlKey) {
        // Add hovered block
        selector.addBlock(hoveredBlock);
      } else if (event.altKey) {
        event.preventDefault();
        // Remove hovered block
        selector.removeBlock(hoveredBlock);
      }
    }
  };

  this.keyUp = function (event) {
    this.clearGridpixels();
  };
}

export { Builder, Mover, BoxSelection };
