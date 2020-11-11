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

function setViewPort(viewPort_) {
  viewPort = viewPort_;
}

function getViewPort() {
  return viewPort;
}

function mouseDown(event) {
  buttonDown = true;

  if (event.button == 0) {  // Left button down
    clickedBlock = helpers.getBlockByPosition(
      wp.x, wp.y, viewPort
    );
  }
}

function mouseUp(event) {
  buttonDown = false;
  clickAndDrag = false;

  if (event.button == 0) {  // Left button up 
    clickedBlock = null;
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
  setViewPort,
  getViewPort,
  mouseDown,
  mouseUp,
  mouseMove,
  mouseWheel,
  keyDown,
  keyUp
}
