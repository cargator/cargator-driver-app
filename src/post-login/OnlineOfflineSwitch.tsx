import React from 'react';
import {Switch} from 'react-native-switch';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {View, Text, StyleSheet} from 'react-native';

const OnlineOfflineSwitch = ({isDriverOnline, driverStatusToggle}: any) => {
  return (
    <Switch
      value={isDriverOnline}
      onValueChange={driverStatusToggle}
      circleSize={hp(3.5)}
      barHeight={hp(4)}
      switchWidthMultiplier={wp(1)}
      circleActiveColor="#E8FFF3"
      // circleInActiveColor="#FFEAE9"
      circleInActiveColor="red"
      backgroundActive="#ffffff"
      backgroundInactive="#ffffff"
      renderActiveText={false}
      renderInActiveText={false}
      innerCircleStyle={{
        borderColor: isDriverOnline ? '#E8FFF3' : '#FFEAE9',
        left: isDriverOnline ? null : wp(1),
        right: isDriverOnline ? wp(1) : null,
        shadowColor: 'black',
        elevation: wp(2),
        width: wp(14),
        position: 'absolute',
      }}
      outerCircleStyle={{
        borderColor: isDriverOnline ? '#50CD89' : '#EB5757',
        borderWidth: wp(0.4),
        borderRadius: wp(5),
        left: wp(0),
      }}
      circleBorderActiveColor="green"
      renderInsideCircle={() => (
        <View style={styles.insideCircleView}>
          <Text
            style={[
              styles.insideCircleText,
              {
                color: isDriverOnline ? '#50CD89' : '#FFFFFF',
              },
            ]}>
            {isDriverOnline ? 'online' : 'offline'}
          </Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  insideCircleView: {
    flex: 1,
    justifyContent: 'center',
  },
  insideCircleText: {
    fontFamily: 'RobotoMono-Regular',
    textAlign: 'center',
  },
});

export default OnlineOfflineSwitch;
