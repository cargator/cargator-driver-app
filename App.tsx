/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {
  Appearance,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import LoginScreen from './src/pre-login/LoginScreen';
import MapScreen from './src/post-login/MapScreen';
import store, { persistor, removeRideDetails, removeUserData, setDriverAppFlow, setRideDetails } from './src/redux/redux';
import Toast from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';
import LoginOtpScreen from './src/pre-login/LoginOtpScreen';
import {
  checkLocationPermission,
  requestLocationPermission,
} from './src/components/functions';
import LocationPermissionScreen from './src/components/LocationPermissionScreen';
import GPSPermissionScreen from './src/components/GPSPermissionScreen';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  createDrawerNavigator,
} from '@react-navigation/drawer';
import Profile from './src/post-login/Profile';
import PreviousRides from './src/post-login/PreviousRides';
import DeviceInfo from 'react-native-device-info';
import { socketDisconnect } from './src/utils/socket';
import RNFetchBlob from 'rn-fetch-blob';
import CustomMapScreen from './src/post-login/CustomMapScreen';
import { getDriverAppFlowAPI } from './src/services/userservices';
// import DestinationScreen from './src/components/DestinationScreen';
// import LocationPermissionScreen from './src/components/LocationPermissionScreen';
// import SplashScreen from './src/components/SplashScreen';
// import {enableLatestRenderer} from 'react-native-maps';

// enableLatestRenderer();

const Appdrawercontent = (props: any) => {
  const dispatch = useDispatch();
  const [versionNumber, setVersionNumber] = useState('');

  useEffect(() => {
    const getVersion = async () => {
      const version = DeviceInfo.getVersion();
      setVersionNumber(version);
    };

    getVersion();
  }, []);
  const userImg = useSelector((store: any) => store.userImage.path);
  return (
    <View style={{ flex: 1, height: '100%' }}>
      <DrawerContentScrollView
        {...props}
        contentcontainerstyle={{ flex: 1, position: 'relative' }}>
        <DrawerItemList {...props} style={{ borderwidth: 1 }} />
        <View style={{ flex: 1 }}>
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
      <View style={{ alignSelf: 'center', marginBottom: hp(1) }}>
        <Text style={{ fontWeight: '600' }}>{`Version ${versionNumber}`}</Text>
      </View>
    </View>
  );
};

Appearance.setColorScheme('light');
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

//   const [versionNumber, setVersionNumber] = useState('');

//   useEffect(() => {
//     const getVersion = async () => {
//       const version = DeviceInfo.getVersion();
//       setVersionNumber(version);
//     };

//     getVersion();
//   }, []);
//   return (
//     <Drawer.Navigator
//       screenOptions={{headerShown: false}}
//       drawerContent={props => <Appdrawercontent {...props} />}>
//       <Drawer.Screen
//         name="Home"
//         component={MapScreen}
//         // options={{
//         //   drawerItemStyle: {display: 'none'},
//         // }}
//       />
//       <Drawer.Screen name="Profile" component={Profile} />
//       <Drawer.Screen name="Previous Rides" component={PreviousRides} />
//     </Drawer.Navigator>
//   );
// };

const MapScreenDrawer = () => {
  const dispatch = useDispatch();
  const [versionNumber, setVersionNumber] = useState('');
  const driverAppFlow = useSelector((store: any) => store.driverAppFlow);
  console.log("from redux 1",driverAppFlow)

  useEffect(() => {
    const getVersion = async () => {
      const version = DeviceInfo.getVersion();
      setVersionNumber(version);
    };

    getVersion();
  }, []);
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false }}
      drawerContent={props => <Appdrawercontent {...props} />}>
      {driverAppFlow === "default" ? (
        <Drawer.Screen
          name="Home"
          component={MapScreen}
        // options={{
        //   drawerItemStyle: {display: 'none'},
        // }}
        />
      ) : (
        <Drawer.Screen
          name="Home"
          component={CustomMapScreen}
        // options={{
        //   drawerItemStyle: {display: 'none'},
        // }}
        />
      )
      }
      <Drawer.Screen name="Profile" component={Profile} />
      <Drawer.Screen name="Previous Rides" component={PreviousRides} />
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
  const driverAppFlow = useSelector((store: any) => store.driverAppFlow);
  console.log("from redux2+++++++-",driverAppFlow)

  // console.log({gpsPermission, locationPermission});
  // const infoVisible = useSelector((store: any) => store.infoVisible);
  // const userId = useSelector((store: any) => store.userId);

  useEffect(() => {
    // do stuff while splash screen is shown
    // After having done stuff (such as async tasks) hide the splash screen

    const getDriverAppFlow = async () => {
      try {
        const res = await getDriverAppFlowAPI();
        console.log("-from api--------",res.data[0].applicationFLow)
        if (driverAppFlow !== res.data[0].applicationFLow) {
          console.log("hello")
          dispatch(removeRideDetails());
          dispatch(setDriverAppFlow(res.data[0].applicationFLow))
        }
      } catch (error) {
        console.log("error", error)
      }
    }
    getDriverAppFlow();
   
    SplashScreen.hide();

    requestLocationPermission(dispatch);
    checkLocationPermission(dispatch);
  }, []);

  return (
    <SafeAreaProvider style={{ backgroundColor: '#ffffff' }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="LoginScreen"
          screenOptions={{ headerShown: false, orientation: 'portrait' }}>
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

  // ! OLD CODE:
  // return (
  //   <SafeAreaProvider style={{backgroundColor: '#ffffff'}}>
  //     <NavigationContainer>
  //       <Stack.Navigator
  //         initialRouteName="LocationPermissionScreen"
  //         screenOptions={{headerShown: false}}>
  //         {/* {infoVisible && locationPermission ? ( */}
  //         {infoVisible ? (
  //           <>
  //             {!userId ? (
  //               <>
  //                 <Stack.Screen name="LoginScreen" component={LoginScreen} />
  //                 <Stack.Screen
  //                   name="LoginOtpScreen"
  //                   component={LoginOtpScreen}
  //                 />
  //               </>
  //             ) : (
  //               <>
  //                 <Stack.Screen name="MapScreen" component={MapScreen} />
  //                 <Stack.Screen
  //                   name="DestinationScreen" // ride-end status screen
  //                   component={DestinationScreen}
  //                 />
  //               </>
  //             )}
  //           </>
  //         ) : (
  //           <>
  //             {/* <Stack.Screen name="SplashScreen" component={SplashScreen} /> */}
  //             <Stack.Screen
  //               name="LocationPermissionScreen"
  //               component={LocationPermissionScreen}
  //             />
  //           </>
  //         )}
  //       </Stack.Navigator>
  //       <Toast />
  //     </NavigationContainer>
  //   </SafeAreaProvider>
  // );
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
