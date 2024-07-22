import {io} from 'socket.io-client';

let socket;
let socketDetails = {status: 'disconnected'};

function socketConnection(token) {
  return new Promise((resolve, reject) => {
    socket = io.connect(
      // `https://sukam-api.cargator.org/?token=${token}`,
      `http://192.168.1.101:3001?token=${token}`,
      // `https://bfd9-114-79-174-61.ngrok-free.app?token=${token}`,
      {transports: ['websocket'], forceNew: true},
    );

    socket.on('connect', () => {
      console.log('socket connected');
      socketDetails.status = 'connected';
      // Toast.show({
      //   type: 'success',
      //   text1: 'You are online',
      //   visibilityTime: 2000,
      // });
      resolve(socket);
    });

    socket.on('disconnect', (reason,details) => {
      console.log(reason,'socket disconnected',details);
      socketDetails.status = 'disconnected';
      // Toast.show({
      //   type: 'error',
      //   text1: 'You are offline',
      //   visibilityTime: 2000,
      // });
    });

    socket.on('connect_error', error => {
      console.log('socket connect error', error);
      // Toast.show({
      //   type: 'error',
      //   text1: 'You are offline',
      // });
      //? disconneting socket if the socket is trying to reconnect after connection error
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
