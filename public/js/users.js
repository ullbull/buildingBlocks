const users = [];

// Add new user
function addUser(id) {
  const user = { 
    id,
    blockIDs : []
  };

  const index = users.findIndex(x => x.id === user.id);
  if (index == -1) {
    users.push(user);
  } else {
    user[index] = user;
  }

  return user;
}

function getUser(userId) {
  return users.find(user => user.id === userId);
}

function getAllUsers() {
  return users;
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

// Add blockIDs to user,
// creates a user if user doesn't exist
function setUserBlockIDs(userId, blockIDs) {
  let user = getUser(userId);
  if(!user) {
    user = addUser(userId);
  }
  user.blockIDs = blockIDs;
}

export {
  addUser,
  getUser,
  getAllUsers,
  removeUser,
  getRoomUsers,
  setUserBlockIDs
};