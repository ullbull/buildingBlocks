import * as tools from './tools.js';
import * as mouse from './mouse.js';
import * as layers from './layers.js';

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

function drawTool(options = {}) {
  try {
    currentTool.draw(options);
    boxSelection.draw(options)
  }
  catch(error) {
    console.error(error);
  }
}

function mouseDown(event) {
  currentTool.mouseDown(event);
  boxSelection.mouseDown(event);
}

function mouseUp(event) {
  currentTool.mouseUp(event);
}

function mouseMove(event) {
  if (event.ctrlKey || event.altKey) {
    boxSelection.mouseMove(event);
  }

  const minMovement = mouse.getViewport().pixelSize;
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
  layers.background.refresh();
}

function keyUp(event) {
  boxSelection.keyUp(event);
  currentTool.keyUp(event);
}

function onFocus(event) {
  // NOTE:
  // Last selected blocks should draw on alt key down and not draw on alt key up.
  // But if user alt-tabs to switch to another window, the alt key up wont be registered.
  // When switching back the last selected blocks will remain visible.
  // Calling keyUp here to handle this issue.
  keyUp(event);
}






export {
  builder,
  drawTool,
  mouseDown,
  mouseUp,
  mouseMove,
  keyDown,
  keyUp,
  onFocus,
}




// currentTool = boxSelection;
// function mouseDown(event) {
//   currentTool.mouseDown(event);
// }

// function mouseUp(event) {
//   currentTool.mouseUp(event);
// }

// function mouseMove(event) {
//   currentTool.mouseMove(event);
// }

// function keyDown(event) {
//   currentTool.keyDown(event);
// }

// function keyUp(event) {
//   currentTool.keyUp(event);
// }



