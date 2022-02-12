import * as blockModule from './block.js';
import { Viewport } from './Viewport.js';
import * as toolManager from './toolManager.js';
import * as selector from './selector.js';
import * as position from './positionTranslator.js';
import * as mouse from './mouse.js';
import { appStatus } from './appStatus.js'
import * as layers from './layers.js';
import * as scanner from './scanner.js';
import * as connection from './connectionToServer.js';
import * as workerManager from './workerManager.js';
import * as dataKeeper from './dataKeeper.js';
import * as blockHider from './blockHider.js';



// const canvas = document.querySelector('canvas');

const viewport = new Viewport(innerWidth, innerHeight, 20, layers.background.context);
mouse.setViewport(viewport);
layers.setViewport(viewport);

setTimeout(function () {
  layers.background.refresh();
}, 5000);


// const testBlock = blockModule.createBlock(5,5,2,2);

// console.log('section 0,0:', dataKeeper.getSection('0,0'));
// dataKeeper.addBlock(testBlock);
// console.log('section 0,0:', dataKeeper.getSection('0,0'));


connection.connect();
connection.handleIncomingData();

// Get blocks from server
connection.sendData('subscribe', viewport.GetSectionNames());
// setInterval(() => {
//   // connection.sendData('requestSections', viewport.GetSectionNames());
// }, 5000);

const worker = workerManager.getWorker();

// viewport.AddLayer('foreground', cForeground);

// setInterval(() => layers.background.refresh = true, 1000);

function animate() {
  requestAnimationFrame(animate);

  layers.background.draw(appStatus.debug);
  layers.foreground.draw(true);
}

window.addEventListener('contextmenu', event => event.preventDefault());
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mouseup', onMouseUp);
window.addEventListener('resize', onResize);
window.addEventListener('mousewheel', onMouseWheel);
window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);
window.addEventListener('focus', onFocus);
window.addEventListener('blur', onBlur);

let lastWp = mouse.wp;
async function onMouseMove(event) {
  // Send this worker to server if mouse is moved one grid square
  if ((mouse.wp.x != lastWp.x) || (mouse.wp.y != lastWp.y)) {
    blockModule.setBlockPosition(worker, mouse.wp.x, mouse.wp.y);
    worker.name = document.getElementById("playerName").value;
    connection.sendData('worker', worker);
    lastWp = mouse.wp;
  }

  mouse.mouseMove(event);
  toolManager.mouseMove(event);
}

function onMouseDown(event) {
  mouse.mouseDown(event);
  toolManager.mouseDown(event);
}

function onMouseUp(event) {
  mouse.mouseUp(event);
  toolManager.mouseUp(event);
}

function onMouseWheel(event) {
  let zoomValue = event.deltaY / 100;
  let newPixelSize = viewport.pixelSize - zoomValue;
  let oldPixelSize = viewport.pixelSize;

  appStatus.hideGrid = (viewport.pixelSize < 10);

  if (newPixelSize >= 1) {
    // Zoom in/out
    viewport.pixelSize = newPixelSize;

    // Get mouse grid position
    let x = position.valueToGridValue(event.x, viewport);
    let y = position.valueToGridValue(event.y, viewport);

    const anchorPoint = {
      x: (x / oldPixelSize) * newPixelSize,
      y: (y / oldPixelSize) * newPixelSize
    };

    // Move canvas to zoom in/out at cursor position
    viewport.SetPositionAtAnchorPoint(anchorPoint, { x, y })
  }
}

function onResize() {
  layers.setCanvasToWindowSize();
  viewport.SetSize(innerWidth, innerHeight);
  layers.refreshAll();
}

function download(content, fileName, contentType) {
  var a = document.createElement("a");
  var file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

function onKeyDown(event) {
  if (event.key == 'b') {
  }
  if (event.key == 'm') {
  }
  if (event.key == 'ArrowUp') {
    viewport.SetPosition(viewport.x, viewport.y - 1);
  }
  if (event.key == 'ArrowDown') {
    viewport.SetPosition(viewport.x, viewport.y + 1);
  }
  if (event.key == 'ArrowLeft') {
    viewport.SetPosition(viewport.x - 1, viewport.y);
  }
  if (event.key == 'ArrowRight') {
    viewport.SetPosition(viewport.x + 1, viewport.y);
  }

  if (event.code == 'Space') {
    appStatus.spaceKeyDown = true;
  }

  if (event.key == 'd') {
    appStatus.debug = !appStatus.debug;
    if (appStatus.debug) {
      console.log('blockData:', dataKeeper.getBlockData());
      console.log('selectedBlocks:', selector.getBlocks());
      console.log('appStatus', appStatus);
      console.log('Hidden blocks', blockHider.getHiddenBlockIDs());
    }
  }

  toolManager.keyDown(event);
}

function onKeyUp(event) {
  appStatus.spaceKeyDown = false;
  toolManager.keyUp(event);

  // if (event.key == 's') {
  //   scanner.defineArea(viewport.GetWorldWidth(), viewport.GetWorldHeight());
  //   let scannedBlocks = scanner.scan();
  //   console.log('scannedBlocks', scannedBlocks);
  // }

  // console.log('Sections covered', viewport.GetSectionNames());

}

function onFocus(event) {
  console.log("Got focus!")
  toolManager.onFocus(event)
}

function onBlur(event) {
  console.log("Lost focus!")
}

window.onkeydown = function (e) {
  if (e.altKey) {
    e.preventDefault();
  }
}

animate();
