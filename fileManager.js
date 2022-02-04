const fs = require('fs');
const dataKeeper = require('./dataKeeper_njs.js');

const pathSectionData = './sectionData/';
const pathTempFiles = pathSectionData + 'tempFiles/';
const fileExtension = '.json'
// const filename_ = '0,0';
// const filePath = dirPath + filename_ + fileExtension;
let fileVersion = 0;

function getFilePath(path, filename, separator = '', suffix = '') {
  return path + filename + separator + suffix + fileExtension
}

// Loads the file content into corresponding section.
// Loads and empty section if file doesn't exist.
// Returns loaded section.
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

  let section;

  if (rawData == null) {
    console.error(`Loading an empty section into section "${filename}"`);
    section = dataKeeper.EmptySection;
  } else {
    section = JSON.parse(rawData);
  }

  // Load data into section
  dataKeeper.setSection(section, filename);

  return section;
}

// Saves a file. Overwrites if file exist
function saveFile(filename) {
  const dataString = JSON.stringify(dataKeeper.getSection(filename));
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

// Returns requested section.
// Loads section if not loaded.
// Returns empty section if section doesn't exist
function getSection(sectionName) {
  const section = dataKeeper.getSection(sectionName);
  if (section.blocks[0]) {
    // Section is already loaded. Return the section
    return section;
  } else {
    // Section is not loaded. Load the section and return it.
    return loadFile(sectionName);
  }
}

// Returns requested sections.
// Loads section if not loaded.
// Returns empty section if section doesn't exist
function getSections(sectionNames) {
  const sections = {};

  sectionNames.forEach(sectionName => {
    sections[sectionName] = getSection(sectionName);
  });

  return sections;
}

module.exports = {
  loadFile,
  saveFile,
  saveSectionsToFiles,
  getSection,
  getSections
}