import * as helpers from './helpers.js';
import * as blockModule from './block.js';
import * as dataKeeper from './dataKeeper.js';
import * as position from './positionTranslator.js';
import { appStatus } from './appStatus.js'
import * as layers from './layers.js';

export class Viewport {
  constructor(width, height, pixelSize, context) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.pixelSize = pixelSize;
    this.layers = { 'background': context };
    // this.anchorPoint = { x: 0, y: 0 };
    // this.pixels = {};
  }

  getWorldWidth() {
    return this.width / this.pixelSize;
  }

  getWorldHeight() {
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
    let context = this.layers.background
    if (options.hasOwnProperty('context')) {
      context = options.context;
    }

    // Don't draw grid if pixelSize is too small
    if (this.pixelSize < 5) return;

    context.lineWidth = 1;
    context.strokeStyle = 'rgba(0,0,0,' + (this.pixelSize / 150) + ')';
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

  DrawRectangle(x, y, width, height, color, options = {}) {
    let context = this.layers.background;
    if (options.hasOwnProperty('context')) {
      context = options.context;
    }

    if (options.hasOwnProperty('alphaValue')) {
      color = helpers.getAlphaColor(color, options.alphaValue);
    }

    context.fillStyle = color;
    x = position.worldXToViewport(x, this);
    y = position.worldYToViewport(y, this);
    width = position.toValueViewport(width, this);
    height = position.toValueViewport(height, this);

    context.fillRect(x, y, width, height);

    if (options.hasOwnProperty('stroke')) {
      context.lineWidth = options.stroke;
      context.strokeRect(x, y, width, height);
    }
  }

  DrawPixel(pixel, options = {}) {
    let context = this.layers.background;
    let size = 1;

    if (options.hasOwnProperty('size')) {
      size = options.size;
    }

    // Draw Pixel
    this.DrawRectangle(pixel.x, pixel.y, size, size, pixel.color, options);
  }

  DrawText(text, x, y, size = 18, color = 'black', font = 'Arial', options = {}) {
    let context = this.layers.background;
    if ('context' in options) {
      context = options.context;
    }

    context.font = '' + size + 'px ' + font;
    context.fillStyle = color;
    x = position.worldXToViewport(x, this);
    y = position.worldYToViewport(y, this);
    context.fillText(text, x, y);
  }

  StrokePixel(pixel, lineWidth, color, options) {
    let context = this.layers.background;
    if (options.hasOwnProperty('context')) {
      context = options.context;
    }

    let x = position.worldXToViewport(pixel.x, this);
    let y = position.worldYToViewport(pixel.y, this);
    let pixelSize = 1;
    pixelSize = position.toValueViewport(pixelSize, this);

    context.lineWidth = position.toValueViewport(lineWidth, this);
    context.strokeStyle = color;
    context.beginPath();

    pixel.clearEdges.forEach(edge => {
      let xStart;
      let yStart;
      let xEnd;
      let yEnd;

      switch (edge) {
        case 'top':
          xStart = x;
          yStart = y;
          xEnd = xStart + pixelSize;
          yEnd = yStart;

          context.moveTo(xStart, yStart);
          context.lineTo(xEnd, yEnd);
          break;
        case 'bottom':
          xStart = x;
          yStart = y + pixelSize;
          xEnd = xStart + pixelSize;
          yEnd = yStart;

          context.moveTo(xStart, yStart);
          context.lineTo(xEnd, yEnd);
          break;
        case 'left':
          xStart = x;
          yStart = y;
          xEnd = xStart;
          yEnd = yStart + pixelSize;

          context.moveTo(xStart, yStart);
          context.lineTo(xEnd, yEnd);
          break;
        case 'right':
          xStart = x + pixelSize;
          yStart = y;
          xEnd = xStart;
          yEnd = yStart + pixelSize;

          context.moveTo(xStart, yStart);
          context.lineTo(xEnd, yEnd);
          break;
        default:
          console.log('Invalid value for edge: ', edge);
          return;
      }

    });

    // Stroke edges
    context.stroke();
  }

  DrawBlock(block, options = {}) {
    if (block.hasOwnProperty('pixels')) {
      for (const key in block.pixels) {
        if (block.pixels.hasOwnProperty(key)) {
          const pixel = helpers.copyObject(block.pixels[key]);

          if (typeof options.color != 'undefined') {
            pixel.color = options.color;
          }

          // Set pixel relative to block
          const position = blockModule.getGridPosition(block, key);
          pixel.x = position.x;
          pixel.y = position.y;

          if (options.hasOwnProperty('offsetPosition')) {
            pixel.x += options.offsetPosition.x;
            pixel.y += options.offsetPosition.y;
          }

          this.DrawPixel(pixel, options);
          this.StrokePixel(pixel, 0.2, 'rgba(50,50,70,1)', options);
        }
      }

      if (options.hasOwnProperty('name')) {
        this.DrawText(options.name, block.x, block.y - 0.5, 18, 'black', 'Arial', options);
      }

      ///////DEBUGGING CODE/////////////
      if (appStatus.debug) {

        this.DrawText(block.id, block.x, block.y - 0.3);
        this.DrawRectangle(block.x, block.y, 1, 1, 'pink');
      }
    }
  }

  // DrawBlocks(blocks, options = {}) {
  //   let hiddenBlockIDs = {};
  //   if (options.hasOwnProperty('hiddenBlockIDs')) {
  //     hiddenBlockIDs = options.hiddenBlockIDs;
  //   }

  //   for (const key in blocks) {
  //     if (blocks.hasOwnProperty(key)) {
  //       const block = blocks[key];
  //       if (!hiddenBlockIDs.hasOwnProperty(key)) {
  //         this.DrawBlock(block, options);
  //       } else {
  //         this.DrawBlock(block, {
  //           color: 'rgba(100,90,100,0.2',
  //           context: options.context
  //         });
  //       }
  //     }
  //   }
  // }


  DrawBlocks(blocks, options = {}) {
    let hiddenBlockIDs = [];
    if (options.hasOwnProperty('hiddenBlockIDs')) {
      hiddenBlockIDs = options.hiddenBlockIDs;
    }

    for (const key in blocks) {
      if (blocks.hasOwnProperty(key)) {
        const block = blocks[key];
        if (!hiddenBlockIDs.includes(key)) {
          this.DrawBlock(block, options);
        } else {
          this.DrawBlock(block, {
            color: 'rgba(100,90,100,0.2',
            context: options.context
          });
        }
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

  DrawBlocksArray(blocks, options = {}) {
    blocks.forEach(block => {
      this.DrawBlock(block, options);
    });
  }

  DrawAllBlocks(options) {
    this.DrawBlocks(dataKeeper.getBlockData().blocks, options);
  }

  DrawGridPoint(gridPoint, options = {}) {
    if (!options.hasOwnProperty('color')) {
      options.color = 'blue';
    }
    if (!options.hasOwnProperty('size')) {
      options.size = 0.25;
    }

    const position = gridPoint.split(',');
    const pixel = blockModule.createPixel(position[0], position[1], options.color);
    this.DrawPixel(pixel, options);
  }

  DrawGridPoints(gridPoints, options = {}) {
    for (const key in gridPoints) {
      if (gridPoints.hasOwnProperty(key)) {
        const gridPoint = gridPoints[key];
        this.DrawGridPoint(key, options);
      }
    }
  }

  DrawAllGridPoints(options = {}) {
    this.DrawGridPoints(dataKeeper.getBlockData().gridPoints, options);
  }

  SetPosition(x, y) {
    this.x = x;
    this.y = y;
    layers.background.refresh();
  }

  SetPositionAtAnchorPoint(anchorPoint, position) {
    this.SetPosition(
      this.x + anchorPoint.x - position.x,
      this.y + anchorPoint.y - position.y
    )
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
