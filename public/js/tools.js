import { SelectionBox } from './SelectionBox.js';
import * as helpers from './helpers.js';


let selectedBlocks = {};

const builder = {
  draw: function (viewport) {
    console.log("builder draw");

  },
  mouseDown: function (event, viewport) {
    console.log("builder mouse down");
  },
  mouseUp: function (event, viewport) {
    console.log("building");
  },
  mouseMove: function (event, viewport) {
    // console.log("builder mouseMove");
  },
  keyDown: function (event, viewport) {

  },
  keyUp: function (event, viewport) {

  }
}

const mover = {
  draw: function (viewport) {
    console.log("mover draw");

  },
  mouseDown: function (event, viewport) {
  },
  mouseUp: function (event, viewport) {
  },
  mouseMove: function (event, viewport) {
    // console.log("mover mouseMove");

    viewport.x -= event.movementX / viewport.pixelSize;
    viewport.y -= event.movementY / viewport.pixelSize;
  },
  keyDown: function (event, viewport) {
  },
  keyUp: function (event, viewport) {
  }
}

const boxSelection = {
  // selectionBox: {
  //   x: 0,
  //   y: 0,
  //   width: 0,
  //   height: 0,
  //   color: 'rgba(200,200,255,0.5)'
  // },


  draw: function (viewport) {
    this.selectionBox.Draw(viewport);
  },
  mouseDown: function (event, viewport) {
    if (typeof this.selectionBox == 'undefined') { this.selectionBox = new SelectionBox(viewport); }
    this.selectionBox.SetX(helpers.getXGrid(event.x, viewport.pixelSize));
    this.selectionBox.SetY(helpers.getYGrid(event.y, viewport.pixelSize));
  },
  mouseUp: function (event, viewport) {
  },
  mouseMove: function (event, viewport) {




    this.selectionBox.SetWidth(viewport.CanvasXToWorld(event.x) - this.selectionBox.x);
    this.selectionBox.SetHeight(viewport.CanvasYToWorld(event.y) - this.selectionBox.y);

    for (const key in this.selectionBox.gridPoints) {
      if (this.selectionBox.gridPoints.hasOwnProperty(key)) {
        if (event.buttons == 1) {   // Left button down
          // addToSelectedBlocks(helpers.getBlockByKey(viewport, key));
        }
        if (event.buttons == 2) {   // Right button down
          // removeFromSelectedBlocks(helpers.getBlockByKey(viewport, key))
        }
      }
    }

  },
  keyDown: function (event, viewport) {
  },
  keyUp: function (event, viewport) {
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