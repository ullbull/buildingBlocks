import * as tools from './tools.js';
import * as mouse from './mouse.js';

/*
tool move =
middle click and move

tool select =
click and drag empty space

tool build =
left click on block
or
left click empty space without dragging
*/

function ToolManager() {
  this.builder = new tools.Builder();
  this.boxSelection = new tools.BoxSelection();
  this.mover = new tools.Mover();
  this.currentTool = this.builder;

  this.drawTool = function () {
    this.currentTool.draw();
  }

  this.mouseDown = function (event) {
    if (mouse.hoveredBlock) {
      this.currentTool = this.builder;
    }

    this.currentTool.mouseDown(event);
    this.boxSelection.mouseDown(event);
  }

  this.mouseUp = function (event) {
    this.currentTool.mouseUp(event);
  }

  this.mouseMove = function (event) {
    switch (event.buttons) {
      case 0:     // No button down while moving
        this.currentTool = this.builder;
        break;

      case 1:     // Left button down while moving
      case 2:     // Right button down while moving
        if(!mouse.clickedBlock) {
          this.currentTool = this.boxSelection;
        }
        break;

      case 4:     // Middle button down while moving
        this.currentTool = this.mover;
        break;

      default:
        break;
    }

    this.currentTool.mouseMove(event);
  }

  this.keyDown = function (event) {
    this.currentTool.keyDown(event);
  }

  this.keyUp = function (event) {
    this.currentTool.keyUp(event);
  }
}

export {
  ToolManager
}