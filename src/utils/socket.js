import {io} from 'socket.io-client';

let socket;
let socketDetails = {status: 'disconnected'};

function socketConnection(token) {
  return new Promise((resolve, reject) => {
    socket = io.connect(
      // `https://sukam-api.cargator.org/?token=${token}`,
      // `http://192.168.1.101:3001?token=${token}`,
      `https://d4ab-103-134-130-212.ngrok-free.app?token=${token}`,
      {transports: ['websocket'], forceNew: true, jsonp: true},
    );

    socket;

    socket.on('connect', () => {
      console.log('socket connected');
      socketDetails.status = 'connected';
      const engine = socket.io.engine;
      console.log('first name :>>', engine.transport.name); // in most cases, prints "polling"

      engine.once('upgrade', () => {
        // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
        console.log('name: >>', engine.transport.name); // in most cases, prints "websocket"
      });

      engine.on('packet', ({type, data}) => {
        // called for each packet received
      });

      engine.on('packetCreate', ({type, data}) => {
        // called for each packet sent
      });

      engine.on('drain', () => {
        // called when the write buffer is drained
      });

      engine.on('close', reason => {
        console.log('reason :>> ', reason);
        // called when the underlying connection is closed
      });
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
