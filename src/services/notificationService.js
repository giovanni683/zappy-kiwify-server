// notificationService.js

let ioInstance;

function setSocketIo(io) {
  ioInstance = io;
}

function sendNotification(data) {
  if (ioInstance) {
    ioInstance.emit('notification', data);
  }
}

module.exports = {
  setSocketIo,
  sendNotification,
};
