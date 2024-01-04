import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import './images/IMG_20230725_140459.jpg';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const SplashScreen = ({navigation}: any) => {
  return (
    <View style={{width: wp(100), height: hp(100)}}>
      <ImageBackground
        source={require('./images/IMG_20230725_140459.jpg')} // Replace 'path_to_your_image' with the actual path or URL of your image
        style={{
          width: wp(100),
          height: hp(100),
          alignItems: 'center',
          justifyContent: 'center',
          padding: hp(8),
        }} // Adjust the width and height according to your image dimensions
      >
        <Text
          style={{
            marginTop: hp(15),
            fontWeight: '600',
            color: '#0B0B61',
            fontSize: hp(2.5),
          }}>
          Welcome on the Driver App
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('LocationPermissionScreen')}
          style={{
            width: wp(20),
            height: hp(5),
            marginTop: hp(5),
            // backgroundColor: '#CEE3F6',
            backgroundColor: 'blue',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: wp(1),
            padding: wp(1),
          }}>
          <Text style={{color: 'white'}}>Next</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
};

export default SplashScreen;
