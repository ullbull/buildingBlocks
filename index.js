'use strict';
'use strict';
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const PORT = process.env.PORT || 3000;
const WS_PORT = 8082;

// Create the app
const app = express();
// Create the server
const server = http.createServer(app);

const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.listen(3001, () => console.log('listening at', 3001));
app.use(express.static('public'));
// // Run when client connects
// io.on('connection', socket => {
//   console.log('User connected', socket.id);
//   io.emit('message', `Welcome ${socket.id}`);

//   // Listen for message
//   socket.on('message', msg => {
//     console.log(msg);
//     socket.emit('message', 'hej');
//   });

//   // Runs when client disconnects
//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });
// });






const fileStream = require('fs');
const dataKeeper = require('./dataKeeper_njs.js');
const blockModule = require('./block_njs.js');
const cleanup = require("./cleanup.js");

let fileVersion = 1;
const dirPath = './blockData/';
const fileName = '0,0';
const fileExtension = '.json'
const filePath = dirPath + fileName + fileExtension;

// let rawData = fileStream.readFileSync(fileName + '_1' + fileExtension);

const rawData = fileStream.readFileSync(filePath);
const blockData = JSON.parse(rawData);   // { "blocks": {}, "gridPoints": {} }
dataKeeper.setBlockData(JSON.parse(rawData));
console.log(dataKeeper.getBlockData());
const workers = {};
exports.workers = workers;

// const PORT = 3000;
// const WS_PORT = 8082;

// // Create the app
// app.listen(PORT, () => console.log('listening at', PORT));
// app.use(express.static('public'));
// const app = express();

const WebSocket = require('ws');
const wsServer = new WebSocket.Server({ port: WS_PORT });

wsServer.on('connection', webSocket => {
  console.log("New client connected!");

  // Incoming message
  webSocket.on('message', data => {
    const dataJSON = JSON.parse(data);
    const type = dataJSON.type;

    switch (type) {
      case 'blockDataRequest': {
        const data = formatMessage('blockData', dataKeeper.getBlockData());
        webSocket.send(JSON.stringify(data));
        break;      
      }

      case 'blocksArray': {
        const blocksArray = dataJSON.payload;
        console.log('Received blocks!', blocksArray);

        dataKeeper.addBlocksArray(blocksArray);

        // saveFile();

        const data = formatMessage('blockData', dataKeeper.getBlockData());

        // Send to all clients except this I think
        wsServer.clients.forEach(function each(client) {
          if (client !== webSocket && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        })
        break;      
      }

      case 'worker': {
        const worker = dataJSON.payload;
        console.log('Received worker!', worker.id);
        // Add timestamp
        worker.timestamp = Date.now();

        // Store worker
        workers[worker.id] = worker;

        const data = formatMessage('workers', workers);

        // Send to all clients except this I think
        wsServer.clients.forEach(function each(client) {
          if (client !== webSocket && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        })

        break;
      }

      case 'deleteBlocks': {

        // Get the data from client
        const blockIDs = dataJSON.payload;

        dataKeeper.deleteBlocks(blockIDs)

        // saveFile();

        const data = formatMessage('blockData', dataKeeper.getBlockData());

        // Send to all clients except this I think
        wsServer.clients.forEach(function each(client) {
          if (client !== webSocket && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        })
        break;
      }

      default: {
        console.error(dataJSON)
        console.error('Invalid type!', dataJSON.type)
        break;
      }
    }
  })

  webSocket.on('close', () => {
    console.log('Client has disconnected!');
  });
});

function formatMessage(type, payload) {
  return { type, payload };
}

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
  fileStream.copyFileSync(filePath, dirPath + fileName + '_' + (fileVersion) + fileExtension);

  fileVersion = (++fileVersion > 2) ? 1 : fileVersion;

  // Save file
  fileStream.writeFileSync(filePath, dataString);

  fileStream.writeFile(filePath, dataString, (err) => {
    if (err) throw err;
    console.log(`write to file 0,0.json successful!`);
  });
}


/////////////////WORKERS////////////////////////////

// app.get('/workers', (request, response) => {
//   response.json(workers);
// });

// let wkr = {
//   id: '1602103196440.9812',
//   name: 'Anonymous worker',
//   position: { x: 10, y: 55 },
//   block: {}
// };

// app.post('/workers', (request, response) => {
//   // Get the data from client
//   const worker = request.body;

//   console.log('got worker', worker);
//   // Add timestamp
//   worker.timestamp = Date.now();

//   // Store worker
//   workers[worker.id] = worker;

//   // Send a response back to client
//   response.json(workers);
// });

////////////////////////////////////////////////////*/