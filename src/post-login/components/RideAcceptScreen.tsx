import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const RideAcceptScreen = ({ route }: any) => {
    const { ride } = route.params;

    console.log(">>>>>>>>>>>>>>>>>>.",ride)
  
    return (
      <View style={styles.container}>
        <Text>Ride ID: {ride.rideService}</Text>
        <Text>Customer Name: {ride.customerDetails.name}</Text>
        {/* Show other ride details */}
      </View>
    );
  };

  const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: wp(100),
    height: hp(100),
  },
})

export default RideAcceptScreen;



  