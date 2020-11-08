import * as helpers from './helpers.js';
import * as blockModule from './block.js';
import { Pixel } from './Pixel.js';


class Block {
  constructor(x = 0, y = 0, width = 0, height = 0, color = 'gray', viewPort) {
    this.ID = helpers.generateID();
    this.x = 0;
    this.y = 0;
    this.buildingBlocks = {};

    this.fillBlockWithPixels = function (width, height) {
      for (let h = 0; h < height; h++) {
        for (let w = 0; w < width; w++) {
          this.AddBuildingBlock(new Pixel(w, h, color, viewPort));
        }
      }
    }

    if (width > 0 && height > 0) {
      this.fillBlockWithPixels(width, height);
    }

    this.SetPosition(x, y);
  }

  GetX() {
    return this.x;
  }

  GetY() {
    return this.y;
  }

  GetID() {
    return this.ID;
  }

  SetPosition(x, y) {
    // Find distance to new position
    const xDistance = x - this.x;
    const yDistance = y - this.y;

    // Move each buildingBlock according to distance
    for (const key in this.buildingBlocks) {
      if (this.buildingBlocks.hasOwnProperty(key)) {
        const b = this.buildingBlocks[key];
        b.SetX(b.GetX() + xDistance);
        b.SetY(b.GetY() + yDistance);
      }
    }

    // Move this blocks position
    this.x = x;
    this.y = y;
  }

  SetX(x) {
    this.SetPosition(x, this.y);
  }

  SetY(y) {
    this.SetPosition(this.x, y);
  }

  SetID(id) {
    this.ID = id;
  }

  SetBuildingBlocks(buildingBlocks) {
    findClearEdgesInBuildingBlock(buildingBlocks);
    console.log(buildingBlocks);
    this.buildingBlocks = buildingBlocks;
  }

  AddBuildingBlock(buildingBlock) {
    this.buildingBlocks[buildingBlock.GetID()] = buildingBlock;
    this.SetBuildingBlocks(this.buildingBlocks);
  }

  Draw() {
    for (const key in this.buildingBlocks) {
      if (this.buildingBlocks.hasOwnProperty(key)) {
        this.buildingBlocks[key].Draw();
      }
    }
  }

  GetData() {
    const data = {
      id: this.id,
      x: this.x,
      y: this.y,
      buildingBlocks: this.buildingBlocks
    }
  }

}

function findClearEdgesInBuildingBlock(buildingBlocks) {
  let x;
  let y;
  let key2;

  for (const key in buildingBlocks) {
    if (buildingBlocks.hasOwnProperty(key)) {
      const buildingBlock = buildingBlocks[key];
      buildingBlock.clearEdges = [];

      // Top
      x = buildingBlock.GetX();
      y = buildingBlock.GetY() - 1;
      key2 = helpers.positionToKey(x, y);
      if (typeof buildingBlocks[key2] == 'undefined') {
        buildingBlock.clearEdges.push('top');
      }

      // Bottom
      x = buildingBlock.GetX();
      y = buildingBlock.GetY() + 1;
      key2 = helpers.positionToKey(x, y);
      if (typeof buildingBlocks[key2] == 'undefined') {
        buildingBlock.clearEdges.push('bottom');
      }

      // Left
      x = buildingBlock.GetX() - 1;
      y = buildingBlock.GetY();
      key2 = helpers.positionToKey(x, y);
      if (typeof buildingBlocks[key2] == 'undefined') {
        buildingBlock.clearEdges.push('left');
      }

      // Right
      x = buildingBlock.GetX() + 1;
      y = buildingBlock.GetY();
      key2 = helpers.positionToKey(x, y);
      if (typeof buildingBlocks[key2] == 'undefined') {
        buildingBlock.clearEdges.push('right');
      }
    }
  }
}

export {
  Block
}

// class Block {
  //   constructor(x, y) {
    //     let id = helpers.generateID();
    //     x = x;
    //     y = y;
    //     const buildingBlocks = {};

    //     this.GetX = function() {
      //       return x;
//     }

//     this.GetID = function () {
//       return id;
//     }
//   }
// }