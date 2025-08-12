
import { Server as SocketIOServer } from 'socket.io';

let ioInstance: SocketIOServer | undefined;

export function setSocketIo(io: SocketIOServer) {
  ioInstance = io;
}

export function sendNotification(data: any) {
  if (ioInstance) {
    ioInstance.emit('notification', data);
  }
}
