const appStatus = {
  moveViewport: false,
  moveBlock: false,
  addBlock: false,
  movedDistance: 0,
  hideSelectionBox: true,
  // debug: false,
  debug: true,

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

export {
  appStatus
}