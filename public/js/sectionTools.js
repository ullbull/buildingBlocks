import * as helpers from './helpers.js';

const sectionSize = 100;

function getSectionValue(value) {
  return Math.floor(value / sectionSize);
}

/**
 * Returns the section name for passed position
 * @param {int} x 
 * @param {int} y 
 * @returns {string}
 */
function getSectionName(x, y) {
  return helpers.positionToKey(getSectionValue(x), getSectionValue(y));
}

/**
 * Returns the section names of sections covered by passed area
 * @returns {string[]}
 */
function getSectionNames(x, y, width, height) {
  const sections = [];
  const sectionLeft = getSectionValue(x);
  const sectionRight = getSectionValue(x + width);    
  const sectionTop = getSectionValue(y);
  const sectionBottom = getSectionValue(y + height);

  // Find covered sections
  for (let x = sectionLeft; x <= sectionRight; x++) {
    for (let y = sectionTop; y <= sectionBottom; y++) {
      sections.push(helpers.positionToKey(x,y));
    }
  }

  return sections;
}

export {
  sectionSize,
  getSectionValue,
  getSectionName,
  getSectionNames
}