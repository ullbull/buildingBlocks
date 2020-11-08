import { BaseBuildingBlock } from './BaseBuildingBlock.js';
import * as helpers from './helpers.js';

// class Pixel {
//   constructor(x, y, color, viewPort) {
//     let X = x;
//     let Y = y;
//     let Color = color;
//     const ViewPort = viewPort;

//     this.GetX = function () {
//       return X;
//     }

//     this.GetY = function () {
//       return Y;
//     }

//     this.GetID = function () {
//       return helpers.positionToKey(X, Y);
//     }

//     this.SetX = function (x) {
//       X = x;
//     }

//     this.SetY = function (y) {
//       Y = y;
//     }

//     this.Draw = function () {
//       const pixel = {
//         x: X,
//         y: Y,
//         color: Color,
//         clearEdges: this.clearEdges
//       }
//       ViewPort.DrawPixel(pixel);
//       ViewPort.StrokePixel(pixel, 0.2, 'rgba(50,50,70,1)');
//     }
//   }
// }

// class Pixel {
//   constructor(x, y, color, viewPort) {
//     this.x = x;
//     this.y = y;
//     this.color = color;
//     this.viewPort = viewPort;

//     this.GetX = function () {
//       return this.x;
//     }

//     this.GetY = function () {
//       return this.y;
//     }

//     this.GetID = function () {
//       return helpers.positionToKey(this.x, this.y);
//     }

//     this.SetX = function (x) {
//       this.x = x;
//     }

//     this.SetY = function (y) {
//       this.y = y;
//     }

//     this.Draw = function () {
//       this.viewPort.DrawPixel(this);
//       this.viewPort.StrokePixel(this, 0.2, 'rgba(50,50,70,1)');
//     }
//   }
// }

class Pixel extends BaseBuildingBlock {
  constructor(x, y, color, viewPort) {
    super(x, y, viewPort);

    this.content = color;
    this.color = color;     // to be able to use "this" in DrawPixel(), need to change this later
  }

  GetID() {
    return helpers.positionToKey(this.x, this.y);
  }

  Draw() {
    this.viewPort.DrawPixel(this);
    this.viewPort.StrokePixel(this, 0.2, 'rgba(50,50,70,1)');
  }
}

export {
  Pixel
}
