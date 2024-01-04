import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const LoaderComponent = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#B146C2" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: hp(100),
    width: wp(100),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
});

export default LoaderComponent;
