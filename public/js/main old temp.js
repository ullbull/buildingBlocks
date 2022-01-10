import * as helpers from './helpers.js';
import * as blockModule from './block.js';
import { ViewPort } from './ViewPort.js';
import * as add from './addData.js';
import Mouse from './Mouse.js';
import * as api from './api.js';
import * as tools from './tools.js';
import * as selector from './selector.js';


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
// let selectedBlocks = tools.selectedBlocks;
let hoveredBlockOptions = { color: highlightColor };
let lastGridPosition = mouse.getGridPixel();
let tool = tools.builder;
tool.viewport = viewport;


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
setInterval(() => viewport.InitBlockData(), 1000);

// Reload workers from server
setInterval(async () => workers = await api.getData('/workers'), 100);

function animate() {
  requestAnimationFrame(animate);

  // Set transparency if no block is clicked or cursor is outside frame
  const alphaValue = (
    !appStatus.blockClicked ||
    !appStatus.mouseInsideFrame
  ) ? 0.5 : 1;

  appStatus.hideCursor = (
    appStatus.mouseOverBlock && !appStatus.mouseDown ||
    appStatus.mouseDown && !appStatus.blockClicked
  );

  appStatus.hideHoveredBlock = (
    appStatus.mouseDown
  );

  appStatus.hideSelectionBox = (
    !appStatus.mouseDown
  )

  let hiddenBlocks = {};
  if (cursor.hasOwnProperty('children')) {
    hiddenBlocks = helpers.copyObject(cursor.children);
    hiddenBlocks[cursor.id] = cursor;
  }

  // Clear frame
  c.clearRect(0, 0, canvas.width, canvas.height);

  // // Draw blocks
  viewport.DrawAllBlocks({ hiddenBlocks });

  if (!appStatus.hideCursor) {
    // Draw cursor
    // viewport.DrawBlock(cursor, { alphaValue });

    // Draw children
    if (cursor.hasOwnProperty('children')) {
      viewport.DrawBlocks(cursor.children, { alphaValue });
    }
  }


  // Draw hovered block
  if (!appStatus.hideHoveredBlock) viewport.DrawBlock(hoveredBlock, hoveredBlockOptions);

  // Draw selected blocks
  viewport.DrawBlocks(selector.getBlocks(), { color: highlightColor });

  // Draw workers
  for (const key in workers) {
    const worker = workers[key];
    if (worker.id != workerID) {
      viewport.DrawBlock(worker, { name: worker.name });
    }
  }

  if (!appStatus.hideSelectionBox) {
  }

  tool.draw();

  if (!appStatus.hideGrid) viewport.DrawGrid();

  if (appStatus.debug) {
    viewport.DrawAllgridpixels();
    viewport.Drawgridpixels(tool.gridpixels, 'red');
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
  appStatus.updateMouseInsideFrame(event, canvas);
  appStatus.updateMouseOverBlock(mouse);

  // Update mouse position
  mouse.SetPosition(event.x, event.y);
  const gridPosition = mouse.getGridPixel();

  appStatus.moveViewport = (
    event.buttons == 4 ||   // Middle button down
    (event.buttons == 1 && appStatus.spaceKeyDown)
  );

  appStatus.makeSelection = (
    (event.buttons == 1 ||   // Left button down
      event.buttons == 2) && // Right button down
    !appStatus.blockClicked
  );

  if (appStatus.moveViewport) {
    // tool = tools.mover;
  }


  // Update mouse position
  mouse.SetPosition(event.x, event.y);

  // Send this worker to server if mouse is moved one grid square
  if ((gridPosition.x != lastGridPosition.x) || (gridPosition.y != lastGridPosition.y)) {
    const worker = helpers.copyObject(cursor);
    worker.id = workerID;
    worker.name = document.getElementById("playerName").value;

    await api.sendData('/workers', worker);

    lastGridPosition = mouse.getGridPixel();
  }

  // Move cursor
  blockModule.setBlockPosition(cursor, mouse.GetWorldPosition());

  if (appStatus.makeSelection) {
  }

  tool.mouseMove(event);
}

function mouseDown(event) {

  // Any mouse button down
  appStatus.mouseDown = true;

  if (event.button == 0) {
    // Left button down

    appStatus.updateMouseOverBlock(mouse);
    appStatus.updateBlockClicked(event);

    // Change cursor to clicked block
    if (appStatus.blockClicked) {
      const clickedPixel = blockModule.getPositionInBlock(hoveredBlock, mouse.GetXWorldPosition(), mouse.GetYWorldPosition());

      // Copy clicked block to cursor
      cursor = helpers.copyObject(hoveredBlock);

      // Set anchor point
      const anchorPoint = { x: clickedPixel.x, y: clickedPixel.y };
      blockModule.setBlockAnchorPoint(cursor, anchorPoint);
      blockModule.setBlockPosition(cursor, mouse.GetWorldPosition());

      // Get children
      cursor.children = helpers.copyObject(selector.getBlocks());

    }

  }

  if (event.button == 2) {
    // Right button down
  }

  tool.mouseDown(event);
}

function mouseUp(event) {



  appStatus.updateMouseInsideFrame(event, canvas);
  // Any button up
  appStatus.updateMouseOverBlock(mouse);
  appStatus.mouseDown = false;
  mouse.lastX = event.x;
  mouse.lastY = event.y;

  if (event.button == 0) {  // Left button up
    appStatus.deleteBlock = (
      appStatus.blockClicked &&
      !appStatus.mouseInsideFrame
    )

    appStatus.blockClicked = false;

    appStatus.addBlock = (
      !appStatus.makeSelection &&
      appStatus.mouseInsideFrame
    );


    // Add blocks
    if (appStatus.addBlock) {

      appStatus.movingBlock = false;

      // Add cursor
      add.addBlockAndChildrenTo(viewport.blockData, cursor);

      // Send block to server
      api.sendData('/api', cursor);

      // Get new blockID
      cursor.id = helpers.generateID();

      // Get new id for children
      if (cursor.hasOwnProperty('children')) {
        let children = cursor.children;
        cursor.children = {};
        let n = 0;
        for (const key in children) {
          if (children.hasOwnProperty(key)) {
            const child = children[key];
            child.id = cursor.id + '_' + n++;
            cursor.children[child.id] = child;
          }
        }
      }
    }

    // Delete blocks
    if (appStatus.deleteBlock) {
      add.deleteBlockAndChildrenFrom(viewport.blockData, cursor);
    }
  }

  if (event.buttons == 1) {
    // Left button up
    appStatus.movedDistance = 0;
  }


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

  tool.keyDown(event);
  if (event.key == 'Control' && !appStatus.blockClicked) {
    // Add to selected blocks
    // selector.addBlock(hoveredBlock);
  }
  if (event.key == 'Alt') {


    // Change draw color for hovered block
    hoveredBlockOptions = {};
  }

  if (event.code == 'Space') {
    appStatus.spaceKeyDown = true;
  }

  if (event.key == 'd') {
    appStatus.debug = !appStatus.debug;
    if (appStatus.debug) {
      console.log('cursor:', cursor);
      console.log('selectedBlocks:', selectedBlocks);
      console.log('selectionBox', selectionBox);
      console.log('appStatus', appStatus);
    }
  }
}

function keyUp(event) {
  appStatus.spaceKeyDown = false;

  if (event.key == 'Alt') {
    hoveredBlockOptions = { color: highlightColor };
  }
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
