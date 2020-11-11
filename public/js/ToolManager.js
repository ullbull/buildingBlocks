import * as tools from './tools.js';
import * as mouse from './mouse.js';

/*
tool move =
Middle click and drag

tool select =
Left or right click and drag empty space

tool build =
mouseUp

tool build =
left click on block
or
left click empty space without dragging
*/

const builder = new tools.Builder();
const boxSelection = new tools.BoxSelection();
const mover = new tools.Mover();
let currentTool = builder;

function drawTool() {
  currentTool.draw();
}

function mouseDown(event) {
  currentTool.mouseDown(event);
  boxSelection.mouseDown(event);
}

function mouseUp(event) {
  currentTool.mouseUp(event);
}

function mouseMove(event) {
  const minMovement = mouse.getViewPort().pixelSize;
  if (mouse.dragDistance > minMovement) {
    
    if (event.buttons == 0) {      // No buttons down
      currentTool = builder;
    }
    else if (mouse.leftButton || mouse.rightButton) {
      if (!mouse.clickedBlock) {  // Left or right click and drag empty space
        currentTool = boxSelection;
      }
    }
    else if (mouse.middleButton) {
      currentTool = mover;
    }
  }

  currentTool.mouseMove(event);
}

function keyDown(event) {
  currentTool.keyDown(event);
}

function keyUp(event) {
  currentTool.keyUp(event);
}

export {
  drawTool,
  mouseDown,
  mouseUp,
  mouseMove,
  keyDown,
  keyUp
}


















// function ToolManager() {
//   builder = new tools.Builder();
//   boxSelection = new tools.BoxSelection();
//   mover = new tools.Mover();
//   currentTool = builder;

//   drawTool = function () {
//     currentTool.draw();
//   }

//   mouseDown = function (event) {
//     if (mouse.hoveredBlock) {
//       currentTool = builder;
//     }

//     currentTool.mouseDown(event);
//     boxSelection.mouseDown(event);
//   }

//   mouseUp = function (event) {
//     currentTool.mouseUp(event);
//   }

//   mouseMove = function (event) {
//     const minMovement = mouse.getViewPort().pixelSize;
//     if (event.movementX >= minMovement ||
//       event.movementY >= minMovement) {
//     }

//     switch (event.buttons) {
//       case 0:     // No button down while moving
//         currentTool = builder;
//         break;

//       case 1:     // Left button down while moving
//       case 2:     // Right button down while moving
//         if (!mouse.clickedBlock) {
//           currentTool = boxSelection;
//         }
//         break;

//       case 4:     // Middle button down while moving
//         currentTool = mover;
//         break;

//       default:
//         break;
//     }

//     currentTool.mouseMove(event);
//   }

//   keyDown = function (event) {
//     currentTool.keyDown(event);
//   }

//   keyUp = function (event) {
//     currentTool.keyUp(event);
//   }
// }

// export {
//   ToolManager
// }