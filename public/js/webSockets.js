import * as dataKeeper from './dataKeeper.js';
import * as layers from './layers.js';

const webSocket = new WebSocket('ws://localhost:8082');

webSocket.addEventListener('open', () => {
  console.log('We are connected!');

});

webSocket.addEventListener('message', (event) => {
  const dataJSON = JSON.parse(event.data);
  const type = dataJSON.type;

  switch (type) {
    case 'workers':
      const workers = dataJSON.payload;
      dataKeeper.setWorkers(workers);
      break;

    case 'blockData':
      const blockData = dataJSON.payload;
      dataKeeper.setBlockData(blockData);
      layers.background.refresh();
      break;

    default:
      console.error(dataJSON)
      console.error('Invalid type!', dataJSON.type)
      break;
  }
});

function sendData(type, payload) {
  const data = {
    type,
    payload
  };

  webSocket.send(JSON.stringify(data));
}

export {
  sendData,
}