function positionToKey(x, y) {
  return x + ',' + y;
}

// return array of [r,g,b,a] from any valid color. if failed returns undefined
function colorValues(color) {
  if (!color)
    return;
  if (color.toLowerCase() === 'transparent')
    return [0, 0, 0, 0];
  if (color[0] === '#') {
    if (color.length < 7) {
      // convert #RGB and #RGBA to #RRGGBB and #RRGGBBAA
      color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3] + (color.length > 4 ? color[4] + color[4] : '');
    }
    return [parseInt(color.substr(1, 2), 16),
    parseInt(color.substr(3, 2), 16),
    parseInt(color.substr(5, 2), 16),
    color.length > 7 ? parseInt(color.substr(7, 2), 16) / 255 : 1];
  }
  if (color.indexOf('rgb') === -1) {
    // convert named colors
    var temp_elem = document.body.appendChild(document.createElement('fictum')); // intentionally use unknown tag to lower chances of css rule override with !important
    var flag = 'rgb(1, 2, 3)'; // this flag tested on chrome 59, ff 53, ie9, ie10, ie11, edge 14
    temp_elem.style.color = flag;
    if (temp_elem.style.color !== flag)
      return; // color set failed - some monstrous css rule is probably taking over the color of our object
    temp_elem.style.color = color;
    if (temp_elem.style.color === flag || temp_elem.style.color === '')
      return; // color parse failed
    color = getComputedStyle(temp_elem).color;
    document.body.removeChild(temp_elem);
  }
  if (color.indexOf('rgb') === 0) {
    if (color.indexOf('rgba') === -1)
      color += ',1'; // convert 'rgb(R,G,B)' to 'rgb(R,G,B)A' which looks awful but will pass the regxep below
    return color.match(/[\.\d]+/g).map(function (a) {
      return +a
    });
  }
}

function getAlphaColor(color, alphaValue) {
  const rgbValues = this.colorValues(color);
  const r = rgbValues[0];
  const g = rgbValues[1];
  const b = rgbValues[2];
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alphaValue + ')';

}

function generateID() {
  let number = Math.floor(Math.random() * 100);
  let timestamp = Date.now();
  return number + '_' + timestamp;
}

function copyObject(object) {
  return JSON.parse(JSON.stringify(object));
}

// Return block id of hovered block
function getBlockUnderMouse(mouse) {
  const key = this.positionToKey(mouse.GetXWorldPosition(), mouse.GetYWorldPosition());

  // Check if mouse is over any pixel
  const blockID = mouse.viewport.blockData.gridPoints[key];
  return blockID;
}

function getBlockByKey(key, viewport) {
  const blockID = viewport.blockData.gridPoints[key];
  let block;
  if (typeof blockID != 'undefined') {
    block = viewport.blockData.blocks[blockID];
  }
  return block;
}

// Return block at position
function getBlockByPosition(x, y, viewport) {
  const key = positionToKey(x, y);
  return getBlockByKey(key, viewport);
}

function getXGrid(x, pixelSize) {
  return Math.floor(x / pixelSize);
}

function getYGrid(y, pixelSize) {
  return Math.floor(y / pixelSize);
}

function getGridPosition(x, y, pixelSize) {
  return { x: this.GetXWorldPosition(x, pixelSize), y: this.getYGrid(y, pixelSize) };
}

function insideFrame(x, y, width, height, margin = 0) {
  return (
    x <= width - margin && y <= height - margin &&
    x >= margin && y >= margin
  );
}

// function getFilledRectangle(width, height, content) {
//   const rectangle = {};
//   // Fill rectangle with content
//   for (let h = 0; h < height; h++) {
//     for (let w = 0; w < width; w++) {
//       rectangle[content.GetID()] = content;
//       this.AddBuildingBlock(new Pixel(w, h, color, viewPort));
//     }
//   }

// }

export {
  positionToKey,
  colorValues,
  getAlphaColor,
  generateID,
  copyObject,
  getBlockUnderMouse,
  getBlockByKey,
  getBlockByPosition,
  getXGrid,
  getYGrid,
  getGridPosition,
  insideFrame
};
