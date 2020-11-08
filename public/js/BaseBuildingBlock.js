import * as helpers from './helpers.js';

class BaseBuildingBlock {
  constructor(x, y, viewPort) {
    this.id;
    this.x = x;
    this.y = y;
    this.content;
    this.viewPort = viewPort;
  }
  GetID() {
    return this.id;
  }

  GetX() {
    return this.x;
  }

  GetY() {
    return this.y;
  }

  SetX(x) {
    this.x = x;
  }

  SetY(y) {
    this.y = y;
  }

  GetContentData() {
    let data = {};
    for (const key in this.content) {
      if (this.content.hasOwnProperty(key)) {
        const element = this.content[key];
        if (element.getData != null) {
          data[element.GetID()] = element.getData();
        }
        else {
          data = this.content;
          break;
        }
      }
    }
    return data;
  }

  GetData() {
    return {
      id: this.GetID(),
      x: this.GetX(),
      y: this.GetY(),
      content: this.GetContentData()
    }
  } 
}

export {BaseBuildingBlock};

  // data = {
  //   id: 43234,
  //   x: 2,
  //   y: 3,
  //   content: {
  //     '4234': {
  //       id: 43234,
  //       x: 2,
  //       y: 3,
  //       content: {
  //         id: 43234,
  //         x: 2,
  //         y: 3,
  //         content: 'red'
  //       }
  //     },
  //     '5435': {
  //       id: 43234,
  //       x: 2,
  //       y: 3,
  //       content: {
  //         id: 43234,
  //         x: 2,
  //         y: 3,
  //         content: 'red'
  //       }
  //     }
  //   }
  // }