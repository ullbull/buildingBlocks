const users = [];

// Add new user
function userJoin(id, room) {
  const user = { 
    id,
    room,
    blockIDs : []
  };

  users.push(user);

  return user;
}

function getUser(userId) {
  return users.find(user => user.id === userId);
}

// Remove user and return removed user
function removeUser(userId) {
  const index = users.findIndex(user => user.id === userId);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get all users in room
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

function setUserBlockIDs(userId, blockIDs) {
  const user = getUser(userId);
  user.blockIDs = blockIDs;
}

module.exports = {
  userJoin,
  getUser,
  removeUser,
  getRoomUsers,
  setUserBlockIDs
};
