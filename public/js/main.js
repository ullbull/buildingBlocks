import * as helpers from './helpers.js';
import * as blockModule from './block.js';
import { ViewPort } from './ViewPort.js';
import * as dataKeeper from './dataKeeper.js';
import * as api from './api.js';
import * as tools from './tools.js';
import * as selector from './selector.js';
import * as blockHider from './blockHider.js';


const canvas = document.querySelector('canvas');
canvas.width = innerWidth - 1;
canvas.height = innerHeight - 40;
const c = canvas.getContext('2d');

let fillColor = 'rgba(160,140,135,1)';
const highlightColor = 'rgba(170,70,50,0.5)';
const viewPort = new ViewPort(canvas.width, canvas.height, 20, c);
const margin = 20;
const workerID = (Date.now() + Math.random()).toString();
const startBlock = blockModule.createBlock(0, 0, 4, 2, fillColor, { x: 0, y: 0 });
let cursor = startBlock;
let workers = {};
let tool = new tools.Builder(viewPort);


const appStatus = {
  moveViewport: false,
  moveBlock: false,
  addBlock: false,
  movedDistance: 0,
  hideSelectionBox: true,

  updateMouseOverBlock: function (mouse) {
    // Check if mouse is over any pixel
    const blockID = helpers.getBlockUnderMouse(mouse);
    if (blockID) {
      if (typeof mouse.viewport.blockData.blocks[blockID] != 'undefined') {
        // Mouse is over a block
        this.mouseOverBlock = true;
        hoveredBlock = mouse.viewport.blockData.blocks[blockID];
      } else {
        console.log('Error at block ', blockID);
      }
    }
    else {
      // Mouse is not over a block
      this.mouseOverBlock = false;
      hoveredBlock = {};
    }
  },

  updateMouseInsideFrame: function (event, canvas) {
    // Check if mouse is inside frame
    if (event.x <= canvas.width - margin && event.y <= canvas.height - margin &&
      event.x >= margin && event.y >= margin) {
      this.mouseInsideFrame = true;
    } else {
      this.mouseInsideFrame = false;
    }
  },

  updateBlockClicked: function (event) {
    this.blockClicked = (
      event.type == 'mousedown' &&
      event.buttons == 1 &&          // Left button
      this.mouseOverBlock
    );
  }
};

// Reload block data from server
setInterval(() => dataKeeper.initBlockData(), 2000);

// Reload workers from server
setInterval(async () => workers = await api.getData('/workers'), 100);

function animate() {
  requestAnimationFrame(animate);

  // Clear frame
  c.clearRect(0, 0, canvas.width, canvas.height);

  // Draw blocks
  viewPort.DrawAllBlocks({ hiddenBlockIDs: blockHider.getHiddenBlockIDs(), drawAnchorPoint: 1 });

  // Draw selected blocks
  viewPort.DrawBlocks(selector.getBlocks(), { color: highlightColor });

  // Draw tool
  tool.draw();

  viewPort.DrawGrid();

  if (appStatus.debug) {
    viewPort.DrawAllGridPoints();
    viewPort.DrawGridPoints(tool.gridPoints, 'red');
    console.log('cursor.id', cursor.id);
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

  tool.mouseMove(event);
}

function mouseDown(event) {
  tool.mouseDown(event);
}

function mouseUp(event) {
  tool.mouseUp(event);
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
    let x = viewPort.ValueToGridValue(event.x);
    let y = viewPort.ValueToGridValue(event.y);
    
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
    tool = new tools.Builder(viewPort);
  }
  if (event.key == 'm') {
    tool = new tools.Mover(viewPort);
  }
  if (event.key == 's') {
    tool = new tools.BoxSelection(viewPort);
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
      console.log('cursor:', cursor);
      console.log('selectedBlocks:', selector.getBlocks());
      console.log('appStatus', appStatus);
    }
  }

  tool.keyDown(event);
}

function keyUp(event) {
  appStatus.spaceKeyDown = false;

  if (event.key == 'Alt') {
    hoveredBlockOptions = { color: highlightColor };
  }

  tool.keyUp(event);
}



// window.onkeyup = function (event) {
//   if (event.key == 'Alt') {
//     hoveredBlockOptions = { color: highlightColor };
//   }
// }

// window.onkeydown = function(e){
//   if(e.altKey && e.keyCode == 83){
//     e.preventDefault();
//     alert("Shotcut Pressed")
//   }
// }

animate();
