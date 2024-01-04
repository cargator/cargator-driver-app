import {io} from 'socket.io-client';
import Toast from 'react-native-toast-message';

let socket;
let socketDetails = {status: 'disconnected'};

function socketConnection(token) {
  return new Promise((resolve, reject) => {
    socket = io.connect(
      `https://cab-e-socket-service-dev-fa3ocuxbpq-el.a.run.app?token=${token}`,
      // `http://192.168.1.101:3001?token=${token}`,
      {transports: ['websocket']},
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

    socket.on('disconnect', () => {
      console.log('socket disconnected');
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
