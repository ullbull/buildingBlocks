const links = {};

function getLinks() {
  return links;
}

function getChildren(parentID, data) {
  const children = {};
  if (links.hasOwnProperty(parentID)) {
    for (const key in links[parentID]) {
      if (links[parentID].hasOwnProperty(key)) {
        const childID = links[parentID][key];

        if (data.hasOwnProperty(childID)) {
          children[childID] = data[childID];
        } else { console.error(`ID"${childID}" not found in data ${data}`) }
      } else { console.error('error in getChildren()') }
    }
  } else { console.error(`ID"${parentID}" has no children`) }

  return children;
}

function ADD(parentID, childID) {
  if (parentID == undefined || childID == undefined) {
    throw ('Got undefined id');
  }
  if (parentID == childID) {
    throw (parentID + " ParentID and childID are the same!");
  }

  if (!links.hasOwnProperty(parentID)) {
    // This parent is not in the list
    // Add parent to the list
    links[parentID] = {};
  }
  // Add child to parent
  links[parentID][childID] = childID;
}

function addLinkID(parentID, childID) {
  try {
    ADD(parentID, childID);
  } catch (e) {
    console.error(e);
  }
}

function addLinkObject(parent, child) {
  addLinkID(parent.id, child.id);
}

function addChildrenToParent(parent, children) {
  for (const key in children) {
    if (children.hasOwnProperty(key)) {
      const child = children[key];
      addLinkObject(parent, child);
    }
  }
}

function removeChildID(parentID, childID) {
  try {
    delete links[parentID][childID];
  } catch (e) {
    console.error(e);
  }
}

function removeParentID(parentID) {
  delete links[parentID];
}

export {
  getLinks,
  getChildren,
  addLinkID,
  addLinkObject,
  addChildrenToParent,
  removeChildID,
  removeParentID
}