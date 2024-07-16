import messaging from '@react-native-firebase/messaging';
import {updateFcmToken} from '../services/rideservices';
console.log(" iam in firerv=base");


// Function to get FCM token
export const getFcmToken = async (): Promise<string | null> => {
  try {
    // Get the FCM token
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

export const getFcmTokenAndSendToBackend = async (): Promise<void> => {
  try {
    // Get the FCM token
    const token = await messaging().getToken();
    console.log('FCM Token:', token);

    // Send token to your backend
    await updateFcmToken(token);
  } catch (error) {
    console.error('Error getting or sending FCM token:', error);
  }
};

// Function to request permission to receive notifications
// Request user permission for notifications
export const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
};



// Handle background notifications

