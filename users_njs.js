const helpers = require('./helpers_njs.js');

const users = {};

// Add new user
function addUser(id, sectionNames) {
  const user = {
    id,
    subscriptions: sectionNames,
    blockIDs: []
  };

  users[id] = user;

  return user;
}

// function getUser(userID) {
//   return users.find(user => user.id === userID);
// }

function getUser(userID) {
  return users[userID];
}

// // Remove user and return removed user
// function removeUser(userId) {
//   const index = users.findIndex(user => user.id === userId);

//   if (index !== -1) {
//     return users.splice(index, 1)[0];
//   }
// }

// Remove user and return removed user
function removeUser(userID) {
  const user = helpers.copyObject(users[userID]);
  delete users[userID];
  return user;
}

// Get all users in room
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

function setUserBlockIDs(userID, blockIDs) {
  const user = getUser(userID);
  user.blockIDs = blockIDs;
}

function addSubscriptions(userID, sectionNames) {
  const user = getUser(userID);
  if (!user) {
    console.error('Could not find user', userID);
  }
  sectionNames.forEach(sectionName => {
    user.subscriptions.push(sectionName);
  });
}

function removeSubscriptions(userID, sectionNames) {
  const user = getUser(userID);
  if (!user) {
    console.error('Could not find user', userID);
  }
  sectionNames.forEach(sectionName => {
    const index = user.subscriptions.findIndex(x => x == sectionName);
    if (index !== -1) {
      user.subscriptions.splice(index, 1);
    }
  });
}

module.exports = {
  addUser,
  getUser,
  removeUser,
  getRoomUsers,
  setUserBlockIDs,
  addSubscriptions,
  removeSubscriptions
};
