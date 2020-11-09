import { Container } from './Container.js';
import { Pixel } from './Pixel.js';
import * as helpers from './helpers.js';
import * as blockModule from './block.js';

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

class Block extends Container {
  constructor(x, y, width, height, color, viewPort) {
    super(x, y, viewPort);
    this.id = helpers.generateID();

    if (width > 0 && height > 0) {
      this.FillBlockWithPixels(width, height, color, viewPort);
    }
  }

  FillBlockWithPixels(width, height, color, viewPort) {
    for (let h = 0; h < height; h++) {
      for (let w = 0; w < width; w++) {
        this.AddBuildingBlock(new Pixel(w, h, color, viewPort));
      }
    }

    // Move pixels into position
    const x = this.x;
    const y = this.y;
    this.x = 0;
    this.y = 0;
    this.SetPosition(x, y);
  }

  GetID() {
    return this.id;
  }

  SetPosition(x, y) {
    // Find distance to new position
    const xDistance = x - this.x;
    const yDistance = y - this.y;

    // Move each buildingBlock according to distance
    for (const key in this.content) {
      if (this.content.hasOwnProperty(key)) {
        const b = this.content[key];
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

  SetAnchorPoint(x, y) {
    // Move position without moving content
    this.x = x;
    this.y = y;
  }

  SetID(id) {
    this.id = id;
  }

  SetContent(content) {
    findClearEdgesInBuildingBlock(content);
    this.content = content;
  }

  AddBuildingBlock(buildingBlock) {
    this.content[buildingBlock.GetID()] = buildingBlock;
    this.SetContent(this.content);
  }

  ReMake(buildingBlock) {
    // Reset content
    this.content = {};

    buildingBlock.forEach(buildingBlock => {
      this.AddBuildingBlock(buildingBlock);
    });
  }

  Draw() {
    for (const key in this.content) {
      if (this.content.hasOwnProperty(key)) {
        this.content[key].Draw();
      }
    }
  }

  // Copy() {
  //   const copy = new Block(this.GetX(), this.GetY(), 0, 0, 'black', this.viewPort);
  //   // copy.content = helpers.copyObject(this.content); // Fix this line!!!
  //   return copy;
  // }
}


function createBlockBluePrint(x, y, width, height, color) {
  const bluePrint = {
    id: helpers.generateID(),
    x: x,
    y: y,
    anchorPoint: { x: 0, y: 0 },
    pixels: {}
  }

  for (let h = 0; h < height; h++) {
    for (let w = 0; w < width; w++) {
      bluePrint.pixels[helpers.positionToKey(w, h)] = color;
    }
  }

  return bluePrint;
}

function createBlock(x, y, width, height, color, viewPort) {
  const bluePrint = createBlockBluePrint(x, y, width, height, color, viewPort);
  return new Block_new(bluePrint, viewPort);
}

class Block_new extends Container {
  constructor(bluePrint, viewPort) {
    super(bluePrint.x, bluePrint.y);
    this.id = bluePrint.id;
    this.anchorPointX = bluePrint.anchorPoint.x;
    this.anchorPointY = bluePrint.anchorPoint.y;
    this.viewPort = viewPort;

    for (const key in bluePrint.pixels) {
      if (bluePrint.pixels.hasOwnProperty(key)) {
        const position = helpers.keyToPosition(key);
        const color = bluePrint.pixels[key];
        this.AddBuildingBlock(new Pixel(position.x, position.y, color, this.viewPort));
      }
    }
  }

  FillBlockWithPixels(width, height, color, viewPort) {
    for (let h = 0; h < height; h++) {
      for (let w = 0; w < width; w++) {
        this.AddBuildingBlock(new Pixel(w, h, color, viewPort));
      }
    }

    // Move pixels into position
    const x = this.x;
    const y = this.y;
    this.x = 0;
    this.y = 0;
    this.SetPosition(x, y);
  }


  GetID() {
    return this.id;
  }

  SetPosition(x, y) {
    // // Find distance to new position
    // const xDistance = x - this.x;
    // const yDistance = y - this.y;

    // // Move each buildingBlock according to distance
    // for (const key in this.content) {
    //   if (this.content.hasOwnProperty(key)) {
    //     const b = this.content[key];
    //     b.SetX(b.GetX() + xDistance);
    //     b.SetY(b.GetY() + yDistance);
    //   }
    // }

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
    this.id = id;
  }

  SetContent(content) {
    findClearEdgesInBuildingBlock(content);
    this.content = content;
  }

  AddBuildingBlock(buildingBlock) {
    this.content[buildingBlock.GetID()] = buildingBlock;
    this.SetContent(this.content);
  }

  ReMake(buildingBlock) {
    // Reset content
    this.content = {};

    buildingBlock.forEach(buildingBlock => {
      this.AddBuildingBlock(buildingBlock);
    });
  }

  Draw() {
    for (const key in this.content) {
      if (this.content.hasOwnProperty(key)) {
        const offsetX = this.x - this.anchorPointX;
        const offsetY = this.y - this.anchorPointY;
        this.content[key].Draw(offsetX, offsetY);
      }
    }
  }

  GetBluePrint_tmp() {
    const contentData = this.GetContentData();
    for (const key in contentData) {
      if (contentData.hasOwnProperty(key)) {
        const color = contentData[key];
        const pos = helpers.keyToPosition(key);
        const x = pos.x - this.x;
        const y = pos.y - this.y;
        const key2 = helpers.positionToKey(x, y);
        contentData[key2] = color;
        delete contentData[key];
      }
    }

    return {
      id: this.GetID(),
      x: this.GetX(),
      y: this.GetY(),
      pixels: contentData
    }
  }

  GetBluePrint() {
    return {
      id: this.GetID(),
      x: this.GetX(),
      y: this.GetY(),
      anchorPoint: this.GetAnchorPoint(),
      pixels: this.GetContentData()
    }
  }

  // Copy() {
  //   const copy = new Block(this.GetX(), this.GetY(), 0, 0, 'black', this.viewPort);
  //   // copy.content = helpers.copyObject(this.content); // Fix this line!!!
  //   return copy;
  // }
}




export {
  Block_new as Block,
  createBlock
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