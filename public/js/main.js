import * as helpers from './helpers.js';
import * as blockModule from './block.js';
import { ViewPort } from './ViewPort.js';
import * as dataKeeper from './dataKeeper.js';
import * as api from './api.js';
// import { ToolManager } from './toolManager.js';
import * as toolManager from './toolManager.js';
import * as selector from './selector.js';
import * as blockHider from './blockHider.js';
import * as position from './positionTranslator.js';
import * as mouse from './mouse.js';
import { appStatus } from './appStatus.js'

const canvas = document.querySelector('canvas');
canvas.width = innerWidth - 1;
canvas.height = innerHeight - 40;
const context = canvas.getContext('2d');

let fillColor = 'rgba(160,140,135,1)';
const highlightColor = 'rgba(170,70,50,0.5)';
const viewPort = new ViewPort(canvas.width, canvas.height, 20, context);
mouse.setViewPort(viewPort);
const margin = 20;
const workerID = (Date.now() + Math.random()).toString();
const startBlock = blockModule.createBlock(0, 0, 4, 2, fillColor, { x: 0, y: 0 });
let cursor = startBlock;
let workers = {};


// Reload block data from server
dataKeeper.initBlockData();
setInterval(() => dataKeeper.initBlockData(), 500);

// Reload workers from server
setInterval(async () => workers = await api.getData('/workers'), 100);

function animate() {
  requestAnimationFrame(animate);

  // Clear frame
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw blocks
  viewPort.DrawAllBlocks({ hiddenBlockIDs: blockHider.getHiddenBlockIDs(), drawAnchorPoint: 1 });

  // Draw selected blocks
  viewPort.DrawBlocks(selector.getBlocks(), { color: highlightColor });

  // Draw tool
  toolManager.drawTool();

  viewPort.DrawGrid();

  if (appStatus.debug) {
    viewPort.DrawAllGridPoints({ alphaValue: 0.5 });
  }
}

window.addEventListener('contextmenu', event => event.preventDefault());
window.addEventListener('mousemove', mouseMove);
window.addEventListener('mousedown', mouseDown);
window.addEventListener('mouseup', mouseUp);
window.addEventListener('resize', resize);
window.addEventListener('mousewheel', mouseWheel);
window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

async function mouseMove(event) {
  // // Send this worker to server if mouse is moved one grid square
  // if ((gridPosition.x != lastGridPosition.x) || (gridPosition.y != lastGridPosition.y)) {
  //   const worker = helpers.copyObject(cursor);
  //   worker.id = workerID;
  //   worker.name = document.getElementById("playerName").value;

  //   await api.sendData('/workers', worker);

  //   lastGridPosition = mouse.GetGridPosition();
  // }

  mouse.mouseMove(event);
  toolManager.mouseMove(event);
}

function mouseDown(event) {
  mouse.mouseDown(event);
  toolManager.mouseDown(event);
}

function mouseUp(event) {
  mouse.mouseUp(event);
  toolManager.mouseUp(event);
}

function mouseWheel(event) {
  let zoomValue = event.deltaY / 100;
  let newPixelSize = viewPort.pixelSize - zoomValue;
  let oldPixelSize = viewPort.pixelSize;

  appStatus.hideGrid = (viewPort.pixelSize < 10);

  if (newPixelSize >= 1) {
    // Zoom in/out
    viewPort.pixelSize = newPixelSize;

    // Get mouse grid position
    let x = position.valueToGridValue(event.x, viewPort);
    let y = position.valueToGridValue(event.y, viewPort);

    const anchorPoint = {
      x: (x / oldPixelSize) * newPixelSize,
      y: (y / oldPixelSize) * newPixelSize
    };

    // Move canvas to zoom in/out at cursor position
    viewPort.SetXAtAnchorPoint(anchorPoint.x, x);
    viewPort.SetYAtAnchorPoint(anchorPoint.y, y);
  }
}

function resize() {
  canvas.width = innerWidth - 20;
  canvas.height = innerHeight - 20;
}

function download(content, fileName, contentType) {
  var a = document.createElement("a");
  var file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

function keyDown(event) {
  if (event.key == 'b') {
  }
  if (event.key == 'm') {
  }
  if (event.key == 's') {
  }

  if (event.key == 'ArrowUp') {
    viewPort.y--;
  }
  if (event.key == 'ArrowDown') {
    viewPort.y++;
  }
  if (event.key == 'ArrowLeft') {
    viewPort.x--;
  }
  if (event.key == 'ArrowRight') {
    viewPort.x++;
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
    }
  }

  toolManager.keyDown(event);
}

function keyUp(event) {
  appStatus.spaceKeyDown = false;
  toolManager.keyUp(event);
}

window.onkeydown = function (e) {
  if (e.altKey) {
    e.preventDefault();
  }
}

animate();
