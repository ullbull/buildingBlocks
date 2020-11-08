import * as helpers from './helpers.js';
import * as blockModule from './block.js';
import * as api from './api.js';

export class ViewPort {
  constructor(width, height, pixelSize, c) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.pixelSize = pixelSize;
    this.c = c;
    this.actualWidth = width * pixelSize;
    this.actualHeight = height * pixelSize;
    this.blockData = { blocks: {}, gridPoints: {} };
    this.pixels = {};
    this.anchorPoint = { x: 0, y: 0 };
    // this.InitBlockData();
  }

  async InitBlockData() {
    this.blockData = await api.getData('/api');
  }

  WorldXToViewport(x) {
    x -= this.x;
    x = this.ToValueViewport(x);
    return x;
  }

  WorldYToViewport(y) {
    y -= this.y;
    y = this.ToValueViewport(y);
    return y;
  }

  ToValueViewport(value) {
    return value * this.pixelSize;
  }

  // Actual position to grid position
  ValueToGridValue(value) {
    return Math.floor(value / this.pixelSize);
  }

  CanvasXToWorld(x) {
    return Math.floor((x / this.pixelSize) + this.x);
  }

  CanvasYToWorld(y) {
    return Math.floor((y / this.pixelSize) + this.y);
  }

  CanvasToWorldPosition(x, y) {
    return { 'x': this.CanvasXToWorld(x), 'y': this.CanvasYToWorld(y) };
  }

  DrawGrid() {
    // Don't draw grid if pixelSize is too small
    if (this.pixelSize < 5) return;

    this.c.lineWidth = 1;
    this.c.strokeStyle = 'rgba(0,0,0,' + (this.pixelSize / 150) + ')';
    this.c.beginPath();
    let x;
    let y;

    // Draw rows
    for (let row = 0; row < this.height; row += this.pixelSize) {
      x = 0;
      y = -((this.y * this.pixelSize) % this.pixelSize) + row;
      this.c.moveTo(x, y);

      x = this.width;
      this.c.lineTo(x, y);
    }

    // Draw columns
    for (let column = 0; column < this.width; column += this.pixelSize) {
      x = -((this.x * this.pixelSize) % this.pixelSize) + column;
      y = 0;
      this.c.moveTo(x, y);

      y = this.height;
      this.c.lineTo(x, y);
    }
    this.c.stroke();
  }

  DrawRectangle(x, y, width, height, color) {
    this.c.fillStyle = color;
    x = this.WorldXToViewport(x);
    y = this.WorldYToViewport(y);
    // x = this.ToValueViewport(x);
    // y = this.ToValueViewport(y);
    width = this.ToValueViewport(width);
    height = this.ToValueViewport(height);

    this.c.fillRect(x, y, width, height);
  }

  DrawPixel(pixel, options = {}) {
    let size = 1;
    if (options.hasOwnProperty('size')) {
      size = options.size;
    }

    // Draw Pixel
    this.DrawRectangle(pixel.x, pixel.y, size, size, pixel.color);
  }

  DrawText(text, x, y, size = 18, color = 'black', font = 'Arial') {
    this.c.font = '' + size + 'px ' + font;
    this.c.fillStyle = color;
    x = this.WorldXToViewport(x);
    y = this.WorldYToViewport(y);
    this.c.fillText(text, x, y);
  }

  StrokePixel(pixel, lineWidth, color) {
    let x = this.WorldXToViewport(pixel.x);
    let y = this.WorldYToViewport(pixel.y);
    let pixelSize = 1;
    pixelSize = this.ToValueViewport(pixelSize);

    // let edges = ['right'];
    this.c.lineWidth = this.ToValueViewport(lineWidth);
    this.c.strokeStyle = color;
    this.c.beginPath();

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

          this.c.moveTo(xStart, yStart);
          this.c.lineTo(xEnd, yEnd);
          break;
        case 'bottom':
          xStart = x;
          yStart = y + pixelSize;
          xEnd = xStart + pixelSize;
          yEnd = yStart;

          this.c.moveTo(xStart, yStart);
          this.c.lineTo(xEnd, yEnd);
          break;
        case 'left':
          xStart = x;
          yStart = y;
          xEnd = xStart;
          yEnd = yStart + pixelSize;

          this.c.moveTo(xStart, yStart);
          this.c.lineTo(xEnd, yEnd);
          break;
        case 'right':
          xStart = x + pixelSize;
          yStart = y;
          xEnd = xStart;
          yEnd = yStart + pixelSize;

          this.c.moveTo(xStart, yStart);
          this.c.lineTo(xEnd, yEnd);
          break;
        default:
          console.log('Invalid value for edge: ', edge);
          return;
      }

    });

    // Stroke edges
    this.c.stroke();
  }

  DrawBlock(block, options = {}) {
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
      this.DrawText(block.id, block.x, block.y);
    }
  }

  DrawBlocks(blocks, options = {}) {
    let hiddenBlockIDs = {};
    if (options.hasOwnProperty('hiddenBlockIDs')) {
      hiddenBlockIDs = options.hiddenBlockIDs;
    }

    for (const key in blocks) {
      if (blocks.hasOwnProperty(key)) {
        const block = blocks[key];
        if (!hiddenBlockIDs.hasOwnProperty(key)) {
          this.DrawBlock(block, options);
        } else {
          this.DrawBlock(block, {color : 'rgba(100,90,100,0.1'});
        }
      }
    }
  }

  DrawAllBlocks(options) {
    this.DrawBlocks(this.blockData.blocks, options);
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
    this.DrawGridPoints(this.blockData.gridPoints);
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

