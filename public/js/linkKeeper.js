const links = {};

function getLinks() {
  return links;
}

function addLink(parentID, childID) {
  if (!links.hasOwnProperty(parentID)) {
    // This parent is not in the list
    // Add parent to the list
    links[parentID] = {};
  }
  // Add child to parent
  links[parentID][childID] = childID;
}

function removeChild(parentID, childID) {
  try {
    delete links[parentID][childID];
  } catch (e) {
    console.error(e);
  }
}

function removeParent(parentID) {
  delete links[parentID];
}

export {
  getLinks,
  addLink,
  removeChild,
  removeParent
}