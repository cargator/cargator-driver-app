import messaging from '@react-native-firebase/messaging';
import {updateFcmToken} from '../services/rideservices';
import {PermissionsAndroid, Platform} from 'react-native';
console.log(' iam in firerv=base');

export async function requestUserPermission() {
  console.log(
    'PermissionsAndroid.RESULTS.granted',
    PermissionsAndroid.RESULTS.GRANTED,
  );
  if (Platform.OS == 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    console.log('grantedgranted', granted);
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      getFcmToken();
    } else {
      console.log('permission denied');
    }
  } else {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      getFcmToken();
    }
  }
}

export const getFcmToken = async () => {
  try {
    await messaging().registerDeviceForRemoteMessages();

    const token = await messaging().getToken();
    console.log('NEW FCM_TOKEN', token);
    await updateFcmToken({token});

    return token;
  } catch (error) {
    console.log('error during generating token', error);
  }
};

// Function to get FCM token
// export const getFcmToken = async (): Promise<string | null> => {
//   try {
//     // Get the FCM token
//     const token = await messaging().getToken();
//     console.log('FCM Token:', token);
//     return token;
//   } catch (error) {
//     console.error('Error getting FCM token:', error);
//     return null;
//   }
// };

export const getFcmTokenAndSendToBackend = async (): Promise<void> => {
  try {
    // Get the FCM token
    const token = await messaging().getToken();
    console.log('FCM Token:', token);

    const data = {token}
    // Send token to your backend
    const res = await updateFcmToken(data);
    console.log("token updated successfully");
    
  } catch (error) {
    console.error('Error getting or sending FCM token:', error);
  }
};

// Function to request permission to receive notifications
// Request user permission for notifications
// export const requestUserPermission = async () => {
//   const authStatus = await messaging().requestPermission();
//   const enabled =
//     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//   if (enabled) {
//     console.log('Authorization status:', authStatus);
//   }
// };

// Handle background notifications
