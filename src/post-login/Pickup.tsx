import OTPInputView from '@twotalltotems/react-native-otp-input';
import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Toast from 'react-native-toast-message';
import LoaderComponent from '../components/LoaderComponent';
import BackArrow from '../svg/BackArrow';
import {socketInstance} from './PetPujaScreen';
let timerTime: number;

const Pickup = ({
  setIsRideStarted,
  setWaitingTime,
  setIsPickupScreen,
  assignedRide,
}: any) => {
  const [OTP, setOTP] = useState('');
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    // console.log('\nTimers useEffect called: ', timerTime);
    timerTime = hours * 60 * 60 + minutes * 60 + seconds;
    setWaitingTime(timerTime);

    let interval: any;

    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds(sec => sec + 1); // Increase seconds by 1
        // Check if seconds reach 60 and update minutes accordingly
        if (seconds === 59) {
          setSeconds(0);
          setMinutes(min => min + 1);
        }
        // Check if minutes reach 60 and update hours accordingly
        if (minutes === 59) {
          setMinutes(0);
          setHours(hr => hr + 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [seconds, minutes, isTimerRunning]);

  const sendOTP = async (otp: any) => {
    // console.log(`sendOTP :>> `, sendOTP);
    setLoading(true);
    socketInstance?.emit('ride-update-otp-check', {
      otp,
      rideId: assignedRide._id,
    });

    socketInstance?.on('ride-update-otp-check', (body: any) => {
      setLoading(false);
      console.log('ride-update-otp-check event :>> ', body);
      body = JSON.parse(body);

      if (body.message == 'validOTP') {
        socketInstance?.emit('ride-update', {otp, rideId: assignedRide._id});
        Toast.show({
          type: 'success',
          text1: 'OTP verified. You can start the ride.',
        });
        setIsTimerRunning(false);
        setIsPickupScreen(false);
        setIsRideStarted(true);
        // dispatch(setUserData({isRideStarted: true}));
        // setIsPickupScreen(false);
        // setIsRideStarted(true);
      } else if (body.status == 403) {
        // console.warn('Invalid OTP. Please try again.');
        setOTP('');
        Toast.show({
          type: 'error',
          text1: 'Invalid OTP. Please try again.',
        });
        console.log('Invalid OTP. Please try again.');
      }
    });
  };

  // ! Removed "start-ride" button (for-now). Directly starting ride when OTP-Verified.
  const handleStartRide = () => {
    console.log(`handleStartRide Called `);
    setIsTimerRunning(false);
    setIsPickupScreen(false);
    setIsRideStarted(true);
    // dispatch(setUserData({isRideStarted: true}));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      {loading ? (
        <LoaderComponent />
      ) : (
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            gap: hp(1),
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => setIsPickupScreen(false)}
            style={{
              alignSelf: 'flex-start',
              marginLeft: wp(-6),
              marginTop: hp(2),
            }}>
            <BackArrow />
          </TouchableOpacity>
          <View style={styles.timer}>
            <Text
              style={{
                fontFamily: 'RobotoMono-Regular',
                color: 'black',
                textAlign: 'center',
              }}>
              Waiting Time: {hours.toString().padStart(2, '0')}:
              {minutes.toString().padStart(2, '0')}:
              {seconds.toString().padStart(2, '0')}
            </Text>
          </View>

          <View style={styles.timerButton}>
            <TouchableOpacity
              style={{flex: 1, justifyContent: 'center'}}
              onPress={() => setIsTimerRunning(!isTimerRunning)}>
              <Text
                style={{
                  fontFamily: 'RobotoMono-Regular',
                  textAlign: 'center',
                  color: 'white',
                }}>
                Toggle Timer
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: wp(90),
              height: hp(40),
            }}>
            <View>
              <Text
                style={{
                  fontFamily: 'RobotoMono-Regular',
                  color: 'black',
                  fontSize: wp(5),
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                Enter OTP
              </Text>

              <OTPInputView
                style={{width: wp(80), height: hp(10)}}
                pinCount={4}
                code={OTP} // You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
                onCodeChanged={code => {
                  setOTP(code);
                }}
                autoFocusOnLoad={false}
                // placeholderTextColor="black"
                selectionColor="black"
                codeInputFieldStyle={styles.underlineStyleBase}
                codeInputHighlightStyle={styles.underlineStyleHighLighted}
                keyboardType="number-pad"
                editable={true}
                onCodeFilled={code => {
                  // console.log(`Code is ${code}, you are good to go!`);
                  sendOTP(code); // API Call to Verify-OTP.
                }}
              />
            </View>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'green',
    width: wp(25),
    height: hp(5),
    alignSelf: 'center',
    borderRadius: hp(1),
  },
  timerButton: {
    backgroundColor: 'blue',
    borderWidth: 1,
    width: wp(30),
    height: hp(5),
    alignSelf: 'center',
    borderRadius: hp(1),
  },
  timer: {
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    width: wp(90),
    height: hp(5),
    alignSelf: 'center',
    borderRadius: hp(1),
    color: 'black',
    marginTop: hp(5),
  },

  borderStyleBase: {
    width: wp(10),
    height: hp(10),
    color: 'black',
  },
  borderStyleHighLighted: {
    borderColor: 'black',
  },
  underlineStyleBase: {
    width: wp(10),
    height: hp(7),
    borderWidth: 0,
    borderBottomWidth: wp(1),
    color: 'black',
    backgroundColor: 'white',
  },
  underlineStyleHighLighted: {
    borderColor: 'black',
  },

  container: {
    flex: 1,
  },
  inputContainer: {
    paddingHorizontal: hp(16),
    marginTop: hp(16),
  },
  input: {
    borderWidth: wp(1),
    borderColor: '#ccc',
    borderRadius: wp(8),
    padding: hp(10),
    fontSize: hp(16),
  },
});

export default Pickup;
