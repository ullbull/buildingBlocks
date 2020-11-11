import * as helpers from './helpers.js';
import * as position from './positionTranslator.js';

function Mouse(viewPort) {
  this.viewPort = viewPort;
  this.wp = { x: 0, y:0 };    // World Position
  this.hoveredBlock = null;
  this.clickedBlock = null;
  this.insideFrame = false;

  this.mouseDown = function (event) {
    if (event.button == 0) {  // Left button down
      this.clickedBlock = helpers.getBlockByPosition(
        this.wp.x, this.wp.y, this.viewPort
      );
    }
  }

  this.mouseUp = function (event) {
    if (event.button == 0) {  // Left button up 
      this.clickedBlock = null;
    }
  }

  this.mouseMove = function (event) {
    this.wp = position.canvasToWorldPosition(
      event.x, event.y, this.viewPort
    );
    this.hoveredBlock = helpers.getBlockByPosition(
      this.wp.x, this.wp.y, this.viewPort
    );
    this.insideFrame = helpers.insideFrame(
      event.x, event.y, window.innerWidth,
      window.innerHeight, 20
    );
  }

  this.keyDown = function (event) {

  }

  this.keyUp = function (event) {

  }
}