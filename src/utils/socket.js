import {io} from 'socket.io-client';
import { riderLoginHours } from '../services/userservices';

let socket;
let socketDetails = {status: 'disconnected'};
let loginTime=null;
let logOutTime=null


function socketConnection(token) {
  return new Promise((resolve, reject) => {
    socket = io.connect(
      // `https://sukam-api.cargator.org/?token=${token}`,
      `http://192.168.1.46:3001?token=${token}`,
      // `https://2dbf-182-48-213-167.ngrok-free.app?token=${token}`,
      {transports: ['websocket']},
    );

    socket.on('connect', () => {
      console.log('socket connected');
      loginTime=new Date();
      socketDetails.status = 'connected';
      // Toast.show({
      //   type: 'success',
      //   text1: 'You are online',
      //   visibilityTime: 2000,
      // });
      resolve(socket);
    });

    socket.on('disconnect', async () => {
      
      logOutTime=new Date();
      const totalLoginTime=((logOutTime-loginTime)%60000)/1000
      console.log(totalLoginTime);
      const body={time:Math.round(totalLoginTime)}
      console.log("socket disconnected");
      socketDetails.status = 'disconnected';
      try {
        await riderLoginHours(body)
      } catch (error) {
        console.log(error);
      }
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
