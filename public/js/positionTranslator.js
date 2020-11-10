function worldXToViewport(x, viewPort) {
  x -= viewPort.x;
  x = toValueViewport(x, viewPort);
  return x;
}

function worldYToViewport(y, viewPort) {
  y -= viewPort.y;
  y = toValueViewport(y, viewPort);
  return y;
}

function toValueViewport(value, viewPort) {
  return value * viewPort.pixelSize;
}

// Actual position to grid position
function valueToGridValue(value, viewPort) {
  return Math.floor(value / viewPort.pixelSize);
}

function canvasXToWorld(x, viewPort) {
  if (!viewPort) {
    console.error('viewPort is undefined');
    return;
  }
  return Math.floor((x / viewPort.pixelSize) + viewPort.x);
}

function canvasYToWorld(y, viewPort) {
  if (!viewPort) {
    console.error('viewPort is undefined');
    return;
  }
  return Math.floor((y / viewPort.pixelSize) + viewPort.y);
}

function canvasToWorldPosition(x, y, viewPort) {
  return {
    'x': canvasXToWorld(x, viewPort),
    'y': canvasYToWorld(y, viewPort)
  };
}

export {
  worldXToViewport,
  worldYToViewport,
  toValueViewport,
  valueToGridValue,
  canvasXToWorld,
  canvasYToWorld,
  canvasToWorldPosition
}