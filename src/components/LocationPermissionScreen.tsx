import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useDispatch, useSelector} from 'react-redux';
import {requestLocationPermission} from './functions';
// import LocationPermission from '../svg/LocationPermission';
import LocationPermission from '../svg/AllowGPS'
import { SafeAreaView } from 'react-native-safe-area-context';

const LocationPermissionScreen = ({navigation}: any) => {
  const dispatch = useDispatch();
  const locationPermission = useSelector((store: any) => store.locationPermission,);

  return (
    <SafeAreaView style={styles.container}>
  
    <View style={styles.imageContainer}>
      <LocationPermission />
  
      <View style={styles.overlay}>
        <Text style={styles.headingText}>Location permission required</Text>
        <Text style={styles.subHeadingText}>
          Allow ROl Drive to automatically detect your current location to show
          you available orders
        </Text>
        
        <TouchableOpacity
          onPress={() => {
            requestLocationPermission(dispatch);
          }}
          style={styles.button}>
          <Text style={styles.buttonText}>Allow</Text>
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
    // justifyContent: 'center',
  },
  imageContainer: {
    // justifyContent: 'center',
    alignItems: 'center',
    // width: wp(85),
    // height: hp(0), 
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
    fontFamily:'RobotoMono-Regular',
    fontWeight: '700',
    fontSize: wp(5),
    color: '#000000',
    textAlign: 'center',
    marginBottom: hp(2),
  },
  subHeadingText: {
    fontSize: wp(4.8),
    color: '#000000',
    textAlign: 'center',
    marginBottom: hp(2),
  },
  button: {
    width: wp(90),
    height: hp(7),
    backgroundColor: '#FF5302',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: wp(3.5),
    marginTop:hp(2)
  },
  buttonText: {
    fontSize: wp(5.5),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
export default LocationPermissionScreen;
