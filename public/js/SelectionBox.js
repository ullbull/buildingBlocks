import * as helpers from './helpers.js';

export class SelectionBox {
  constructor(
    viewport,
    x = 0,
    y = 0,
    width = 5,
    height = 5,
    color = 'rgba(10,100,130,0.5)',
  ) {
    this.viewport = viewport;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.gridpixels = {};
    this.Initgridpixels();
  }

  Initgridpixels() {
    let point = {};
    let key;
    this.gridpixels = {};

    // Create gridpixels for both positive and negative box size
    let x;
    let y;
    let width = (this.width < 0) ? this.width * -1 : this.width;
    let height = (this.height < 0) ? this.height * -1 : this.height;

    for (let w = 0; w < width; w++) {
      for (let h = 0; h < height; h++) {
        x = (this.width < 0) ? (w * -1) - 1 : w;
        y = (this.height < 0) ? (h * -1) - 1 : h;
        point = {
          x: Math.floor(this.x + x),
          y: Math.floor(this.y + y)
        };
        key = helpers.positionToKey(point.x, point.y);
        this.gridpixels[key] = 'SelectionBox';
      }
    }
  }

  SetWidth(width) {
    this.width = width;
    this.Initgridpixels();
  }

  SetHeight(height) {
    this.height = height;
    this.Initgridpixels();
  }

  SetSize(width, height) {
    this.SetWidth(width);
    this.SetHeight(height);
  }

  SetX(x) {
    this.x = x;
  }

  SetY(y) {
    this.y = y;
  }

  SetPosition(position) {
    this.SetX(position.x);
    this.SetY(position.y);
  }

  Draw() {
    this.viewport.DrawRectangle(this.x, this.y, this.width, this.height, this.color);
  }
}
