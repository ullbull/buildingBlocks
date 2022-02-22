const fs = require('fs');
const dataKeeper = require('./dataKeeper_njs.js');
const cleanup = require("./cleanup.js");

const pathSectionData = './sectionData/';
const pathTempFiles = pathSectionData + 'tempFiles/';
const fileExtension = '.json'
// const filename_ = '0,0';
// const filePath = dirPath + filename_ + fileExtension;
let fileVersion = 0;

function getFilePath(path, filename, separator = '', suffix = '') {
  return path + filename + separator + suffix + fileExtension
}

/**
 * Loads the file content and add it to stored data.
 * Loads and empty section if file doesn't exist.
 * Returns loaded data. 
 * @param {[string]} filename ex.: "0,0"
 * @returns {dataKeeper.BlockData}
 */
function loadFile(filename = '0,0') {
  const filePath = getFilePath(pathSectionData, filename);
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

  let blockData;

  if (rawData == null) {
    console.error(`Loading an empty section into section "${filename}"`);
    blockData = dataKeeper.EmptySection;
  } else {
    blockData = JSON.parse(rawData);
    
    // Cleanup if blockData is corrupt
    let sectionNames = cleanup.deleteBadGridpixels(blockData);
    saveSectionsToFiles(sectionNames);
    sectionNames = cleanup.deleteBadBlocks(blockData);
    saveSectionsToFiles(sectionNames);
  }

  // Load data into section
  dataKeeper.addSection(blockData, filename);

  return blockData;
}

// Saves a file. Overwrites if file exist
function saveFile(filename) {
  const dataString = JSON.stringify(dataKeeper.getBlockData(filename));
  // const dataString = JSON.stringify(blockData, null, 2);

  fileVersion = (++fileVersion > 2) ? 1 : fileVersion;
  const tempFilePath = getFilePath(pathTempFiles, filename, '_', '' + fileVersion);
  const filePath = getFilePath(pathSectionData, filename);
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

// Saves each section to a separate file
function saveSectionsToFiles(sectionNames) {
  sectionNames.forEach(sectionName => {
    saveFile(sectionName);
  })
}

function saveAllSectionsToFiles() {
  saveSectionsToFiles(dataKeeper.getAllSectionNames())
}

/**
 * Returns requested section.
 * Loads section if not loaded.
 * Returns empty section if section doesn't exist
 * @param {string} sectionName
 * @returns {dataKeeper.BlockData}
 */
function getBlockData(sectionName) {
  const blockData = dataKeeper.getBlockData(sectionName);
  if (blockData.blocks[0]) {
    // Section is already loaded. Return the section
    return blockData;
  } else {
    // Section is not loaded. Load the section and return it.
    return loadFile(sectionName);
  }
}

/**
 * Returns requested sections in separate keys.
 * Loads section if not loaded.
 * Returns empty section if section doesn't exist
 * @param {string[]} sectionNames 
 * @returns {{"0,0": dataKeeper.BlockData}}
 */
function getSections(sectionNames) {
  const sections = {};

  sectionNames.forEach(sectionName => {
    sections[sectionName] = getBlockData(sectionName);
  });

  return sections;
}

module.exports = {
  loadFile,
  saveFile,
  saveSectionsToFiles,
  saveAllSectionsToFiles,
  getSection: getBlockData,
  getSections
}