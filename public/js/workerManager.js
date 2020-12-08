import * as blockModule from './block.js';

const worker = blockModule.createBlock(0, 0, 4, 2, 'gray');
let workers = {};
setInterval(() => deleteOldWorkers(), 1000);

function addWorker(worker) {
  // Add timestamp
  worker.timestamp = Date.now();

  // Add to workers
  workers[worker.id] = worker;
}

function getWorker() {
  return worker;
}

function getWorkers() {
  return workers;
}

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

export {
  addWorker,
  getWorker,
  getWorkers
}