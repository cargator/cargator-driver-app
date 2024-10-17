import {Formik} from 'formik';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import PhoneInput, {ICountry} from 'react-native-international-phone-number';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Toast from 'react-native-toast-message';
import {useDispatch} from 'react-redux';
import * as Yup from 'yup';
import {setPhoneNumber} from '../redux/redux';
import {login} from '../services/userservices';

const LoginScreen = ({navigation}: any) => {
  const dispatch = useDispatch();
  const scrollViewRef = useRef<any>();
  const refTextInput: any = React.useRef(null);
  const [isSendOtpClicked, setIsSendOtpClicked] = useState(false);
  const [isTextInputSelected, setIsTextInputSelected] = useState(false);
  const [showCountryCodeDropdown, setShowCountryCodeDropdown] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<null | ICountry>(null);
  const [phoneMask, setPhoneMask] = useState<any>('');
  const [inputValue, setInputValue] = useState<string>('##### #####');

  function handleInputValue(phoneNumber: string) {
    setInputValue(phoneNumber);
  }

  const countryMobileLengths: {[key: string]: number} = {
    IN: 10,
    US: 10,
    AE: 9,
  };

  const countryPhoneValidationRules: {[key: string]: RegExp} = {
    IN: /^\d{5}\s?\d{5}$/,
    US: /^\d{3}\s?\d{3}\s?\d{4}$/,
    AE: /^\d{2}\s?\d{3}\s?\d{4}$/,
  };

  const getValidationSchema = (countryCode: any) => {
    const phoneRegex = countryPhoneValidationRules[countryCode] || /^[0-9]+$/;
    return Yup.object().shape({
      mobileNumber: Yup.string()
        .matches(phoneRegex, 'Invalid mobile number format.')
        .required('Mobile number is required'),
    });
  };

  const countryPhoneMasks: {[key: string]: string} = {
    US: '### ### ####',
    IN: '##### #####',
    AE: '## ### ####',
  };

  function handleSelectedCountry(country: ICountry) {
    setSelectedCountry(country);
    const mask = countryPhoneMasks[country?.cca2] || '##### #####';
    setPhoneMask(mask);
  }

  useEffect(() => {
    console.log('Current Mask:', phoneMask); // Debugging the mask
  }, [phoneMask]);

  const formattedMobileNumber = (mobileNumber: string) => {
    const formattedNumber = mobileNumber.replace(/\s/g, '');
    return formattedNumber;
  };

  const handleSendOtp = async (formValues: any) => {
    try {
      setIsSendOtpClicked(true);
      const mobile_number = formattedMobileNumber(formValues.mobileNumber);
      Keyboard.dismiss();
      const loginData = {
        mobileNumber: mobile_number,
        type: 'driver',
      };
      // API Call to request OTP for Login.
      const res: any = await login(loginData);
      console.log(`handleSendOtp :>> `, res.message, mobile_number);
      dispatch(setPhoneNumber(mobile_number));
      navigation.navigate('LoginOtpScreen', {
        mobileNumber: mobile_number,
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
          height: hp(99),
          width: wp(100),
          flex: 1,
        }}
        source={require('../images/SukamExpress.png')}>
        <View style={styles.bottomContainer}>
          <Formik
            initialValues={{
              mobileNumber: '',
            }}
            onSubmit={(values: any) => handleSendOtp(values)}
            validationSchema={getValidationSchema(selectedCountry?.cca2)}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
            }) => {
              useEffect(() => {
                const number = formattedMobileNumber(values.mobileNumber);
                const expectedLength = selectedCountry
                  ? countryMobileLengths[selectedCountry.cca2] || 'AE'
                  : 'AE';
                if (number.length === expectedLength) {
                  setIsPhoneValid(true);
                } else {
                  setIsPhoneValid(false);
                }
              }, [values.mobileNumber, selectedCountry]);
              return (
                <View style={styles.formikContainer}>
                  <View>
                    <Text style={styles.textEnterNumber}>
                      Enter your mobile number
                    </Text>
                    <Text style={styles.textContinue}>to continue</Text>
                  </View>

                  <View style={styles.mobileInputContainer}>
                    {errors.mobileNumber && touched.mobileNumber && (
                      <Text style={styles.mobileInputErrorText}>
                        {errors.mobileNumber.toString()}
                      </Text>
                    )}
                    <PhoneInput
                      modalHeight="100%"
                      placeholder="Enter Mobile Number"
                      value={values.mobileNumber}
                      onChangePhoneNumber={(phoneNumber: string) => {
                        setFieldValue('mobileNumber', phoneNumber);
                      }}
                      selectedCountry={selectedCountry}
                      onChangeSelectedCountry={handleSelectedCountry}
                      defaultCountry="IN"
                      showOnly={['IN', 'AE', 'US']}
                      customMask={[phoneMask]}
                      phoneInputStyles={{
                        container: {
                          // backgroundColor: '#575757',
                          borderWidth: 1.5,
                          borderStyle: 'solid',
                          borderColor: isPhoneValid ? '#F3F3F3' : 'red',
                        },
                        flagContainer: {
                          borderTopLeftRadius: 7,
                          borderBottomLeftRadius: 7,
                          // backgroundColor: '#808080',
                          justifyContent: 'center',
                          width: wp(33),
                        },
                        //   flag: {},
                        //   caret: {
                        //     color: '#F3F3F3',
                        //     fontSize: 16,
                        //   },
                        //   divider: {
                        //     backgroundColor: '#F3F3F3',
                        //   },
                        //   callingCode: {
                        //     fontSize: 16,
                        //     fontWeight: 'bold',
                        //     color: '#F3F3F3',
                        //   },
                        //   input: {
                        //     color: '#F3F3F3',
                        //   },
                      }}
                    />
                  </View>

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        {backgroundColor: isPhoneValid ? '#118F5E' : 'gray'},
                      ]}
                      onPress={() => handleSubmit()}
                      disabled={isSendOtpClicked || !isPhoneValid} // Disable when phone isn't valid
                    >
                      {isSendOtpClicked && (
                        <ActivityIndicator size="small" color="#fff" />
                      )}
                      <Text style={styles.buttonText}>Send OTP</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    width: wp(90),
    // marginLeft: wp(20),
  },
  mobileInputView: {
    zIndex: 1,
    flexDirection: 'row',
    position: 'absolute',
    left: wp(2),
    alignItems: 'center',
  },
  mobileInputErrorText: {
    fontFamily: 'RobotoMono-Regular',
    fontSize: hp(2),
    color: 'red',
    position: 'absolute',
    top: hp(1),
    alignSelf: 'center',
    right: wp(7),
  },
  mobileInput: {
    fontFamily: 'RobotoMono-Regular',
    color: '#747688',
    width: wp(90),
    borderRadius: wp(3),
    padding: wp(2),
    backgroundColor: 'white',
    fontSize: wp(4.5),
    paddingLeft: wp(8),
    flex: 1,
    borderColor: 'grey',
    borderWidth: 1,
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
  countryCodeDropdown: {
    position: 'absolute',
    bottom: hp(16.5),
    width: wp(13),
    left: wp(4),
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'white',
    padding: 10,
    borderRadius: 5,
    textColor: 'grey',
  },
  countryCodeView: {
    height: hp(5.6),
    width: wp(15),
    zIndex: 1,
    paddingTop: hp(0.3),
    flexDirection: 'row',
    position: 'absolute',
    left: wp(3),
    top: hp(10.3),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  mobileInputCountryCode: {
    color: 'black',
    fontSize: wp(5),
    marginLeft: wp(1),
  },
});

export default LoginScreen;
