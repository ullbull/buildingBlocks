const users = require("./users_njs.js");
const fileManager = require("./fileManager.js");
const dataKeeper = require("./dataKeeper_njs.js");
const helpers = require("./helpers_njs.js");

function subscribe(sectionNames, socket) {
  console.log(`User ${socket.id} subscribing to ${sectionNames}`);
  const userID = socket.id;
  const user = users.getUser(userID);
  if (user) {
    users.addSubscriptions(userID, sectionNames);

    // Join rooms
    sectionNames.forEach((sectionName) => {
      socket.join(sectionName);
      console.log(`user ${user} joined room ${sectionName}`);
      
      // Send to user
      socket.emit("message", `You joined room ${sectionName}`);
      
      // Send to all other users in the same room
      socket.broadcast
      .to(sectionName)
      .emit("message", `${user.id} has joined us in room ${sectionName}`);
    });

    // Send new sections to client
    socket.emit("sections", fileManager.getSections(sectionNames));

    // // Send users and room info
    // io.to(user.room).emit('roomUsers', {
    //   room: user.room,
    //   users: getRoomUsers(user.room)
    // });
  }
}

function unsubscribe(sectionNames, socket) {
  console.log(`User ${socket.id} unsubscribing to ${sectionNames}`);
  const userID = socket.id;
  const user = users.getUser(userID);
  if (user) {
    users.removeSubscriptions(userID, sectionNames);

    // Leave rooms
    sectionNames.forEach((sectionName) => {
      socket.leave(sectionName);
      console.log(`user ${user} left room ${sectionName}`);
      
      // Send to user
      socket.emit("message", `You left room ${sectionName}`);
      
      // Send to all other users in the same room
      socket.broadcast
      .to(sectionName)
      .emit("message", `${user.id} has left room ${sectionName}`);
    });

    //TODO: Let the client know which sections to erase from its memory.
    // Maybe this is not needed since the client should already know this.

    //TODO: im here
    // // Send left sections to client
    // socket.emit("left_sections", fileManager.getSections(sectionNames));

    // // Send users and room info
    // io.to(user.room).emit('roomUsers', {
    //   room: user.room,
    //   users: getRoomUsers(user.room)
    // });
  }
}

function buildBlocks(blocksArray, socket, io) {
  // Add the blocks on server
  const sectionNames = dataKeeper.addBlocks(blocksArray);

  sendToAllInSections("blocks", blocksArray, io, sectionNames);
  resetHiddenBlocks(socket.id, io);

  // // Save all sections where a block has been added
  // fileManager.saveSectionsToFiles(sectionNames);

  fileManager.saveAllSectionsToFiles();
}

function moveBlocks(blocksArray, socket, io) {
  // // Delete blocks
  // const blockIDs = [];
  // blocksArray.forEach(block => blockIDs.push(block.id));
  // deleteBlocks(blockIDs, io);

  // Build blocks
  buildBlocks(blocksArray, socket, io);
}

function deleteBlocks(blockIDs, io) {
  // Delete blocks
  const sectionNames = dataKeeper.deleteBlocks(blockIDs);

  // Save all sections where a block has been deleted
  fileManager.saveSectionsToFiles(sectionNames);

  // Alert clients that blocks are deleted
  sendToAllInSections("deleteBlocks", blockIDs, io, sectionNames);
}

function resetHiddenBlocks(userId, io) {
  // Send empty hidden block ID array to all clients
  const blockIDs = [];
  io.emit("hiddenBlockIDs", { userId, blockIDs });
}

function sendToAllClients(type, payload, io) {
  io.emit(type, payload);
}

function sendToAllClientsExceptSender(type, payload, socket) {
  socket.broadcast.emit(type, payload);
}

function sendToAllInSections(type, payload, io, sectionNames) {
  // Could probably use one of socket.io's built in functions instead
  const userIDs = users.getUserIDsInSections(sectionNames);
  // Just comparing booth methods. They return the same info
  const userIDs_2 = users.getUserIDsInSections_2(sectionNames);

  userIDs.forEach((userID) => {
    sendToOneClient(type, payload, io, userID);
  });
}

function sendToOneClient(type, payload, io, id) {
  io.to(id).emit(type, payload);
}

module.exports = {
  subscribe,
  unsubscribe,
  buildBlocks,
  moveBlocks,
  deleteBlocks,
  sendToAllClients,
  sendToAllClientsExceptSender,
  sendToAllInSections,
  sendToOneClient,
};
