import * as helpers from './helpers.js';
import * as selector from './selector.js';

const builder = {
  draw: function () {
    console.log("builder draw");

  },
  mouseDown: function (event) {
    console.log("builder mouse down");
  },
  mouseUp: function (event) {
    console.log("building");
  },
  mouseMove: function (event) {
    // console.log("builder mouseMove");
  },
  keyDown: function (event) {

  },
  keyUp: function (event) {

  }
}

const mover = {
  draw: function () {
    console.log("mover draw");
  },
  mouseDown: function (event) {
  },
  mouseUp: function (event) {
  },
  mouseMove: function (event) {
    viewport.x -= event.movementX / viewport.pixelSize;
    viewport.y -= event.movementY / viewport.pixelSize;
  },
  keyDown: function (event, viewport) {
  },
  keyUp: function (event, viewport) {
  }
}

const boxSelection = {
  viewport: {},   // must give it a viewport
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  color: 'rgba(200,200,255,0.5)',
  gridPoints: {},

  initGridPoints: function () {
    let point = {};
    let key;
    this.gridPoints = {};

    // Create gridpoints for both positive and negative box size
    let x;
    let y;
    let width = (this.width < 0) ? this.width * -1 : this.width;
    let height = (this.height < 0) ? this.height * -1 : this.height;

    for (let w = 0; w < width; w++) {
      for (let h = 0; h < height; h++) {
        x = (this.width < 0) ? (w * -1) - 1 : w;
        y = (this.height < 0) ? (h * -1) - 1 : h;
        point = {
          x: Math.floor(this.x + x),
          y: Math.floor(this.y + y)
        };
        key = helpers.positionToKey(point.x, point.y);
        this.gridPoints[key] = 'SelectionBox';
      }
    }
  },

  setWidth: function (width) {
    this.width = width;
    this.initGridPoints();
  },

  setHeight: function (height) {
    this.height = height;
    this.initGridPoints();
  },

  draw: function () {
    this.viewport.DrawRectangle(this.x, this.y, this.width, this.height, this.color);
  },

  //////////////////////////////////////////

  mouseDown: function (event) {
    if (!(event.ctrlKey || event.buttons == 2)) {      
      // Reset selected blocks
      selector.resetBlocks();
    }

    this.setWidth(0);
    this.setHeight(0);
    this.x = helpers.getXGrid(event.x, this.viewport.pixelSize);
    this.y = helpers.getYGrid(event.y, this.viewport.pixelSize);
  },

  mouseUp: function (event) {
  },

  mouseMove: function (event) {
    if (event.buttons == 1 || event.buttons == 2) {
    // Left or right button down
    this.setWidth(this.viewport.CanvasXToWorld(event.x) - this.x);
    this.setHeight(this.viewport.CanvasYToWorld(event.y) - this.y);

    for (const key in this.gridPoints) {
      if (this.gridPoints.hasOwnProperty(key)) {
        if (event.buttons == 1) {   // Left button down
          selector.addBlock(helpers.getBlockByKey(this.viewport, key));
        }
        if (event.buttons == 2) {   // Right button down
          selector.removeBlock(helpers.getBlockByKey(this.viewport, key))
        }
      }
    }

    }
  },
  keyDown: function (event) {
    // if (event.key == 'Control') {
    //   // Add to selected blocks
    //   selector.addBlock(hoveredBlock);
    // }

    // if (event.key == 'Alt') {
    //   event.preventDefault();
    //   // Remove from selected blocks
    //   selector.removeBlock(hoveredBlock);
    // }
  },
  keyUp: function (event) {
  }
}





// function moveViewport(event, viewport) {
//   viewport.x -= event.movementX / viewport.pixelSize;
//   viewport.y -= event.movementY / viewport.pixelSize;
// }

// function boxSelection(event, selectionBox, mouse) {
//   selectionBox.SetWidth(mouse.GetXWorldPosition() - selectionBox.x);
//   selectionBox.SetHeight(mouse.GetYWorldPosition() - selectionBox.y);

//   for (const key in selectionBox.gridPoints) {
//     if (selectionBox.gridPoints.hasOwnProperty(key)) {
//       if (event.buttons == 1) {   // Left button down
//         addToSelectedBlocks(helpers.getBlockByKey(viewport, key));
//       }
//       if (event.buttons == 2) {   // Right button down
//         removeFromSelectedBlocks(helpers.getBlockByKey(viewport, key))
//       }
//     }
//   }
// }

export {
  builder,
  mover,
  boxSelection
}