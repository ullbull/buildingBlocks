import * as helpers from "./helpers.js";
import * as blockModule from "./block.js";
import * as dataKeeper from "./dataKeeper.js";
import * as position from "./positionTranslator.js";
import { appStatus } from "./appStatus.js";
import * as layers from "./layers.js";
import * as sectionTools from "./sectionTools.js";
import * as connection from "./connectionToServer.js";

export class Viewport {
  constructor(width, height, pixelSize, context) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.pixelSize = pixelSize;
    this.layers = { background: context };
    this.storedSectionNames = this.GetSectionNames();
  }

  /**
   * Returns new and lost section names since last check.
   * @returns {{newSectionNames, lostSectionNames}}
   */
  GetSectionDiff() {
    const sectionNames = this.GetSectionNames()
    const newSectionNames = helpers.getDifferentData(this.storedSectionNames, sectionNames, "new");
    const lostSectionNames = helpers.getDifferentData(this.storedSectionNames, sectionNames, "lost");
    this.storedSectionNames = sectionNames;
    return {newSectionNames, lostSectionNames};
  }

  /**
   * Returns the section names this viewport is covering
   * @returns {string[]}
   */
  GetSectionNames() {
    return sectionTools.getSectionNames(
      this.x,
      this.y,
      this.GetWorldWidth(),
      this.GetWorldHeight()
    );
  }

  // Subscribes to sections only if viewport is covering new sections
  AutoSubscribe() {
    const names = this.GetSectionDiff();

    if (names.newSectionNames[0]) {
      connection.sendData("subscribe", names.newSectionNames);
    }
    if (names.lostSectionNames[0]) {
      connection.sendData("unsubscribe", names.lostSectionNames);
      dataKeeper.flushData(names.lostSectionNames);
    }
    if (
      names.newSectionNames[0] ||
      names.lostSectionNames[0]) {
        console.log(`You are currently in room ${this.storedSectionNames}`)
      }
  }

  SetSize(width, height) {
    this.width = width;
    this.height = height;
    this.AutoSubscribe();
  }

  GetWorldWidth() {
    return this.width / this.pixelSize;
  }

  GetWorldHeight() {
    return this.height / this.pixelSize;
  }

  AddLayer(layerName, context) {
    if (this.layers.hasOwnProperty(layerName)) {
      console.error(`The layer "${layerName}" already exists!`);
    } else {
      this.layers[layerName] = context;
    }
  }

  DrawGrid(options = {}) {
    let context = this.layers.background;
    if (options.hasOwnProperty("context")) {
      context = options.context;
    }

    // Don't draw grid if pixelSize is too small
    if (this.pixelSize < 5) return;

    context.lineWidth = 1;
    context.strokeStyle = "rgba(0,0,0," + this.pixelSize / 150 + ")";
    context.beginPath();
    let x;
    let y;

    // Draw rows
    for (let row = 0; row < this.height; row += this.pixelSize) {
      x = 0;
      y = -((this.y * this.pixelSize) % this.pixelSize) + row;
      context.moveTo(x, y);

      x = this.width;
      context.lineTo(x, y);
    }

    // Draw columns
    for (let column = 0; column < this.width; column += this.pixelSize) {
      x = -((this.x * this.pixelSize) % this.pixelSize) + column;
      y = 0;
      context.moveTo(x, y);

      y = this.height;
      context.lineTo(x, y);
    }
    context.stroke();
  }

  /**
   * 
   * @param {*} x 
   * @param {*} y 
   * @param {*} width 
   * @param {*} height 
   * @param {} color 
   * @param {{context, alphaValue:float, stroke}} options 
   */
  DrawRectangle(x, y, width, height, color, options = {}) {
    let context = this.layers.background;
    if (options.hasOwnProperty("context")) {
      context = options.context;
    }

    if (options.hasOwnProperty("alphaValue")) {
      color = helpers.getAlphaColor(color, options.alphaValue);
    }

    context.fillStyle = color;
    x = position.worldXToViewport(x, this);
    y = position.worldYToViewport(y, this);
    width = position.toValueViewport(width, this);
    height = position.toValueViewport(height, this);

    context.fillRect(x, y, width, height);

    if (options.hasOwnProperty("stroke")) {
      context.lineWidth = options.stroke;
      context.strokeRect(x, y, width, height);
    }
  }

  /**
   * 
   * @param {*} pixel 
   * @param {{size, context, alphaValue:float, stroke}} options 
   */
  DrawPixel(pixel, options = {}) {
    let context = this.layers.background;
    let size = 1;

    if (options.hasOwnProperty("size")) {
      size = options.size;
    }

    // Draw Pixel
    this.DrawRectangle(pixel.x, pixel.y, size, size, pixel.color, options);
  }

  DrawText(
    text,
    x,
    y,
    size = 18,
    color = "black",
    font = "Arial",
    options = {}
  ) {
    let context = this.layers.background;
    if ("context" in options) {
      context = options.context;
    }

    context.font = "" + size + "px " + font;
    context.fillStyle = color;
    x = position.worldXToViewport(x, this);
    y = position.worldYToViewport(y, this);
    context.fillText(text, x, y);
  }

  StrokePixel(pixel, lineWidth, color, options) {
    let context = this.layers.background;
    if (options.hasOwnProperty("context")) {
      context = options.context;
    }

    let x = position.worldXToViewport(pixel.x, this);
    let y = position.worldYToViewport(pixel.y, this);
    let pixelSize = 1;
    pixelSize = position.toValueViewport(pixelSize, this);

    context.lineWidth = position.toValueViewport(lineWidth, this);
    context.strokeStyle = color;
    context.beginPath();

    pixel.clearEdges.forEach((edge) => {
      let xStart;
      let yStart;
      let xEnd;
      let yEnd;

      switch (edge) {
        case "top":
          xStart = x;
          yStart = y;
          xEnd = xStart + pixelSize;
          yEnd = yStart;

          context.moveTo(xStart, yStart);
          context.lineTo(xEnd, yEnd);
          break;
        case "bottom":
          xStart = x;
          yStart = y + pixelSize;
          xEnd = xStart + pixelSize;
          yEnd = yStart;

          context.moveTo(xStart, yStart);
          context.lineTo(xEnd, yEnd);
          break;
        case "left":
          xStart = x;
          yStart = y;
          xEnd = xStart;
          yEnd = yStart + pixelSize;

          context.moveTo(xStart, yStart);
          context.lineTo(xEnd, yEnd);
          break;
        case "right":
          xStart = x + pixelSize;
          yStart = y;
          xEnd = xStart;
          yEnd = yStart + pixelSize;

          context.moveTo(xStart, yStart);
          context.lineTo(xEnd, yEnd);
          break;
        default:
          console.log("Invalid value for edge: ", edge);
          return;
      }
    });

    // Stroke edges
    context.stroke();
  }

  /**
   * 
   * @param {*} block 
   * @param {{color:string, hiddenBlockIDs:string[], offsetPosition, name:string, size, context, alphaValue:float, stroke}} options 
   * @returns 
   */
  DrawBlock(block, options = {}) {
    if (!block) {
      console.error("block is not defined");
      return;
    }

    if (block.hasOwnProperty("pixels")) {
      for (const key in block.pixels) {
        if (block.pixels.hasOwnProperty(key)) {
          const pixel = helpers.copyObject(block.pixels[key]);

          if (options.hasOwnProperty("color")) {
            pixel.color = options.color;
          }

          if (options.hasOwnProperty("hiddenBlockIDs")) {
            if (options.hiddenBlockIDs.includes(block.id)) {
              options.alphaValue = 0;
              options.name = "hidden";
            }
          }

          // Set pixel relative to block
          const position = blockModule.getGridPixel(block, key);
          pixel.x = position.x;
          pixel.y = position.y;

          if (options.hasOwnProperty("offsetPosition")) {
            pixel.x += options.offsetPosition.x;
            pixel.y += options.offsetPosition.y;
          }

          this.DrawPixel(pixel, options);
          this.StrokePixel(pixel, 0.2, "rgba(50,50,70,1)", options);
        }
      }

      if (options.hasOwnProperty("name")) {
        this.DrawText(
          options.name,
          block.x + 0.2,
          block.y + 0.9,
          18,
          "black",
          "Arial",
          options
        );
      }

      ///////DEBUGGING CODE/////////////
      if (appStatus.debug) {
        this.DrawText(block.id, block.x, block.y - 0.3);
        this.DrawRectangle(block.x, block.y, 1, 1, "pink");
      }
    }
  }

  /**
   * @param {{}} blocks
   * @param {{color:string, hiddenBlockIDs:string[], offsetPosition, name:string, size, context, alphaValue:float, stroke}} options 
   */
  DrawBlocks(blocks, options = {}) {
    for (const key in blocks) {
      if (blocks.hasOwnProperty(key)) {
        const block = blocks[key];
        this.DrawBlock(block, options);
      }
    }
  }

  DrawWorkers(workers, options = {}) {
    for (const key in workers) {
      if (workers.hasOwnProperty(key)) {
        const worker = workers[key];
        options.name = worker.name;
        this.DrawBlock(worker, options);
      }
    }
  }

  // DrawWorkers(workers, excluded, options = {}) {
  //   for (const key in workers) {
  //     if (workers.hasOwnProperty(key)) {
  //       const worker = workers[key];
  //       if (worker.id != excluded.id) {
  //         options.name = worker.name;
  //         this.DrawBlock(worker, options);
  //       }
  //     }
  //   }
  // }

  /**
   * @param {{color:string, hiddenBlockIDs:string[], offsetPosition, name:string, size, context, alphaValue:float, stroke}} options 
   */
  DrawAllBlocks(options) {
    const blockData = dataKeeper.getBlockData();
    const blocks = blockData.blocks;
    this.DrawBlocks(blocks, options);
  }

  DrawGridpixel(gridPoint, options = {}) {
    if (!options.hasOwnProperty("color")) {
      options.color = "blue";
    }
    if (!options.hasOwnProperty("size")) {
      options.size = 0.25;
    }

    const position = gridPoint.split(",");
    const pixel = blockModule.createPixel(
      position[0],
      position[1],
      options.color
    );
    this.DrawPixel(pixel, options);
  }

  DrawGridpixels(gridpixels, options = {}) {
    for (const key in gridpixels) {
      if (gridpixels.hasOwnProperty(key)) {
        const gridPoint = gridpixels[key];
        this.DrawGridpixel(key, options);
      }
    }
  }

  DrawAllGridpixels(options = {}) {
    const blockData = dataKeeper.getBlockData();
    for (const key in blockData) {
      if (blockData.hasOwnProperty(key)) {
        const section = blockData[key];
        this.DrawGridpixels(section.gridpixels, options);
      }
    }
  }

  SetPosition(x, y) {
    this.x = x;
    this.y = y;
    layers.background.refresh();
    this.AutoSubscribe();
  }

  SetPositionAtAnchorPoint(anchorPoint, position) {
    this.SetPosition(
      this.x + anchorPoint.x - position.x,
      this.y + anchorPoint.y - position.y
    );
  }

  // SetXAtAnchorPoint(xAnchorPoint, x) {
  //   this.x += xAnchorPoint - x;
  // }

  // SetYAtAnchorPoint(yAnchorPoint, y) {
  //   this.y += yAnchorPoint - y;
  // }

  // SetCenterX(x) {
  //   this.x = x - this.width / 2;
  // }

  // SetCenterY(y) {
  //   this.y = y - this.height / 2;
  // }

  // SetCenterPosition(x, y) {
  //   this.SetCenterX(x);
  //   this.SetCenterY(y);
  // }
}
