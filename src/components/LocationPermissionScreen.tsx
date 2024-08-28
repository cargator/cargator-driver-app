import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useDispatch} from 'react-redux';
import {requestLocationPermission} from './functions';
import LocationPermission from '../svg/LocationPermission';

const LocationPermissionScreen = ({navigation}: any) => {
  const dispatch = useDispatch();
  // const locationPermission = useSelector((store: any) => store.locationPermission,);

  return (
    <View style={styles.container}>
      <View></View>

      <View style={styles.imageContainer}>
        <LocationPermission />


        <Text style={styles.headingText}>Location permission required</Text>

        <Text style={styles.subHeadingText}>
          Allow Sukam to automatically detect your current location to show
          you available orders
        </Text>
      </View>

      <TouchableOpacity
        // activeOpacity={0.9}
        onPress={() => {
          requestLocationPermission(dispatch);
          // navigation.navigate('LoginScreen');
        }}
        style={styles.button}>
        <Text style={styles.buttonText}>Allow</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: wp(85),
  },
  headingText: {
    fontWeight: '600',
    fontSize: wp(5),
    color: '#000',
    textAlign: 'center',
    marginTop: hp(4),
    marginBottom: hp(1),
  },
  subHeadingText: {
    fontSize: wp(4.8),
    color: '#464E5F',
    textAlign: 'center',
  },
  button: {
    width: wp(90),
    height: hp(7),
    backgroundColor: '#2BB180',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: wp(3.5),
  },
  buttonText: {
    fontSize: wp(5.5),
    fontWeight: '600',
    color: '#fff',
  },
});

export default LocationPermissionScreen;
