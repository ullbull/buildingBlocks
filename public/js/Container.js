import * as helpers from './helpers.js';

class Container {
  constructor(x, y) {
    this.id;
    this.x = x;
    this.y = y;
    this.content = {};
    this.anchorPointX = 0;
    this.anchorPointY = 0;
  }

  Draw() {
    for (const key in this.content) {
      if (this.content.hasOwnProperty(key)) {
        this.content[key].Draw();
      }
    }
  }

  GetID() {
    return this.id;
  }

  SetID(id) {
    this.id = id;
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

  GetAnchorPointX() {
    return this.anchorPointX;
  }

  GetAnchorPointY() {
    return this.anchorPointY;
  }

  GetAnchorPoint() {
    return {
      x: this.GetAnchorPointX(),
      y: this.GetAnchorPointY()
    }
  }

  SetAnchorPointX(x) {
    this.anchorPointX = x;
  }

  SetAnchorPointY(y) {
    this.anchorPointY = y;
  }

  SetAnchorPoint(x, y) {
    this.SetAnchorPointX(x);
    this.SetAnchorPointY(y);
  }

  GetContentData() {
    let data = {};
    for (const key in this.content) {
      if (this.content.hasOwnProperty(key)) {
        const element = this.content[key];
        if (element.GetData != null) {
          data[element.GetID()] = element.GetData();
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

export { Container };

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