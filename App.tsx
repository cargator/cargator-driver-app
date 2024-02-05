/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {Appearance, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {Provider, useDispatch, useSelector} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import LoginScreen from './src/pre-login/LoginScreen';
import MapScreen from './src/post-login/MapScreen';
import store, {persistor} from './src/redux/redux';
import Toast from 'react-native-toast-message';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';
import LoginOtpScreen from './src/pre-login/LoginOtpScreen';
import {
  checkLocationPermission,
  requestLocationPermission,
} from './src/components/functions';
import LocationPermissionScreen from './src/components/LocationPermissionScreen';
import GPSPermissionScreen from './src/components/GPSPermissionScreen';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Profile from './src/post-login/Profile';
import PreviousRides from './src/post-login/PreviousRides';
import DeviceInfo from 'react-native-device-info';
// import DestinationScreen from './src/components/DestinationScreen';
// import LocationPermissionScreen from './src/components/LocationPermissionScreen';
// import SplashScreen from './src/components/SplashScreen';
// import {enableLatestRenderer} from 'react-native-maps';

// enableLatestRenderer();

Appearance.setColorScheme('light');
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const MapScreenDrawer = () => {
  const [versionNumber, setVersionNumber] = useState("");

  useEffect(() => {
    const getVersion = async () => {
      const version = DeviceInfo.getVersion();
      setVersionNumber(version);
    };

    getVersion();
  }, []);
  return (
    <Drawer.Navigator screenOptions={{headerShown: false}}>
      <Drawer.Screen
        name="Home"
        component={MapScreen}
        // options={{
        //   drawerItemStyle: {display: 'none'},
        // }}
      />
      <Drawer.Screen name="Profile" component={Profile} />
      <Drawer.Screen name="Previous Rides" component={PreviousRides} />
      <Drawer.Screen
        name="VersionScreen"
        component={MapScreenDrawer}
        options={{
          drawerLabel: () => (
            <View style={{flex: 1 ,alignItems: 'center', marginTop: '250%'}}>
              <Text>{`Version ${versionNumber}`}</Text>
            </View>
          ),
        }}/>
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

  // console.log({gpsPermission, locationPermission});
  // const infoVisible = useSelector((store: any) => store.infoVisible);
  // const userId = useSelector((store: any) => store.userId);

  useEffect(() => {
    // do stuff while splash screen is shown
    // After having done stuff (such as async tasks) hide the splash screen
    SplashScreen.hide();
    requestLocationPermission(dispatch);
    checkLocationPermission(dispatch);
  }, []);

  return (
    <SafeAreaProvider style={{backgroundColor: '#ffffff'}}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="LoginScreen"
          screenOptions={{headerShown: false}}>
          {!locationPermission ? (
            <Stack.Screen
              name="LocationPermissionScreen"
              component={LocationPermissionScreen}
            />
          ) : !gpsPermission ? (
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
