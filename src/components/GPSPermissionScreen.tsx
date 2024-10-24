import React, {useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useDispatch} from 'react-redux';
import {requestGpsPermission, requestLocationPermission} from './functions';
import GPSPermission from '../svg/TurnOnGPS'
import { SafeAreaView } from 'react-native-safe-area-context';
import { setGpsPermission } from '../redux/redux';

const GPSPermissionScreen = ({navigation}: any) => {
  const dispatch = useDispatch();
  // const locationPermission = useSelector((store: any) => store.locationPermission,);

  useEffect(() => {
    requestGpsPermission(dispatch);
  }, []);

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.imageContainer}>
        <GPSPermission />


        <View style={styles.overlay}>
        <Text style={styles.headingText}>GPS Turned Off</Text>
        <Text style={styles.subHeadingText}>
          Allow RolDrive to turn on your phone GPS for accurate pickup
        </Text>
      

      <TouchableOpacity
        // activeOpacity={0.9}
        onPress={() => {
          // navigation.navigate('SplashScreen');
          // dispatch(setGpsPermission(true));
          requestLocationPermission(dispatch);
          requestGpsPermission(dispatch);
        }}
        style={styles.button}>
        <Text style={styles.buttonText}>Turn On GPS</Text>
      </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: wp(100),
    height: hp(95),
    paddingHorizontal: wp(5),
  },
  headingText: {
    fontWeight: '700',
    fontSize: wp(5),
    color: '#000000',
    textAlign: 'center',
  },
  subHeadingText: {
    fontSize: wp(4.8),
    color: '#464E5F',
    textAlign: 'center',
    marginVertical:hp(3)
  },
  button: {
    width: wp(90),
    height: hp(7),
    backgroundColor: '#FF5302',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: wp(3.5),
    marginTop:hp(3)
  },
  buttonText: {
    fontSize: wp(5.5),
    fontWeight: '600',
    color: '#fff',
  },
});

export default GPSPermissionScreen;
