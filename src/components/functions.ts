import {PermissionsAndroid, Platform, Linking} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {
  setGpsPermission,
  setLocationPermission,
  setUserImgExists,
  setlivelocation,
} from '../redux/redux';
import {Toast} from 'react-native-toast-message/lib/src/Toast';
import {
  check,
  checkMultiple,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import {getPreSignedUrl} from '../services/userservices';
import RNFetchBlob from 'rn-fetch-blob';
// import {dummy_Path} from '../map-screen/dummyData';

export const requestGpsPermission = async (dispatch: any) => {
  try {
    // console.log(`requestGpsPermission called !`);

    Platform.OS == 'android' &&
      RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
        interval: 10000,
        fastInterval: 5000,
      })
        .then(data => {
          // The user has accepted to enable the location services
          // data can be :
          //  - "already-enabled" if the location services has been already enabled
          //  - "enabled" if user has clicked on OK button in the popup
          // console.log(`promptForEnableLocationIfNeeded data :>> `, data);

          Geolocation.getCurrentPosition(
            position => {
              const {coords} = position;
              // console.log(`requestGpsPermission position :>> `, position);
              dispatch(setlivelocation(coords));
            },
            (error: any) => {
              console.log(`requestGpsPermission error :>> `, error);
              if (error.message == 'Location permission not granted.') {
                dispatch(setLocationPermission(false));
              }
              if (error.code == 2) {
                // console.log(`requestGpsPermission error.code == 2`);
                dispatch(setGpsPermission(false));
              }
            },
            // {enableHighAccuracy: false, timeout: 15000, maximumAge: 10000},
            {enableHighAccuracy: false, timeout: 15000},
          );

          dispatch(setGpsPermission(true));
        })
        .catch(error => {
          // The user has not accepted to enable the location services or something went wrong during the process
          // "error" : { "code" : "ERR00|ERR01|ERR02|ERR03", "message" : "message"}
          // codes :
          //  - ERR00 : The user has clicked on Cancel button in the popup
          //  - ERR01 : If the Settings change are unavailable
          //  - ERR02 : If the popup has failed to open
          //  - ERR03 : Internal error

          console.log(`promptForEnableLocationIfNeeded error :>> `, error);
          dispatch(setGpsPermission(false));
        });
  } catch (error) {
    console.log(`requestGpsPermission error :>> `, error);
  }
};

export const checkLocationPermission = async (dispatch: any) => {
  try {
    // console.log(`checkLocationPermission called !`);
    let locationPermission: any;

    function handleLocationPermission() {
      // console.log(`handleLocationPermission :>> `, {locationPermission});

      if (locationPermission == 'granted') {
        dispatch(setGpsPermission(true));
        Geolocation.getCurrentPosition(
          position => {
            const {coords} = position;
            // console.log(`checkLocationPermission position :>> `, position);
            dispatch(setlivelocation(coords));
          },
          (error: any) => {
            console.log(`checkLocationPermission error :>> `, error);
            if (error.message == 'Location permission not granted.') {
              dispatch(setLocationPermission(false));
            }
            if (error.code == 2) {
              dispatch(setGpsPermission(false));
            }
          },
          // {enableHighAccuracy: false, timeout: 15000, maximumAge: 10000},
          {enableHighAccuracy: false, timeout: 15000},
        );
        // if (Platform.OS == 'android' &&Platform.Version > 29 && BackgroundLocation != 'granted') {}
        dispatch(setLocationPermission(true));
        // dispatch(setInfoVisible(true));
      } else {
        // Toast.show({
        //   type: 'error',
        //   text1: 'Please allow location permission.',
        // });
        // // Linking.openSettings();
        // setTimeout(() => {
        //   Linking.openSettings();
        // }, 2000);
        dispatch(setLocationPermission(false));
        return;
      }
    }

    if (Platform.OS == 'android') {
      checkMultiple([
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      ]).then(statuses => {
        // console.log(`checkLocationPermission statuses :>> `, statuses);

        if (
          statuses['android.permission.ACCESS_COARSE_LOCATION'] == 'granted' ||
          statuses['android.permission.ACCESS_FINE_LOCATION'] == 'granted'
        ) {
          locationPermission = 'granted';
        }

        handleLocationPermission();
      });
    } else if (Platform.OS == 'ios') {
      check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(result => {
        switch (result) {
          case RESULTS.GRANTED:
            console.log('The permission is granted');
            locationPermission = 'granted';
            break;

          default:
            console.log('IOS LOCATION_PERMISSION error :>> ', result);
            break;
        }

        handleLocationPermission();
      });
    } else {
      console.log('checkLocationPermission :>> New Platform !');
      return;
    }
  } catch (error) {
    console.log('Error checking location permission', error);
  }
};

