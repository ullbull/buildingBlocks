import { Container } from './Container.js';
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

class Pixel extends Container {
  constructor(x, y, color, viewPort) {
    super(x, y);
    this.viewPort = viewPort;
    this.content = color;
  }

  GetID() {
    return helpers.positionToKey(this.x, this.y);
  }

  SetID() {
    console.error('Not allowed');
  }

  Draw(offsetX = 0, offsetY = 0) {
    const pixel = {
      x: this.x + offsetX,
      y: this.y + offsetY,
      color: this.content,
      clearEdges: this.clearEdges
    };

    this.viewPort.DrawPixel(pixel);
    this.viewPort.StrokePixel(pixel, 0.2, 'rgba(50,50,70,1)');
  }

  GetData() {
    return this.content;
  }
}

export {
  Pixel
}
