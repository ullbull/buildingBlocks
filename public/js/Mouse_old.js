export default class Mouse {
  constructor(viewport) {
    this.x = 0;
    this.y = 0;
    this.viewport = viewport
  }

  SetX(x) {
    this.x = x;
  }

  SetY(y) {
    this.y = y;
  }

  SetPosition(x, y) {
    this.SetX(x);
    this.SetY(y);
  }

  GetPosition() {
    return { x: this.x, y: this.y }
  }

  GetGridPosition() {
    return { x: this.GetXGrid(), y: this.GetYGrid() };
  }

  GetXGrid() {
    return Math.floor(this.x / this.viewport.pixelSize);
  }

  GetYGrid() {
    return Math.floor(this.y / this.viewport.pixelSize);
  }

  GetXWorldPosition() {
    return this.viewport.CanvasXToWorld(this.x);
  }

  GetYWorldPosition() {
    return this.viewport.CanvasYToWorld(this.y);
  }

  GetWorldPosition() {
    return this.viewport.CanvasToWorldPosition(this.x, this.y);
  }

  Draw(options = {}) {
    const size = 10;
    const color = 'black';
    if (options.hasOwnProperty('size')) {
      size = options.size;
    }

    this.viewport.c.fillStyle = color;
    this.viewport.c.fillRect(this.x, this.y, size, size);
  }

  DrawWorldP(options = {}) {
    const pixel = {
      x: this.GetXWorldPosition(),
      y: this.GetYWorldPosition(),
      color: 'blue'
    }
    this.viewport.DrawPixel(pixel);
  }

}

// module.exports = Mouse;