export const requestLocationPermission = async (dispatch: any) => {
  try {
    // console.log(`requestLocationPermission called !`);

    let locationPermission;

    if (Platform.OS == 'android') {
      locationPermission = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);
      // console.log({locationPermission});

      if (
        locationPermission['android.permission.ACCESS_COARSE_LOCATION'] ==
          'granted' ||
        locationPermission['android.permission.ACCESS_FINE_LOCATION'] ==
          'granted'
      ) {
        locationPermission = 'granted';
      }
    } else if (Platform.OS == 'ios') {
      locationPermission = await Geolocation.requestAuthorization('whenInUse');
    } else {
      console.log('requestLocationPermission :>> New OS/Platform.');
      return;
    }
    // console.log(`requestLocationPermission locationPermission :>> `, locationPermission);

    if (locationPermission == 'granted') {
      Geolocation.getCurrentPosition(
        position => {
          const {coords} = position;
          // console.log(`checkLocationPermission position :>> `, position);
          dispatch(setlivelocation(coords));
        },
        (error: any) => {
          console.log(`requestLocationPermission error :>> `, error);
          if (error.message == 'Location permission not granted.') {
            // Toast.show({
            //   type: 'error',
            //   text1: 'Please allow location permission.',
            // });
            dispatch(setLocationPermission(false));
          }
          if (error.code == 2) {
            // console.log(`requestLocationPermission error.code == 2`);
            dispatch(setGpsPermission(false));
          }
        },
        // {enableHighAccuracy: false, timeout: 15000, maximumAge: 10000},
        {enableHighAccuracy: false, timeout: 15000},
      );
      // if (Platform.OS == 'android' &&Platform.Version > 29 && BackgroundLocation != 'granted') {}
      dispatch(setLocationPermission(true));
      // dispatch(setInfoVisible(true));
    } else {
      Toast.show({
        type: 'error',
        text1: 'Please allow location permission.',
      });
      // Linking.openSettings();
      setTimeout(() => {
        Linking.openSettings();
      }, 2000);
      return;
    }
  } catch (error) {
    console.log('Error requesting location permission', error);
  }
};

export const FetchUserImage = async (
  dispatch: any,
  profileImageKey: string,
  userId: any,
) => {
  const fileExtension = profileImageKey.split('.').pop();
  const data = {
    key: profileImageKey,
    ContentType: `image/${fileExtension}`,
    type: 'get',
  };
  const resp: any = await getPreSignedUrl(data);
  const response = await RNFetchBlob.config({
    path: `${RNFetchBlob.fs.dirs.CacheDir}/${userId}.${fileExtension}`, // Set the destination path in the cache directory
  }).fetch('GET', resp?.url);
  if (response.respInfo.status === 200) {
    console.log('Image successfully stored in cache');
    // You can now use the locally cached image from the cache directory
    const cachedImagePath = response.path();
    dispatch(
      setUserImgExists({
        exists: true,
        path: cachedImagePath,
      }),
    );
  } else {
    console.error(
      'Failed to download image. Status code: ',
      response.respInfo.status,
    );
  }
};
