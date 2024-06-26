import React, {useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Keyboard,
  ImageBackground,
  Platform,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useDispatch} from 'react-redux';
import {setLoginToken, setUserData, setUserId} from '../redux/redux';
import customAxios from '../services/appservices';
import Toast from 'react-native-toast-message';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import RightArrow from '../svg/RightArrow';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import { login, verifyOtp } from '../services/userservices';

const LoginOtpScreen = ({route}: any) => {
  const dispatch = useDispatch();
  const scrollViewRef = useRef<any>();
  const [OTP, setOTP] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isOtpEntered, setIsOtpEntered] = useState(false);
  // const [user, setUser] = useState<any>();

  const handleContinueBtn = async () => {
    console.log(`handleContinueBtn called`);
    if (!isOtpVerified) {
      Toast.show({
        type: 'error',
        text1: 'Please enter OTP.',
      });
      return;
    }
    // navigation.navigate('MapScreen');
    // dispatch(setUserId(user._id));
    // dispatch(setLoginToken(user.token));
  };

  const sendOTP = async (otp: any) => {
    try {
      console.log(`sendOTP >> otp :>> `, otp);
      setIsOtpEntered(true);
      Keyboard.dismiss();
      const otpData={
        otp,
        type: 'driver',
        mobileNumber: route.params.mobileNumber,
      }
      // API Call to verify Login-OTP.
      const res: any = await verifyOtp(otpData)
      console.log('res', res);

      if (res.status == 200) {
        console.log('OTP verified.');
        Toast.show({
          type: 'success',
          text1: 'OTP verified. Press continue.',
        });
        setIsOtpVerified(true);
        setOTP(otp);
        // res.user.token = res.token;
        // setUser(res.user);
        dispatch(setUserData(res.user));
        dispatch(setUserId(res.user._id));
        dispatch(setLoginToken(res.token));
        setTimeout(() => {
          setIsOtpEntered(false);
        }, 1000);
      }
    } catch (error: any) {
      setOTP('');
      console.log(`sendOTP >> error :>> `, error);
      Toast.show({
        type: 'error',
        // text1: error.response.data.message,
        text1: error.response.data.error,
      });
      setIsOtpEntered(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      console.log(`handleResendOTP called`);
      setOTP('');
      const data = {
        mobileNumber: route.params.mobileNumber,
        type: 'driver',
      }
      // API Call to again request OTP for Login (same as in LoginScreen).
      const res: any = await login(data)
      console.log('res', res);

      Toast.show({
        type: 'success',
        text1: 'New OTP Sent !',
      });
    } catch (error: any) {
      console.log(`handleResendOTP error :>> `, error);
      Toast.show({
        type: 'error',
        // text1: error.response.data.message,
        text1: error.response.data.error,
      });
    }
  };

  return (
    <KeyboardAwareScrollView
      ref={scrollViewRef}
      onContentSizeChange={() =>
        scrollViewRef.current.scrollToEnd({animated: true})
      }
      keyboardShouldPersistTaps="always"
      automaticallyAdjustKeyboardInsets={true}
      contentContainerStyle={styles.keyboardAwareScrollView}>
      <ImageBackground
        style={{
          // height:hp(90),
          // height: Platform.OS == 'android' ? hp(100) : hp(90),
          height: Platform.OS == 'android' ? hp(99) : hp(90),
          width: wp(100),
          flex: 1,
        }}
        source={
          Platform.OS == 'android'
            ? require('../images/LoginBgAndroid.png')
            : require('../images/LoginBgIos.png')
        }>
        <View style={styles.bottomContainer}>
          <View>
            <Text style={styles.textEnterCode}>
              Enter the 4 digit code sent to
            </Text>
            <Text style={styles.textCountryCode}>
              {/* {route.params.formattedMobileNumber} */}
              +91 {route.params.mobileNumber}
            </Text>

            <View style={styles.otpContainer}>
              <OTPInputView
                style={styles.otpInput}
                pinCount={4}
                code={OTP}
                onCodeChanged={code => {
                  setOTP(code);
                }}
                autoFocusOnLoad={false}
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

            <TouchableOpacity
              style={styles.resendOtpLink}
              onPress={handleResendOTP}>
              <Text style={styles.resendOtpLinkText}>Resend OTP</Text>
            </TouchableOpacity>

            <View style={styles.continueBtnContainer}>
              <TouchableOpacity
                style={styles.continueBtn}
                // disabled={!isOtpVerified}
                disabled={isOtpEntered}
                onPress={() => handleContinueBtn()}>
                {isOtpEntered && (
                  <ActivityIndicator size="small" color="#fff" />
                )}

                <Text style={styles.continueBtnText}>Continue</Text>

                <View style={styles.continueBtnArrowIcon}>
                  <RightArrow />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  keyboardAwareScrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp(6),
  },
  bottomContainer: {
    alignItems: 'center',
    backgroundColor: 'lightgrey',
    borderTopStartRadius: wp(10),
    borderTopEndRadius: wp(10),
    width: wp(100),
    height: hp(35),
    position: 'absolute',
    // bottom: Platform.OS=='android' ? 0: hp(5),
    bottom: 0,
  },
  textEnterCode: {
    fontFamily: 'RobotoMono-Regular',
    color: '#747688',
    fontSize: wp(5),
    marginTop: hp(4),
    alignSelf: 'flex-start',
    fontWeight: '400',
  },
  textCountryCode: {
    fontFamily: 'RobotoMono-Regular',
    color: 'black',
    fontSize: wp(5),
    alignSelf: 'flex-start',
    fontWeight: '400',
  },
  otpContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpInput: {
    fontFamily: 'RobotoMono-Regular',
    width: wp(50),
    height: hp(8.5),
  },
  underlineStyleBase: {
    width: wp(6),
    height: hp(7),
    borderWidth: wp(0),
    borderBottomWidth: wp(1),
    color: 'black',
    fontSize: wp(6),
    borderColor: '#118F5E',
    fontWeight: '600',
  },
  underlineStyleHighLighted: {
    borderColor: 'white',
  },
  resendOtpLink: {
    alignSelf: 'center',
  },
  resendOtpLinkText: {
    fontFamily: 'RobotoMono-Regular',
    color: '#747688',
    fontSize: hp(2.2),
  },
  continueBtnContainer: {
    justifyContent: 'center',
  },
  continueBtn: {
    width: wp(90),
    height: hp(6),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#118F5E',
    borderRadius: wp(3),
    marginTop: hp(2),
    flexDirection: 'row',
    gap: wp(2),
  },
  continueBtnText: {
    fontFamily: 'RobotoMono-Regular',
    color: 'white',
    fontSize: wp(4.5),
    fontWeight: '600',
  },
  continueBtnArrowIcon: {
    position: 'absolute',
    right: wp(7),
  },
});

export default LoginOtpScreen;
