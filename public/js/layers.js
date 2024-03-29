import * as blockHider from './blockHider.js';
import * as selector from './selector.js';
import * as toolManager from './toolManager.js';
import { appStatus } from './appStatus.js';
import * as workerManager from './workerManager.js';

let fillColor = 'rgba(160,140,135,1)';
const highlightColor = 'rgba(170,70,50,0.5)';
const margins = 20;

let viewport;
function setViewport(viewport_) {
  viewport = viewport_
}

function setCanvasToWindowSize() {
  const width = innerWidth;
  const height = innerHeight;

  for (let i = 0; i < canvases.length; i++) {
    canvases[i].width = width - margins;
    canvases[i].height = height - margins;
  }
}

const canvases = document.getElementsByTagName('canvas');
setCanvasToWindowSize();

const cBackground = canvases[0].getContext('2d');
const cForeground = canvases[1].getContext('2d');

function refreshAll() {
  layers.forEach(layer => {
    layer.refresh();
  });
}

const foreground = {
  context: cForeground,
  changed: false,
  refresh: function () {
    this.changed = true;
  },
  draw: function (forceRefresh = false) {
    if (forceRefresh) { this.changed = true; }
    if (this.changed) {
      this.changed = false;

      // Clear frame
      this.context.clearRect(0, 0, viewport.width, viewport.height);

      // Draw tool
      toolManager.drawTool({
        context: this.context
      });

      // Draw selected blocks
      viewport.DrawBlocks(selector.getBlocks(), {
        name: "selected",
        color: highlightColor,
        context: this.context
      });

      // Draw workers
      viewport.DrawWorkers(workerManager.getWorkers(), {
        context: this.context
      });
    }
  }
}

const background = {
  context: cBackground,
  changed: false,
  refresh: function () {
    this.changed = true;
  },
  draw: function (forceRefresh = false) {
    if (forceRefresh) { this.changed = true; }
    if (this.changed) {
      this.changed = false;

      // Clear frame
      this.context.clearRect(0, 0, viewport.width, viewport.height);

      // Draw blocks
      viewport.DrawAllBlocks({
        hiddenBlockIDs: blockHider.getHiddenBlockIDs(),
        context: this.context
      });

      viewport.DrawGrid({
        context: this.context
      });

      if (appStatus.debug) {
        viewport.DrawAllGridpixels({
          alphaValue: 0.5,
          context: this.context
        });
      }
    }
  }
}

const layers = [
  foreground,
  background
];

export {
  setViewport,
  setCanvasToWindowSize,
  refreshAll,
  foreground,
  background,
}