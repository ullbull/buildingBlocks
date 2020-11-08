import * as helpers from './helpers.js';
import * as blockModule from './block.js';
import { ViewPort } from './ViewPort.js';
import * as add from './addData.js';
import Mouse from './Mouse.js';
import * as api from './api.js';
import * as tools from './tools.js';
import * as selector from './selector.js';
import * as blockHider from './blockHider.js';
import * as linkKeeper from './linkKeeper.js';
import { Block } from './BlockC.js';
import { Pixel } from './Pixel.js';

const canvas = document.querySelector('canvas');
canvas.width = innerWidth - 1;
canvas.height = innerHeight - 40;
const c = canvas.getContext('2d');

let fillColor = 'rgba(160,140,135,1)';
const highlightColor = 'rgba(170,70,50,0.5)';
const viewport = new ViewPort(canvas.width, canvas.height, 20, c);
const mouse = new Mouse(viewport);
const margin = 20;
const workerID = (Date.now() + Math.random()).toString();
const startBlock = blockModule.createBlock(0, 0, 4, 2, fillColor, { x: 0, y: 0 });
let cursor = startBlock;
let workers = {};
let hoveredBlock = {};
let hoveredBlockOptions = { color: highlightColor };
let lastGridPosition = mouse.GetGridPosition();

// const blc = new Block(1,2);
// console.log(blc);
// console.log(blc.GetX());
// blc.SetX(7);
// console.log(blc.GetX());
// console.log(blc.GetID());
// blc.Draw();

const pxl = new Pixel(1,3, 'purple', viewport);
const pxl2 = new Pixel(2,3, 'red', viewport);
const pxl3 = new Pixel(1,4, 'purple', viewport);

console.log('log', pxl3.GetData());

const blc = new Block(0,0);
blc.AddBuildingBlock(pxl);
blc.AddBuildingBlock(pxl2);
blc.AddBuildingBlock(pxl3);
blc.SetY(1);
blc.Draw();


// const blc2 = Block.createBlock(5,5,2,2,'blue', viewport);
const blc2 = new Block(4,4,3,3,'blue', viewport);
blc2.Draw();

// const builder = tools.builder;
// builder.viewport = viewport;

// const mover = tools.mover;
// mover.viewport = viewport;

// const boxSelection = tools.boxSelection;
// boxSelection.viewport = viewport;

let tool = new tools.BoxSelection(viewport);


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

// // Reload block data from server
// setInterval(() => viewport.InitBlockData(), 1000);

// // Reload workers from server
// setInterval(async () => workers = await api.getData('/workers'), 100);

function animate() {
  requestAnimationFrame(animate);

  // Clear frame
  c.clearRect(0, 0, canvas.width, canvas.height);

  // Draw blocks
  viewport.DrawAllBlocks({ hiddenBlockIDs: blockHider.getHiddenBlockIDs(), drawAnchorPoint: 1 });

  // Draw selected blocks
  viewport.DrawBlocks(selector.getBlocks(), { color: highlightColor });

  // Draw tool
  tool.draw();

  viewport.DrawGrid();

  if (appStatus.debug) {
    viewport.DrawAllGridPoints();
    viewport.DrawGridPoints(tool.gridPoints, 'red');
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
  let newPixelSize = viewport.pixelSize - zoomValue;
  let oldPixelSize = viewport.pixelSize;

  appStatus.hideGrid = (viewport.pixelSize < 10);

  if (newPixelSize >= 1) {
    // Zoom in/out
    viewport.pixelSize = newPixelSize;

    // Update mouse position
    mouse.SetPosition(event.x, event.y);

    let x = mouse.GetXGrid();
    let y = mouse.GetYGrid();

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
    tool = new tools.Builder(viewport);
  }
  if (event.key == 'm') {
    tool = new tools.Mover(viewport);
  }
  if (event.key == 's') {
    tool = new tools.BoxSelection(viewport);
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
      console.log('selectedBlocks:', selector.getBlocks());
      console.log('appStatus', appStatus);
      console.log('links', linkKeeper.getLinks());
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
