"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSocketIo = setSocketIo;
exports.sendNotification = sendNotification;
let ioInstance;
function setSocketIo(io) {
    ioInstance = io;
}
function sendNotification(data) {
    if (ioInstance) {
        ioInstance.emit('notification', data);
    }
}
