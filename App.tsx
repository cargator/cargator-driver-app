/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import messaging from '@react-native-firebase/messaging';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  createDrawerNavigator,
} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect, useRef, useState} from 'react';
import {
  Appearance,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import 'react-native-gesture-handler';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';
import Toast from 'react-native-toast-message';
import {Provider, useDispatch, useSelector} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import RNFetchBlob from 'rn-fetch-blob';
import {
  checkLocationPermission,
  requestGpsPermission,
  requestLocationPermission,
} from './src/components/functions';
import GPSPermissionScreen from './src/components/GPSPermissionScreen';
import LocationPermissionScreen from './src/components/LocationPermissionScreen';
import LoginOtpScreen from './src/pre-login/LoginOtpScreen';
import LoginScreen from './src/pre-login/LoginScreen';
import store, {
  persistor,
  removeUserData,
  setGpsPermission,
} from './src/redux/redux';
import {requestUserPermission} from './src/utils/firebase-config';
import {socketDisconnect} from './src/utils/socket';
import {updateDeviceInfo} from './src/services/userservices';
import HomeScreen from './src/post-login/HomeScreen';
import Profile from './src/post-login/components/Profile';
import RideHistory from './src/post-login/components/RideHistory';
import { toastConfig } from './toastconfig'; // Import custom toast config
import RideAcceptScreen from './src/post-login/components/RideAcceptScreen';


const Appdrawercontent = (props: any) => {
  const dispatch = useDispatch();
  const [versionNumber, setVersionNumber] = useState('');
  const [batteryLevel, setbatteryLevel] = useState('');

  const updateDeviceInformation = async (data: any) => {
    try {
      // const res: any = await updateDeviceInfo(data);
      // console.log('device info response>>>', res);
    } catch (error: any) {
      console.log('error device info api>>', error);
    }
  };

  useEffect(() => {
    const getDeviceInfo = async () => {
      DeviceInfo.getBatteryLevel().then(level => {
        const batteryLevel = (level * 100).toFixed(0);
        const versionNumber = DeviceInfo.getVersion();
        setVersionNumber(versionNumber);
        const deviceModel = DeviceInfo.getModel();
        const deviceBrand = DeviceInfo.getBrand();
        const systemName = DeviceInfo.getSystemName();
        const systemVersion = DeviceInfo.getSystemVersion();
        const data = {
          versionNumber,
          deviceModel,
          deviceBrand,
          systemName,
          systemVersion,
          batteryLevel,
        };
        // updateDeviceInformation(data);
      });
    };

    requestUserPermission();
    // getDeviceInfo();
    requestGpsPermission(dispatch);
  }, []);

  const userImg = useSelector((store: any) => store.userImage.path);
  return (
    <View style={{flex: 1, height: '100%'}}>
      <DrawerContentScrollView
        {...props}
        contentcontainerstyle={{flex: 1, position: 'relative'}}>
        <DrawerItemList {...props} style={{borderwidth: 1}} />
        <View style={{flex: 1}}>
          <DrawerItem
            label="Logout"
            onPress={async () => {
              // await RNFetchBlob.fs.unlink(`file://${userImg}`);
              await socketDisconnect();
              dispatch(removeUserData());
            }}
          />
        </View>
      </DrawerContentScrollView>
      <View style={{alignSelf: 'center', marginBottom: hp(1)}}>
        <Text style={{fontWeight: '600'}}>{`Version ${versionNumber}`}</Text>
      </View>
    </View>
  );
};

Appearance.setColorScheme('light');
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const HomeScreenDrawer = () => {
  return (
    <Drawer.Navigator
      screenOptions={{headerShown: false, swipeEnabled: false}}
      drawerContent={props => <Appdrawercontent {...props} />}>
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Profile" component={Profile} />
      <Drawer.Screen name="RideHistory" component={RideHistory} />
    </Drawer.Navigator>
  );
};

export const Routing = () => {
  const dispatch = useDispatch();
  const loginToken = useSelector((store: any) => store.loginToken);
  const gpsPermission = useSelector((store: any) => store.gpsPermission);
  const currentOnGoingRide = useSelector((store: any) => store.currentOnGoingRide);
  const locationPermission = useSelector(
    (store: any) => store.locationPermission,
  );
  const navigationRef = useRef<any>(null);
  const navigationRefFlag = useRef<any>(true);

  useEffect(() => {
    SplashScreen.hide();
    requestLocationPermission(dispatch);
    checkLocationPermission(dispatch);
    messaging().setBackgroundMessageHandler(
      () => new Promise<void>(resolve => resolve()),
    );

    messaging().onNotificationOpenedApp((remoteMessage: any) => {
      if (navigationRef.current?.getCurrentRoute().name === 'Home') {
        navigationRef.current?.navigate('Home', {
          refresh: !navigationRefFlag.current,
        });
        navigationRefFlag.current = !navigationRefFlag.current;
      } else {
        navigationRef.current?.navigate('Home');
      }
    });

    messaging()
    .getInitialNotification()
    .then((remoteMessage: any) => {
      // Ensure the navigationRef is valid and the route is available
      const currentRoute = navigationRef.current?.getCurrentRoute();
  
      // console.log('Current Route:', currentRoute);
  
      if (currentRoute && currentRoute.name === 'Home') {
        // Force update or refresh home screen state
        navigationRef.current?.navigate('Home', {
          refresh: !navigationRefFlag.current,
        });
        navigationRefFlag.current = !navigationRefFlag.current;
      } else {
        // If currentRoute is undefined or not 'Home', navigate to 'Home'
        navigationRef.current?.navigate('Home');
      }
    })
    .catch((error) => {
      console.error('Error fetching initial notification:', error);
    });

    const unsubscribe = messaging().onMessage(async (remoteMessage: any) => {
      if (navigationRef.current?.getCurrentRoute().name === 'Home') {
        // Force update or refresh home screen state
        navigationRef.current?.navigate('Home', {
          refresh: !navigationRefFlag.current,
        });
        navigationRefFlag.current = !navigationRefFlag.current;
      } else {
        navigationRef.current?.navigate('Home');
      }
    });

    return unsubscribe;
  }, []);

  return (
    <SafeAreaProvider style={{backgroundColor: '#ffffff'}}>
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="LoginScreen"
        // initialRouteName="PetPujaScreen"
        screenOptions={{headerShown: false, orientation: 'portrait'}}>
        {!locationPermission ? (
          <Stack.Screen
            name="LocationPermissionScreen"
            component={LocationPermissionScreen}
          />
        ) : Platform.OS == 'android' && !gpsPermission ? (
          <Stack.Screen
            name="GPSPermissionScreen"
            component={GPSPermissionScreen}
          />
        ) : !loginToken ? (
          <>
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="LoginOtpScreen" component={LoginOtpScreen} />
          </>
        ) : currentOnGoingRide.length ? (
          // Show RideAcceptScreen if there is an ongoing ride
          <Stack.Screen
            name="RideAcceptScreen"
            component={RideAcceptScreen}
            initialParams={{ ride: currentOnGoingRide }} // Pass ongoing ride data
          />
        ) : (
          <>
            <Stack.Screen
              name="HomeScreenDrawer"
              component={HomeScreenDrawer}
            />
            <Stack.Screen
              name="RideAcceptScreen"
              component={RideAcceptScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  </SafeAreaProvider>
  );
};

function App(): JSX.Element {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <SafeAreaView style={styles.safeAreaView}>
          <Routing />
          <Toast config={toastConfig} />
        </SafeAreaView>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    height: hp(100),
    width: wp(100),
  },
});

export default App;
