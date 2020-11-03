const builder = {
  mouseDown: function (event, viewport) {
    console.log("builder mouse down");
  },
  mouseUp: function (event, viewport) {
    console.log("building");
  },
  mouseMove: function (event, viewport) {

  },
  keyDown: function (event, viewport) {

  },
  keyUp: function (event, viewport) {

  }
}

const mover = {
  mouseDown: function (event, viewport) {
  },
  mouseUp: function (event, viewport) {
  },
  mouseMove: function (event, viewport) {
    viewport.x -= event.movementX / viewport.pixelSize;
    viewport.y -= event.movementY / viewport.pixelSize;
  },
  keyDown: function (event, viewport) {
  },
  keyUp: function (event, viewport) {
  }
}

const boxSelection = {
  mouseDown: function (event, viewport) {
  },
  mouseUp: function (event, viewport) {
  },
  mouseMove: function (event, viewport) {
    console.log('boxSelection');
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