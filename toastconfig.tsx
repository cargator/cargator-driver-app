// toastConfig.js

import React from 'react';
import { View, Text } from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

// Custom Toast Configuration
export const toastConfig = {
  success: ({ text1 }: any) => (
    <View
      style={{
        height: hp(7),
        width: wp(90),
        backgroundColor: '#FFFFFF', // Custom background color
        borderRadius: 8,
        borderWidth: 1,
        borderColor:'#FF5302',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop:hp(3)
      }}>
      <Text style={{ color: '#FF5302', fontSize: 16, fontWeight: 'bold' }}>
        {text1}
      </Text>
    </View>
  ),
  
  // Add other types if needed (e.g., 'error', 'info', etc.)
};
