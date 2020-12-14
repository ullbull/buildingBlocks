const users = require('./users_njs.js');
const fileManager = require('./fileManager.js');
const dataKeeper_2 = require('./dataKeeper_2_njs.js');

function subscribe(sectionNames, socket) {
  console.log(`User ${socket.id} subscribing to ${sectionNames}`);

  // GET RID OF THIS!
  // Leave all rooms
  let user = users.getUser(socket.id);
  if (user) {
    user.subscriptions.forEach(sectionName => {
      socket.leave(sectionName);
    });
  }

  // Add user
  user = users.addUser(socket.id, sectionNames);

  // Join rooms
  sectionNames.forEach(sectionName => {
    socket.join(sectionName);
  });

  console.log('user joined', user);

  // Welcome current user
  socket.emit('message', `Welcome to room ${sectionNames}`);

  // Send sections to client
  socket.emit('sections', fileManager.getSections(sectionNames));

  // Send to all users is the same section as this user.
  // Do not send to itself.
  sectionNames.forEach(sectionName => {
    socket.broadcast.to(sectionName).emit('message',
      `${user.id} has joined us`
    );
  })

  // // Send users and room info
  // io.to(user.room).emit('roomUsers', {
  //   room: user.room,
  //   users: getRoomUsers(user.room)
  // }); 
}

function receiveBlocks(blocksArray, socket, io) {
  // Add the blocks on server
  const sectionNames = dataKeeper_2.addBlocks(blocksArray);
  
  sendToAllInSections('blocksArray', blocksArray, io, sectionNames);
  resetHiddenBlocks(socket.id, io);

  // Save all sections where a block has been added
  fileManager.saveSectionsToFiles(sectionNames);
}

function resetHiddenBlocks(userId, io) {
  // Send empty hidden block ID array to all clients
  const blockIDs = [];
  io.emit('hiddenBlockIDs', { userId, blockIDs });
}

function sendToAllClients(type, payload, io) {
  io.emit(type, payload);
}

function sendToAllClientsExceptSender(type, payload, socket) {
  socket.broadcast.emit(type, payload);
}

function sendToAllInSections(type, payload, io, sectionNames){

  // Could probably use one of socket.io's built in functions instead
  const userIDs = users.getUserIDsInSections(sectionNames);
  // Just comparing booth methods. They return the same info
  const userIDs_2 = users.getUserIDsInSections_2(sectionNames);
  
  userIDs.forEach(userID => {
    sendToOneClient(type, payload, io, userID);
  });
}

function sendToOneClient(type, payload, io, id) {
  io.to(id).emit(type, payload);
}

module.exports = {
  subscribe,
  receiveBlocks,
  sendToAllClients,
  sendToAllClientsExceptSender,
  sendToAllInSections,
  sendToOneClient,
}