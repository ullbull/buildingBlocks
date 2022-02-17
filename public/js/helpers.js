/**
 * Returns a string from two ints.
 * Adds a ',' between the ints, ex "1,2"
 * @param {int} x 
 * @param {int} y 
 * @returns {string}
 */
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
  const blockID = mouse.dataKeeper.getBlockData().gridpixels[key];
  return blockID;
}

// function getBlockByKey(key) {
//   const blockID = dataKeeper.getBlockData().gridpixels[key];
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

function getGridPixel(x, y, pixelSize) {
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

/**
 * Comparing passed data and returns either lost or new data.
 * @param {string[]} originalData 
 * @param {string[]} modifiedData 
 * @param {string} request "lost" or "new". Determine whether to return new data or lost data.
 * @returns {string[]}
 */
function getDifferentData(originalData, modifiedData, request) {
  let dataA;
  let dataB;
  if (request == "lost") {
    dataA = originalData
    dataB = modifiedData
  } else if (request == "new") {
    dataA = modifiedData
    dataB = originalData
  } else {
    throw('request must be "lost" or "new".')
  }

  const differentData = [];
  dataA.forEach((valueA) => {
    const index = dataB.findIndex((valueB) => {
      return valueA == valueB;
    });
    if (index == -1) {
      differentData.push(valueA);
    }
  });
  return differentData;
}

/**
 * Test function for getDifferentData.
 * @returns {boolean}
 */
function __testGetDifferentData() {
  console.log("test");
  const stored_names = [0,1,2,3];
  const new_names = [2,3,4,5,6];
  let lostData = getDifferentData(stored_names, new_names, "lost");
  console.log("lostData", lostData);
  let newData = getDifferentData(stored_names, new_names, "new");
  console.log("newData", newData);

  const successNewData = equals(newData, [4,5,6]);
  const successLostData = equals(lostData, [0,1]);
  const success = successNewData && successLostData
  console.log("success:", success)
  return success
}

const equals = (a, b) =>
  a.length === b.length &&
  a.every((v, i) => v === b[i]);

// __testGetDifferentData()


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
  getGridPixel,
  insideFrame,
  isObjectEmpty,
  getDifferentData
};
