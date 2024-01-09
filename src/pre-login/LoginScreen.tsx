import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Keyboard,
  ImageBackground
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { useDispatch, useSelector } from 'react-redux';
import { setPhoneNumber } from '../redux/redux';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';
import PhoneIcon from '../svg/PhoneIcon';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { login } from '../services/userservices';

const countryCode = '+91';

const LoginScreen = ({navigation}: any) => {
  const dispatch = useDispatch();
  const scrollViewRef = useRef<any>();
  const refTextInput: any = React.useRef(null);
  const liveLocation = useSelector((store: any) => store.livelocation);
  const [isSendOtpClicked, setIsSendOtpClicked] = useState(false);
  const [isTextInputSelected, setIsTextInputSelected] = useState(false);

  const handlePhoneAndCodeView = () => {
    if (isTextInputSelected) {
      refTextInput.current?.blur();
    } else {
      refTextInput.current?.focus();
    }
    setIsTextInputSelected(!isTextInputSelected);
  };

  const loginSchema = Yup.object().shape({
    mobileNumber: Yup.string()
      // .matches(/^\d{10,15}$/, 'Invalid mobile number. Only 10-15 digits allowed.')
      .matches(/^[0-9]+$/, 'Invalid mobile number.')
      .min(10, 'Mobile Number must be 10 digits only.')
      .max(10, 'Mobile Number must be 10 digits only.')
      .required('Mobile number is Required'),
  });

  const handleSendOtp = async (formValues: any) => {
    try {
      console.log(`handleSendOtp :>> `, formValues.mobileNumber);
      setIsSendOtpClicked(true);
      Keyboard.dismiss();
      // const formattedMobileNumber = `${countryCode}${formValues.mobileNumber}`;

      let test = [liveLocation.longitude, liveLocation.latitude];
      const loginData={
        mobileNumber: formValues.mobileNumber,
        type: 'driver',
        liveLocation: test,
      }
      // API Call to request OTP for Login.
      const res: any = await login(loginData)
      console.log('res', res);

      dispatch(setPhoneNumber(formValues.mobileNumber));
      // dispatch(setPhoneNumber(formattedMobileNumber));
      navigation.navigate('LoginOtpScreen', {
        mobileNumber: formValues.mobileNumber,
        // formattedMobileNumber,
      });
      setTimeout(() => {
        setIsSendOtpClicked(false);
      }, 1000);
    } catch (error: any) {
      console.log(error);
      Toast.show({
        type: 'error',
        // text1: error.message,
        text1: error.response.data.error,
      });
      setIsSendOtpClicked(false);
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
          // height: hp(100),
          height: hp(99),
          width: wp(100),
          flex: 1,
        }}
        source={require('../images/LoginBgAndroid.png')}>
        <View style={styles.bottomContainer}>
          <Formik
            initialValues={{
              mobileNumber: '',
            }}
            onSubmit={(values: any) => handleSendOtp(values)}
            validationSchema={loginSchema}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={styles.formikContainer}>
                <View>
                  <Text style={styles.textEnterNumber}>
                    Enter your mobile number
                  </Text>
                  <Text style={styles.textContinue}>to continue</Text>
                </View>

                <View style={styles.mobileInputContainer}>
                  <View
                    style={styles.mobileInputView}
                    onTouchStart={handlePhoneAndCodeView}>
                    <PhoneIcon />
                    <Text style={styles.mobileInputCountryCode}>
                      {countryCode}
                    </Text>
                  </View>

                  {errors.mobileNumber && touched.mobileNumber && (
                    <Text style={styles.mobileInputErrorText}>
                      {errors.mobileNumber.toString()}
                    </Text>
                  )}
                  <TextInput
                    ref={refTextInput}
                    keyboardType="numeric"
                    style={styles.mobileInput}
                    onChangeText={handleChange('mobileNumber')}
                    onBlur={handleBlur('mobileNumber')}
                    value={values.mobileNumber}
                    maxLength={10}
                  />
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleSubmit()}
                    disabled={isSendOtpClicked}>
                    {isSendOtpClicked && (
                      <ActivityIndicator size="small" color="#fff" />
                    )}
                    <Text style={styles.buttonText}>Send OTP</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Formik>
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
    marginTop: hp(5),
    justifyContent: 'space-between',
  },
  bottomContainer: {
    alignItems: 'center',
    backgroundColor: 'lightgrey',
    borderTopStartRadius: wp(10),
    borderTopEndRadius: wp(10),
    width: wp(100),
    height: hp(34),
    position: 'absolute',
    bottom: 0,
  },
  formikContainer: {
    flex: 1,
    justifyContent: 'space-around',
    marginVertical: hp(4),
  },
  textEnterNumber: {
    fontFamily: 'RobotoMono-Regular',
    color: 'black',
    fontSize: wp(5),
    fontWeight: '600',
  },
  textContinue: {
    fontFamily: 'RobotoMono-Regular',
    color: '#747688',
    fontSize: wp(5),
    alignSelf: 'flex-start',
    fontWeight: '600',
  },
  mobileInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileInputView: {
    zIndex: 1,
    flexDirection: 'row',
    position: 'absolute',
    left: wp(2),
    alignItems: 'center',
  },
  mobileInputCountryCode: {
    fontFamily: 'RobotoMono-Regular',
    fontSize: wp(4.5),
    marginLeft: wp(0.5),
  },
  mobileInputErrorText: {
    fontFamily: 'RobotoMono-Regular',
    fontSize: hp(2),
    color: 'red',
    position: 'absolute',
    top: hp(-2.5),
  },
  mobileInput: {
    fontFamily: 'RobotoMono-Regular',
    color: '#747688',
    width: wp(90),
    borderRadius: wp(3),
    padding: wp(2),
    backgroundColor: 'white',
    fontSize: wp(4.5),
    paddingLeft: wp(17),
    flex: 1,
  },
  buttonContainer: {
    justifyContent: 'center',
  },
  button: {
    width: wp(90),
    height: hp(6),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#118F5E',
    borderRadius: wp(3),
    flexDirection: 'row',
    gap: wp(2),
  },
  buttonText: {
    fontFamily: 'RobotoMono-Regular',
    color: 'white',
    fontSize: wp(4.5),
    fontWeight: '600',
  },
});

export default LoginScreen;
