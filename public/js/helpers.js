import * as dataKeeper from './dataKeeper.js';

function positionToKey(x, y) {
  return x + ',' + y;
}

function keyToPosition(key) {
  const apa = key.split(',');
  return {
    x: parseInt(apa[0]),
    y: parseInt(apa[1])
  }
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

function uniqueNumber() {
  var date = Date.now();

  // If created at same millisecond as previous
  if (date <= uniqueNumber.previous) {
      date = ++uniqueNumber.previous;
  } else {
      uniqueNumber.previous = date;
  }

  return date;
}
uniqueNumber.previous = 0;

function uid(){
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generateID() {
  let randomString = Math.random().toString(16).slice(2)
  return randomString + '_' + uniqueNumber();
}

function copyObject(object) {
  return JSON.parse(JSON.stringify(object));
}

// Return block id of hovered block
function getBlockUnderMouse(mouse) {
  const key = this.positionToKey(mouse.GetXWorldPosition(), mouse.GetYWorldPosition());

  // Check if mouse is over any pixel
  const blockID = mouse.dataKeeper.getBlockData().gridPoints[key];
  return blockID;
}

// function getBlockByKey(key) {
//   const blockID = dataKeeper.getBlockData().gridPoints[key];
//   let block;
//   if (typeof blockID != 'undefined') {
//     block = dataKeeper.getBlockData().blocks[blockID];
//   }
//   return block;
// }

// // Return block at position
// function getBlockByPosition(x, y, viewport) {
//   const key = positionToKey(x, y);
//   return getBlockByKey(key, viewport);
// }

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

function isObjectEmpty(object) {
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      return false;      
    }
  }
  return true;
}

export {
  positionToKey,
  keyToPosition,
  colorValues,
  getAlphaColor,
  generateID,
  copyObject,
  getBlockUnderMouse,
  // getBlockByKey,
  // getBlockByPosition,
  getXGrid,
  getYGrid,
  getGridPosition,
  insideFrame,
  isObjectEmpty
};
