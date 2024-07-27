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
import React, {useEffect, useState} from 'react';
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
  requestLocationPermission,
} from './src/components/functions';
import GPSPermissionScreen from './src/components/GPSPermissionScreen';
import LocationPermissionScreen from './src/components/LocationPermissionScreen';
import HistoryPage from './src/post-login/petPoojaComponent/HistoryPage';
import PetPujaScreen from './src/post-login/PetPujaScreen';
import Profile from './src/post-login/Profile';
import LoginOtpScreen from './src/pre-login/LoginOtpScreen';
import LoginScreen from './src/pre-login/LoginScreen';
import store, {persistor, removeUserData} from './src/redux/redux';
import {requestUserPermission} from './src/utils/firebase-config';
import {socketDisconnect} from './src/utils/socket';

const Appdrawercontent = (props: any) => {
  const dispatch = useDispatch();
  const [versionNumber, setVersionNumber] = useState('');

  useEffect(() => {
    const getVersion = async () => {
      const version = DeviceInfo.getVersion();
      setVersionNumber(version);
    };

    messaging().setBackgroundMessageHandler(
      () => new Promise<void>(resolve => resolve()),
    );

    messaging().onNotificationOpenedApp((remoteMessage: any) => {
      props.navigation.navigate('Home', {notification: true});
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage: any) => {
        props.navigation.navigate('Home', {notification: true});
      });

    requestUserPermission();
    getVersion();
    const unsubscribe = messaging().onMessage(async (remoteMessage: any) => {
      props.navigation.navigate('Home', {notification: true});
    });

    return unsubscribe;
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
              await RNFetchBlob.fs.unlink(`file://${userImg}`);
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

const MapScreenDrawer = () => {
  return (
    <Drawer.Navigator
      screenOptions={{headerShown: false, swipeEnabled: false}}
      drawerContent={props => <Appdrawercontent {...props} />}>
      <Drawer.Screen name="Home" component={PetPujaScreen} />
      <Drawer.Screen name="Profile" component={Profile} />
      <Drawer.Screen name="Order History" component={HistoryPage} />
    </Drawer.Navigator>
  );
};

export const Routing = () => {
  const dispatch = useDispatch();
  const loginToken = useSelector((store: any) => store.loginToken);
  const gpsPermission = useSelector((store: any) => store.gpsPermission);
  const locationPermission = useSelector(
    (store: any) => store.locationPermission,
  );
  useEffect(() => {
    SplashScreen.hide();
    requestLocationPermission(dispatch);
    checkLocationPermission(dispatch);
  }, []);

  return (
    <SafeAreaProvider style={{backgroundColor: '#ffffff'}}>
      <NavigationContainer>
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
          ) : (
            <>
              <Stack.Screen
                name="MapScreenDrawer"
                component={MapScreenDrawer}
              />
            </>
          )}
        </Stack.Navigator>
        <Toast />
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
