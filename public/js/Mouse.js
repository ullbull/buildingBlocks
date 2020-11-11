import * as helpers from './helpers.js';
import * as position from './positionTranslator.js';

// Must call setViewPort() before use
let viewPort;
let wp = { x: 0, y: 0 };    // World Position
let hoveredBlock = null;
let clickedBlock = null;
let insideFrame = false;
let clickAndDrag = false;
let buttonDown = false;
let leftButton = false;
let rightButton = false;
let middleButton = false;
let dragDistance = 0;

function setViewPort(viewPort_) {
  viewPort = viewPort_;
}

function getViewPort() {
  return viewPort;
}

function mouseDown(event) {
  buttonDown = true;
  dragDistance = 0;

  if (event.button == 0) {  // Left button down
    leftButton = true;
    clickedBlock = helpers.getBlockByPosition(
      wp.x, wp.y, viewPort
    );
  }
  else if (event.button == 1) {  // Middle button down 
    middleButton = true;
  }
  else if (event.button == 2) {  // Right button down 
    rightButton = true;
  }
}

function mouseUp(event) {
  buttonDown = false;
  clickAndDrag = false;

  if (event.button == 0) {  // Left button up 
    leftButton = false;
    clickedBlock = null;
  }
  else if (event.button == 1) {  // Middle button up 
    middleButton = false;
  }
  else if (event.button == 2) {  // Right button up 
    rightButton = false;
  }
}

function mouseMove(event) {
  wp = position.canvasToWorldPosition(
    event.x, event.y, viewPort
  );

  hoveredBlock = helpers.getBlockByPosition(
    wp.x, wp.y, viewPort
  );

  insideFrame = helpers.insideFrame(
    event.x, event.y, window.innerWidth,
    window.innerHeight, 20
  );

  clickAndDrag = (event.buttons > 0);

  if (event.buttons > 0) {
    dragDistance += Math.abs(event.movementX) + Math.abs(event.movementY);
  }
}

function mouseWheel(event) {

}

function keyDown(event) {

}

function keyUp(event) {

}

export {
  viewPort,
  wp,
  hoveredBlock,
  clickedBlock,
  insideFrame,
  clickAndDrag,
  buttonDown,
  leftButton,
  rightButton,
  middleButton,
  dragDistance,
  setViewPort,
  getViewPort,
  mouseDown,
  mouseUp,
  mouseMove,
  mouseWheel,
  keyDown,
  keyUp
}
