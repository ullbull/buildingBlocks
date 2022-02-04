import * as helpers from './helpers.js';
import * as dataKeeper from './dataKeeper.js';
import * as blockModule from './block.js';

let area = {};

function defineArea(width, height) {
  console.log(width, height);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      add(x, y);
    }
  }
}

function add(x, y) {
  const key = helpers.positionToKey(x, y);
  area[key] = key;
}

function scan() {
  console.log('area', Object.keys(area));

  let loops = 1
  const blocks = [];
  while (true) {
    loops++;
    let key = Object.keys(area)[0];
    if (!key) {
      break;
    } else {
      const block = helpers.getBlockByKey(key);
      if (block) {
        blocks.push(block);
        blockModule.getGridPixelKeys(block).forEach(blockKey => {
          delete area[blockKey];
        });
      } else {
        delete area[key];
      }
    }
  }
  console.log(loops);
  return blocks;
}

export {
  area,
  defineArea,
  scan
}
