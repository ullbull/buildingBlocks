import * as helpers from './helpers.js';
import * as blockModule from './block.js';
import * as dataKeeper from './dataKeeper.js';
import * as position from './positionTranslator.js';

export class ViewPort {
  constructor(width, height, pixelSize, context) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.pixelSize = pixelSize;
    this.context = context;
    // this.actualWidth = width * pixelSize;
    // this.actualHeight = height * pixelSize;
    this.pixels = {};
    this.anchorPoint = { x: 0, y: 0 };
  }

  DrawGrid() {
    // Don't draw grid if pixelSize is too small
    if (this.pixelSize < 5) return;

    this.context.lineWidth = 1;
    this.context.strokeStyle = 'rgba(0,0,0,' + (this.pixelSize / 150) + ')';
    this.context.beginPath();
    let x;
    let y;

    // Draw rows
    for (let row = 0; row < this.height; row += this.pixelSize) {
      x = 0;
      y = -((this.y * this.pixelSize) % this.pixelSize) + row;
      this.context.moveTo(x, y);

      x = this.width;
      this.context.lineTo(x, y);
    }

    // Draw columns
    for (let column = 0; column < this.width; column += this.pixelSize) {
      x = -((this.x * this.pixelSize) % this.pixelSize) + column;
      y = 0;
      this.context.moveTo(x, y);

      y = this.height;
      this.context.lineTo(x, y);
    }
    this.context.stroke();
  }

  DrawRectangle(x, y, width, height, color, options = {}) {
    if (!options.hasOwnProperty('offsetPosition')) {
      options.offsetPosition = { x: 0, y: 0 };
    }
    x += options.offsetPosition.x;
    y += options.offsetPosition.y;

    this.context.fillStyle = color;
    x = position.worldXToViewport(x, this);
    y = position.worldYToViewport(y, this);
    width = position.toValueViewport(width, this);
    height = position.toValueViewport(height, this);


    this.context.fillRect(x, y, width, height);
  }

  DrawPixel(x, y, color, options = {}) {
    // Quick fix. need to change later
    if (typeof x.color != 'undefined') {
      this.DrawPixelP(x, y);
    }

    let size = 1;
    if (options.hasOwnProperty('size')) {
      size = options.size;
    }

    // Draw Pixel
    this.DrawRectangle(x, y, size, size, color, options);
  }

  DrawPixelP(pixel, options = {}) {
    this.DrawPixel(pixel.x, pixel.y, pixel.color, options)
  }

  DrawText(text, x, y, size = 18, color = 'black', font = 'Arial') {
    this.context.font = '' + size + 'px ' + font;
    this.context.fillStyle = color;
    x = position.worldXToViewport(x, this);
    y = position.worldYToViewport(y, this);
    this.context.fillText(text, x, y);
  }

  StrokePixel(pixel, lineWidth, color, options = {}) {
    let x = position.worldXToViewport(pixel.x, this);
    let y = position.worldYToViewport(pixel.y, this);
    let pixelSize = 1;
    pixelSize = position.toValueViewport(pixelSize, this);

    if (options.hasOwnProperty('offsetPosition')) {
      x += options.offsetPosition.x * this.pixelSize;
      y += options.offsetPosition.y * this.pixelSize;
    }

    // let edges = ['right'];
    this.context.lineWidth = position.toValueViewport(lineWidth, this);
    this.context.strokeStyle = color;
    this.context.beginPath();

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

          this.context.moveTo(xStart, yStart);
          this.context.lineTo(xEnd, yEnd);
          break;
        case 'bottom':
          xStart = x;
          yStart = y + pixelSize;
          xEnd = xStart + pixelSize;
          yEnd = yStart;

          this.context.moveTo(xStart, yStart);
          this.context.lineTo(xEnd, yEnd);
          break;
        case 'left':
          xStart = x;
          yStart = y;
          xEnd = xStart;
          yEnd = yStart + pixelSize;

          this.context.moveTo(xStart, yStart);
          this.context.lineTo(xEnd, yEnd);
          break;
        case 'right':
          xStart = x + pixelSize;
          yStart = y;
          xEnd = xStart;
          yEnd = yStart + pixelSize;

          this.context.moveTo(xStart, yStart);
          this.context.lineTo(xEnd, yEnd);
          break;
        default:
          console.log('Invalid value for edge: ', edge);
          return;
      }

    });

    // Stroke edges
    this.context.stroke();
  }

  DrawContainer(container, options = {}) {
    
    for (const key in container.content) {
      if (container.content.hasOwnProperty(key)) {
        const element = container.content[key];
        if (element.hasOwnProperty('content')) {
          // This element has content.
          // Send that content through this function again and
          // use containers position as offset
          if (!options.hasOwnProperty('offsetPosition')) {
            options.offsetPosition = { x: 0, y: 0 };
          }
          options.offsetPosition.x += container.x;
          options.offsetPosition.y += container.y;
          this.DrawContainer(element, options);
          
          // Draw id
          let x = options.offsetPosition.x;
          let y = options.offsetPosition.y;
          this.DrawText(container.id, x, y);
        }

        else {
          // This element is a pixel.
          // Draw that pixel
          const pixel = helpers.copyObject(element);

          if (typeof options.color != 'undefined') {
            pixel.color = options.color;
          }

          if (options.hasOwnProperty('alphaValue')) {
            pixel.color = helpers.getAlphaColor(pixel.color, options.alphaValue);
          }

          pixel.x += container.x;
          pixel.y += container.y;

          this.DrawPixelP(pixel, options);
          this.StrokePixel(pixel, 0.2, 'rgba(50,50,70,1)', options);
        }
      }
    }
  }

  DrawBlock_old(block, options = {}) {
    if (block.hasOwnProperty('pixels')) {
      for (const key in block.pixels) {
        if (block.pixels.hasOwnProperty(key)) {
          const pixel = helpers.copyObject(block.pixels[key]);

          if (typeof options.color != 'undefined') {
            pixel.color = options.color;
          }

          if (options.hasOwnProperty('alphaValue')) {
            pixel.color = helpers.getAlphaColor(pixel.color, options.alphaValue);
          }

          // Set pixel relative to block
          const position = blockModule.getGridPosition(block, key);
          pixel.x = position.x;
          pixel.y = position.y;

          this.DrawPixel(pixel);
          this.StrokePixel(pixel, 0.2, 'rgba(50,50,70,1)');
        }
      }

      if (options.hasOwnProperty('name')) {
        this.DrawText(options.name, block.x, block.y);
      }

      ///////DEBUGGING CODE/////////////
      if (options.hasOwnProperty('drawAnchorPoint')) {
        this.DrawRectangle(block.x, block.y, 1, 1, 'pink');
        // this.DrawText('bx: ' + block.x + ' by: ' + block.y, block.x, block.y - 1);
        // this.DrawText('ax: ' + block.anchorPoint.x + ' ay: ' + block.anchorPoint.y, block.x, block.y);
      }
    }
  }

  DrawBlocks(blocks, options = {}) {
    
    let hiddenBlockIDs = {};
    if (options.hasOwnProperty('hiddenBlockIDs')) {
      hiddenBlockIDs = options.hiddenBlockIDs;
    }
    
    for (const key in blocks) {
      const options_copy = helpers.copyObject(options); // Fulhack
      if (blocks.hasOwnProperty(key)) {
        const block = blocks[key];
        if (!hiddenBlockIDs.hasOwnProperty(key)) {
          this.DrawContainer(block, options_copy);
        } else {
          this.DrawContainer(block, { color: 'rgba(100,90,100,0.1' });
        }
      }
    }
  }

  DrawBlockContainer(blockContainer, options = {}) {
    if (blockContainer.hasOwnProperty('pixels')) {
      for (const key in blockContainer.pixels) {
        if (blockContainer.pixels.hasOwnProperty(key)) {
          const block = helpers.copyObject(blockContainer.pixels[key]);

          if (typeof options.color != 'undefined') {
            block.color = options.color;
          }

          if (options.hasOwnProperty('alphaValue')) {
            block.color = helpers.getAlphaColor(block.color, options.alphaValue);
          }

          // Set block relative to container
          const position = blockModule.getGridPosition(blockContainer, key);
          block.x = position.x;
          block.y = position.y;

          this.DrawContainer(block, options);
          // this.StrokePixel(block, 0.2, 'rgba(50,50,70,1)');
        }
      }

      if (options.hasOwnProperty('name')) {
        this.DrawText(options.name, blockContainer.x, blockContainer.y);
      }

      ///////DEBUGGING CODE/////////////
      if (options.hasOwnProperty('drawAnchorPoint')) {
        this.DrawRectangle(blockContainer.x, blockContainer.y, 1, 1, 'pink');
        // this.DrawText('bx: ' + block.x + ' by: ' + block.y, block.x, block.y - 1);
        // this.DrawText('ax: ' + block.anchorPoint.x + ' ay: ' + block.anchorPoint.y, block.x, block.y);
      }
    }
  }

  DrawAllBlocks(options) {
    this.DrawBlocks(dataKeeper.getBlockData().blocks, options);
  }

  DrawGridPoint(gridPoint, color = 'blue') {
    const position = gridPoint.split(',');
    const pixel = blockModule.createPixel(position[0], position[1], color);
    this.DrawPixel(pixel, { 'size': 0.25 });
  }

  DrawGridPoints(gridPoints, color) {
    for (const key in gridPoints) {
      if (gridPoints.hasOwnProperty(key)) {
        const gridPoint = gridPoints[key];
        this.DrawGridPoint(key, color);
      }
    }
  }

  DrawAllGridPoints() {
    this.DrawGridPoints(dataKeeper.getBlockData().gridPoints);
  }

  SetCenterX(x) {
    this.x = x - this.width / 2;
  }

  SetCenterY(y) {
    this.y = y - this.height / 2;
  }

  SetCenterPosition(x, y) {
    this.SetCenterX(x);
    this.SetCenterY(y);
  }

  SetXAtAnchorPoint(xAnchorPoint, x) {
    this.x += xAnchorPoint - x;
  }

  SetYAtAnchorPoint(yAnchorPoint, y) {
    this.y += yAnchorPoint - y;
  }

  // Move(mouseEvent) {
  //   if (mouse.empty && mouseEvent.buttons == 1) {
  //     mouse.movedDistance += Math.abs(mouse.x - mouse.lastX) + Math.abs(mouse.y - mouse.lastY);

  //     if (mouse.movedDistance > 100) {
  //       // Move viewPort
  //       this.x -= mouse.x - mouse.lastX;
  //       this.y -= mouse.y - mouse.lastY;
  //       mouse.movingViewport = true;
  //     }
  //   }
  // }
}

// module.exports = ViewPort;

