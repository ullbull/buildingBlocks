const timer = require('./timer.js');

const users = [];

// Adds a new user.
// Overwrites user if user ID already exists
// Returns the added user
function addUser(id, sectionNames) {
  const newUser = {
    id,
    subscriptions: sectionNames,
    blockIDs: []
  };

  const index = users.findIndex(user => user.id == id)
  if (index != -1) {
    users[index] = newUser;
  } else {
    users.push(newUser)
  }

  return newUser;
}

// Returns user or undefined if user doesn't exist
function getUser(userID) {
  return users.find(user => user.id === userID);
}

// Remove user and return removed user or
// undefined if user doesn't exist
function removeUser(userId) {
  const index = users.findIndex(user => user.id === userId);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Returns all users in room
function getRoomUsers(room) {
  const requestedUsers = []

  users.forEach(user => {
    const index = user.subscriptions.findIndex(subscription => {
      return subscription == room
    });
    if (index !== -1) {
      requestedUsers.push(user)
    }
  })
  return requestedUsers;
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

function getUserIDsInSections(sectionNames) {
  timer.resetTimer();
  const userIDs = [];

  sectionNames.forEach(sectionName => {
    const usersInSection = getRoomUsers(sectionName);
    usersInSection.forEach(user => {
      const index = userIDs.findIndex(userID => userID == user.id);
      if (index === -1) {
        userIDs.push(user.id);
      }
    })
  });

  console.log(`getUserIDsInSection() finished in ${timer.getPassedTime()} milliseconds.`);
  console.log('returning userIDs:', userIDs);
  return userIDs;
}

function getUserIDsInSections_2(sectionNames) {
  timer.resetTimer();
  const uids = {};

  sectionNames.forEach(sectionName => {
    const usrids = getUserIDsInSection(sectionName);
    usrids.forEach(id => {
      uids[id] = id;
    })
  })

  const userIDs = Object.values(uids);

  console.log(`getUserIDsInSection_2() finished in ${timer.getPassedTime()} milliseconds.`);
  console.log('returning userIDs:', userIDs);
  return userIDs;
}

function getUserIDsInSection(sectionName) {
  const userIDs = [];
  const users = getRoomUsers(sectionName);
  users.forEach(user => {
    userIDs.push(user.id);
  });
  return userIDs;
}

module.exports = {
  addUser,
  getUser,
  removeUser,
  getRoomUsers,
  setUserBlockIDs,
  addSubscriptions,
  removeSubscriptions,
  getUserIDsInSections,
  getUserIDsInSections_2,
  getUserIDsInSection
};
