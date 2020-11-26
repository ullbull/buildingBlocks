import * as helpers from './helpers.js';
import * as blockModule from './block.js';
import { Viewport } from './Viewport.js';
import * as dataKeeper from './dataKeeper.js';
import * as api from './api.js';
import * as toolManager from './toolManager.js';
import * as selector from './selector.js';
import * as blockHider from './blockHider.js';
import * as position from './positionTranslator.js';
import * as mouse from './mouse.js';
import { appStatus } from './appStatus.js'

// const canvas = document.querySelector('canvas');
const canvases = document.getElementsByTagName('canvas');
for (let i = 0; i < canvases.length; i++) {
  canvases[i].width = innerWidth - 1;
  canvases[i].height = innerHeight - 40;
}

const background = canvases[0];
const foreground = canvases[1];
const cBackground = background.getContext('2d');
const cForeground = foreground.getContext('2d');
cForeground.fillStyle = 'black';
cForeground.fillRect(10, 10, 50, 50);



let fillColor = 'rgba(160,140,135,1)';
const highlightColor = 'rgba(170,70,50,0.5)';
const viewport = new Viewport(background.width, background.height, 20, cForeground);
mouse.setViewport(viewport);
const worker = blockModule.createBlock(0, 0, 4, 2, 'gray');
let workers = {};


// Reload block data from server
dataKeeper.initBlockData();
setInterval(() => dataKeeper.initBlockData(), 500);

// Reload workers from server
setInterval(async () => workers = await api.getData('/workers'), 100);

setTimeout(function(){ 
}, 100);

function animate() {
  requestAnimationFrame(animate);
  
  // Clear frame
  cForeground.clearRect(0, 0, background.width, background.height);
  
  // Draw blocks
  viewport.DrawAllBlocks({ 
    hiddenBlockIDs: blockHider.getHiddenBlockIDs(),
    drawAnchorPoint: 1
  });

  // Draw selected blocks
  viewport.DrawBlocks(selector.getBlocks(), { color: highlightColor });

  // Draw tool
  toolManager.drawTool();

  // Draw workers
  viewport.DrawWorkers(workers, worker);

  viewport.DrawGrid();

  if (appStatus.debug) {
    viewport.DrawAllGridPoints({ alphaValue: 0.5 });
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
  // Send this worker to server if mouse is moved one grid square
  // if ((gridPosition.x != lastGridPosition.x) || (gridPosition.y != lastGridPosition.y)) {
  if (true) {
    blockModule.setBlockPosition(worker, mouse.wp.x, mouse.wp.y);
    worker.name = document.getElementById("playerName").value;
    await api.sendData('/workers', worker);

    // lastGridPosition = mouse.GetGridPosition();
  }

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
    viewport.SetXAtAnchorPoint(anchorPoint.x, x);
    viewport.SetYAtAnchorPoint(anchorPoint.y, y);
  }
}

function resize() {
  background.width = innerWidth - 20;
  background.height = innerHeight - 20;
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
    viewport.y--;
  }
  if (event.key == 'ArrowDown') {
    viewport.y++;
  }
  if (event.key == 'ArrowLeft') {
    viewport.x--;
  }
  if (event.key == 'ArrowRight') {
    viewport.x++;
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
      console.log('Workers', workers);
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
