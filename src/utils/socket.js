import {io} from 'socket.io-client';

let socket;
let socketDetails = {status: 'disconnected'};

function socketConnection(token) {
  return new Promise((resolve, reject) => {
    socket = io.connect(
      `https://sukam-api.cargator.org/?token=${token}`,
      // `http://192.168.1.101:3002?token=${token}`,
      // `https://bfd9-114-79-174-61.ngrok-free.app?token=${token}`,
      {transports: ['websocket'], forceNew: true,jsonp: true},
    );

    socket

    socket.on('connect', () => {
      console.log('socket connected');
      socketDetails.status = 'connected';
      const engine = socket.io.engine;
  console.log('first name :>>',engine.transport.name); // in most cases, prints "polling"

  engine.once("upgrade", () => {
    // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
    console.log('name: >>',engine.transport.name); // in most cases, prints "websocket"
  });

  engine.on("packet", ({ type, data }) => {
    // called for each packet received
  });

  engine.on("packetCreate", ({ type, data }) => {
    // called for each packet sent
  });

  engine.on("drain", () => {
    // called when the write buffer is drained
  });

  engine.on("close", (reason) => {
    console.log('reason :>> ', reason);
    // called when the underlying connection is closed
  });
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
    console.log("socket disconnected>>>>>>>>>>>>>>");
    await socket.disconnect();
  }
}

// import {io} from 'socket.io-client';

// let socket;
// let socketDetails = {status: 'disconnected'};

// function socketConnection(token) {
//   return new Promise((resolve, reject) => {
//     socket = io.connect(
//       // `https://sukam-api.cargator.org/?token=${token}`,
//       `http://192.168.1.101:3002?token=${token}`,
//       // `https://bfd9-114-79-174-61.ngrok-free.app?token=${token}`,
//       {
//         transports: ['websocket'],
//         forceNew: true,
//         reconnection: true,
//         reconnectionAttempts: 5,
//         reconnectionDelay: 1000,
//         reconnectionDelayMax: 5000, // Optional: Max delay between reconnection attempts
//         randomizationFactor: 0.5, // Optional: Randomization factor for reconnection delay
//         timeout: 20000, // Optional: Timeout for connection
//       },
//     );

//     socket.on('connect', () => {
//       console.log('Socket connected');
//       socketDetails.status = 'connected';
//       resolve(socket);
//     });

//     socket.on('disconnect', reason => {
//       console.log('Socket disconnected', reason);
//       socketDetails.status = 'disconnected';
//     });

//     socket.on('connect_error', error => {
//       console.log('Socket connection error', error);
//       reject('Error in Socket Connection');
//     });

//     socket.on('reconnect_attempt', attemptNumber => {
//       console.log(`Reconnection attempt #${attemptNumber}`);
//     });

//     socket.on('reconnect_error', error => {
//       console.log('Reconnection error', error);
//     });

//     socket.on('reconnect_failed', () => {
//       console.log('Reconnection failed');
//       socketDetails.status = 'disconnected';
//     });

//     socket.on('reconnect', attemptNumber => {
//       console.log(`Reconnected on attempt #${attemptNumber}`);
//       socketDetails.status = 'connected';
//     });
//   });
// }

// export async function getSocketInstance(token) {
//   if (socket && socket.connected) {
//     return socket;
//   } else {
//     return await socketConnection(token);
//   }
// }

// export async function socketDisconnect() {
//   if (socket && socket.connected) {
//     await socket.disconnect();
//     console.log('Socket manually disconnected');
//   }
// }
