'use strict';
const express = require('express');
const fileStream = require('fs');
const dataKeeper = require('./dataKeeper_njs.js');
const blockModule = require('./block_njs.js');
const cleanup = require("./cleanup.js");

const app = express();

let fileVersion = 1;
const path = './blockData/';
const fileName = '0,0';
const fileExtension = '.json'
const filePath = path + fileName + fileExtension;

// let rawData = fileStream.readFileSync(fileName + '_1' + fileExtension);

const rawData = fileStream.readFileSync(filePath);
const blockData = JSON.parse(rawData);   // { "blocks": {}, "gridPoints": {} }
dataKeeper.setBlockData(JSON.parse(rawData));
console.log(dataKeeper.getBlockData());
const workers = {};
exports.workers = workers;

app.listen(3000, () => console.log('listening at 3000'));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

setInterval(() => deleteOldWorkers(), 1000);

// Cleanup if block data is corrupt
cleanup.deleteBadGridpoints(dataKeeper.getBlockData());
cleanup.deleteBadBlocks(dataKeeper.getBlockData());


app.get('/api', (request, response) => {
  response.json(dataKeeper.getBlockData());
});

app.post('/api', (request, response) => {
  console.log('Receiving data!');
  // Get the data from client
  const data = request.body;

  dataKeeper.addBlocksArray(data);

  // saveFile();

  // Send a response back to client
  response.json({ message: 'thanks' });
});

app.delete('/api', (request, response) => {
  // Get the data from client
  const blockIDs = request.body;

  dataKeeper.deleteBlocks(blockIDs)

  saveFile();

  // Send a response back to client
  response.json({ message: 'thanks' });
});


//////////////////////////////////////////

async function deleteOldWorkers() {
  for (const key in workers) {
    if (workers.hasOwnProperty(key)) {
      const worker = workers[key];
      if ((Date.now() - worker.timestamp) > 1000) {
        console.log('deleting worker ', worker.name);
        delete workers[key];
      }
    }
  }
}

function saveFile() {
  let dataString = JSON.stringify(dataKeeper.getBlockData());
  // let dataString = JSON.stringify(blockData, null, 2);

  // Copy file
  fileStream.copyFileSync(filePath, path + fileName + '_' + (fileVersion) + fileExtension);

  fileVersion = (++fileVersion > 20) ? 1 : fileVersion;

  // Save file
  fileStream.writeFileSync(filePath, dataString);

  fileStream.writeFile(filePath, dataString, (err) => {
    if (err) throw err;
    console.log(`write to file 0,0.json successful!`);
  });
}


/////////////////WORKERS////////////////////////////

app.get('/workers', (request, response) => {
  response.json(workers);
});

let wkr = {
  id: '1602103196440.9812',
  name: 'Anonymous worker',
  position: { x: 10, y: 55 },
  block: {}
};

app.post('/workers', (request, response) => {
  // Get the data from client
  const worker = request.body;

  // Add timestamp
  worker.timestamp = Date.now();

  // Store worker
  workers[worker.id] = worker;

  // Send a response back to client
  response.json(workers);
});

////////////////////////////////////////////////////
