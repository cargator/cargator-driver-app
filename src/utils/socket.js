import {io} from 'socket.io-client';

let socket;
let socketDetails = {status: 'disconnected'};

function socketConnection(token) {
  return new Promise((resolve, reject) => {
    socket = io.connect(
      // `https://sukam-api.cargator.org/?token=${token}`,
      // `http://192.168.1.1:5000?token=${token}`,
      `https://1e28-182-48-210-106.ngrok-free.app?token=${token}`,
      {transports: ['websocket'], forceNew: true, jsonp: true},
    );


    socket.on('connect', () => {
      console.log('socket connected');
      socketDetails.status = 'connected';

      resolve(socket);
    });

    socket.on('disconnect', (reason, details) => {
      console.log(reason, 'socket disconnected', details);
      socketDetails.status = 'disconnected';
    });

    socket.on('connect_error', error => {
      console.log('socket connect error', error);
      socket.disconnect();
      reject('Error in Socket Connection');
    });
  });
}

export async function getSocketInstance(token) {
  if (socket && socket.connected) {
    return socket;
  } else {
    return await socketConnection(token);
  }
}

export async function socketDisconnect() {
  if (socket && socket.connected) {
    await socket.disconnect();
  }
}
