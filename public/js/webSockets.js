import * as dataKeeper from './dataKeeper.js';

const webSocket = new WebSocket('ws://localhost:8082');

const msg = {
  id: 123,
  message: 'No message'
}

webSocket.addEventListener('open', () => {
  console.log('We are connected!');

});
webSocket.addEventListener('message', receiveMessage);

function receiveMessage(event) {
  const msg = JSON.parse(event.data);
  console.log(msg);
  dataKeeper.setWorkers(msg);
}

function sendSocket() {
  msg.message = document.getElementById("playerName").value;
  webSocket.send(JSON.stringify(msg));
  console.log(msg);
}

function sendWorker(worker) {
  webSocket.send(JSON.stringify(worker));
}

export {
  webSocket,
  receiveMessage,
  sendSocket,
  sendWorker
}