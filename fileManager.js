const fs = require('fs');
const helpers = require('./helpers_njs.js');
const dataKeeper_2 = require('./dataKeeper_2_njs.js');

const dirPath = './blockData/';
const fileExtension = '.json'
// const filename_ = '0,0';
// const filePath = dirPath + filename_ + fileExtension;
let fileVersion = 1;

function getFilePath(filename, separator = '', suffix = '') {
  return dirPath + filename + separator + suffix + fileExtension
}

// Loads the file content into corresponding section.
// Loads and empty section if file doesn't exist
function loadFile(filename = '0,0') {
  const filePath = getFilePath(filename);
  let rawData = null;

  try {
    rawData = fs.readFileSync(filePath);
  } catch (error) {
    if (error.code == 'ENOENT') {
      console.error('Could not find the file', filePath);
    } else {
      console.error(error);
    }
  }

  const emptySection = {
    blocks: [],
    gridPoints: {}
  }
  let section;

  if (rawData == null) {
    console.error(`Loading an empty section into section "${filename}"`);
    section = emptySection;
  } else {
    section = JSON.parse(rawData);
  }

  // Load data into section
  dataKeeper_2.setSection(section, filename);
}

function saveFile(filename) {
  const dataString = JSON.stringify(dataKeeper_2.getSection(filename));
  // const dataString = JSON.stringify(blockData, null, 2);

  fileVersion = (++fileVersion > 2) ? 1 : fileVersion;
  const tempFilePath = getFilePath(filename, '_', ''+fileVersion);
  const filePath = getFilePath(filename);
  // const tempFilePath = dirPath + filename + '_' + (fileVersion) + fileExtension

  // Save temporary file
  fs.writeFile(tempFilePath, dataString, (err) => {
    if (err) {
      console.error('Error in write file: ', err);
      return;
    }

    // Write to temporary file was successful!
    // Now rename the temporary file
    fs.copyFile(tempFilePath, filePath, (err) => {
      if (err) {
        console.error(`Error when trying to rename ${tempFilePath} to ${filePath}:\n`, err);
        return;
      }
    });
  });
}

module.exports = {
  loadFile,
  saveFile
}