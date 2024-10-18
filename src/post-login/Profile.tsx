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
import {
  launchCamera,
  Asset,
  CameraOptions,
  ImagePickerResponse,
} from 'react-native-image-picker';
import ImagePicker from 'react-native-image-crop-picker';
import {getS3SignUrlApi, updateVehicleImageKey} from '../services/userservices';
import axios from 'axios';
import {Buffer} from 'buffer';
import {
  FetchVehicleImage,
  requestCameraPermission,
} from '../components/functions';
import {useDispatch, useSelector} from 'react-redux';
import SidebarIcon from '../svg/SidebarIcon';
import moment from 'moment';
import LoaderComponent from '../components/LoaderComponent';
import {userDetails} from '../services/rideservices';
import {useIsFocused} from '@react-navigation/native';
import LogOutIcon from '../svg/LogOutIcon';
import {socketDisconnect} from '../utils/socket';
import {
  removeUserData,
  setVehicleImageKey,
  setVehicleImgExists,
} from '../redux/redux';
import {isEmpty} from 'lodash';
import RNFetchBlob from 'rn-fetch-blob';
import {FetchUserImage} from '../components/functions';
import {Button} from 'react-native-elements';
import Toast from 'react-native-toast-message';
import ImageUpload from '../svg/imageUpload';
import {randomLoderColor} from '../svg/helper/constant';

const Profile = (props: any) => {
  const userId = useSelector((store: any) => store.userData._id);
  const userImg = useSelector((store: any) => store.userImage.path);
  const vehicleImage = useSelector((store: any) => store.vehicleImage.path);
  let vehicleImageKey = useSelector((store: any) => store.vehicleImageKey);
  const profileImageKey = useSelector(
    (store: any) => store.userData.profileImageKey,
  );
  const userData = useSelector((store: any) => store.userData);
  const [driverDetails, setDriverDetails] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const [formattedDate, setFormattedDate] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const handleLogout = async () => {
    try {
      await RNFetchBlob.fs.unlink(`file://${userImg}`);
      socketDisconnect();
      dispatch(removeUserData());
    } catch (error) {
      console.log('error while logging out', error);
    }
  };

  const getDriverDetail = async () => {
    try {
      setLoading(true);
      const response: any = await userDetails(userId);
      setDriverDetails(response.data);
      dispatch(setVehicleImageKey(response.data?.vehicleData.profileImageKey));
      if (!vehicleImageKey) {
        vehicleImageKey = response.data?.vehicleData.profileImageKey;
      }
      setFormattedDate(moment(response.data.createdAt).format('D MMMM, YYYY'));
    } catch (error) {
      console.log('Driver Detail error :>> ', error);
    } finally {
      setLoading(false);
    }
  };

  async function getS3SignUrl(key: string, contentType: string, type: string) {
    try {
      const headers = {'Content-Type': 'application/json'};
      const response: any = await getS3SignUrlApi(
        {
          key,
          contentType,
          type,
        },
        {headers},
      );

      return response.url;
    } catch (error: any) {
      console.log('error while getting S3SignedUrl', error);
    }
  }

  const fetchvehicleImageExists = async () => {
    try {
      // setIsUploading(true)
      // console.log(
      //   'fetching vehicle Image.....as he may have cleared cache',
      //   vehicleImageKey,
      // );
      await FetchVehicleImage(dispatch, vehicleImageKey, userId);
    } catch (error) {
      console.log('error in checkVehicleImageExists', error);
    }
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Camera permission is required to use this feature.',
      );
      return;
    }

    ImagePicker.openCamera({
      width: 1000,
      height: 1000,
      mediaType: 'photo',
      saveToPhotos: true,
      cropping: true,
      compressImageMaxWidth: 1000,
      compressImageMaxHeight: 1000,
      compressImageQuality: 0.8,
    })
      .then(image => {
        setImageUri(image.path);
        uploadImage(image.path);
      })
      .catch(error => {
        console.log('Camera Error: ', error.message);
      });
  };

  // const openCamera = async () => {
  //   const hasPermission = await requestCameraPermission();
  //   if (!hasPermission) {
  //     Alert.alert(
  //       'Permission Denied',
  //       'Camera permission is required to use this feature.',
  //     );
  //     return;
  //   }

  //   const options: CameraOptions = {
  //     mediaType: 'photo',
  //     maxWidth: 1000,
  //     maxHeight: 1000,
  //     quality: 0.8,
  //     saveToPhotos: true,
  //   };

  //   launchCamera(options, (response: ImagePickerResponse) => {
  //     if (response.didCancel) {
  //     } else if (response.errorCode) {
  //       console.log('ImagePicker Error: ', response.errorMessage);
  //     } else if (response.assets && response.assets.length > 0) {
  //       const photoUri = response.assets[0].uri || null;
  //       if (photoUri) {
  //         // Resize the image
  //         ImageResizer.createResizedImage(photoUri, 1000, 1000, 'JPEG', 80)
  //           .then(resizedImage => {
  //             setImageUri(resizedImage.uri || null);
  //             uploadImage(resizedImage.uri);
  //           })
  //           .catch(err => {
  //             console.log('Error resizing image: ', err);
  //           });
  //       }
  //       // setImageUri(photoUri || null);
  //       // uploadImage(photoUri);
  //     }
  //   });
  // };

  const uploadImage = async (photoUri: string | null) => {
    if (!photoUri) return;

    setIsUploading(true);

    try {
      const key = `vehicles/vehicleimage/${userId}.jpg`;

      const contentType = 'image/*';
      const presignedUrl = await getS3SignUrl(key, contentType, 'put');
      const strippedUri = photoUri.replace('file://', ''); //

      const fileContent = await RNFetchBlob.fs.readFile(strippedUri, 'base64'); // The file will read and returned as a Base64 string

      const buffer = Buffer.from(fileContent, 'base64'); //This line creates a Buffer object from the Base64-encoded string
      try {
        const result = await axios.put(presignedUrl, buffer);
        if (result.status === 200) {
          const response: any = await updateVehicleImageKey({
            userId: userId,
            imageKey: key,
            photoUri: photoUri,
          });
          if (response) {
            await fetchvehicleImageExists();
          }
          // setIsUploading(false);
          Toast.show({
            type: 'success',
            text1: `VEHICLE IMAGE UOLOADED SUCCESSFULLY !`,
            visibilityTime: 5000,
          });
        }
        setIsUploading(false);
      } catch (error) {
        console.log('error while uploading vehicle image', error);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'An error occurred while uploading the image.');
      setIsUploading(false);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      getDriverDetail();
    } else {
      setDriverDetails([]);
    }
  }, [isFocused]);

  const checkImageExists = async () => {
    try {
      const exists = await RNFetchBlob.fs.exists(userImg);
      if (!exists) {
        // console.log('fetching user Image.....as he may have cleared cache');
        await FetchUserImage(dispatch, profileImageKey, userId);
      }
    } catch (error) {
      console.log('error in checkProfileImageExists', error);
    }
  };
  useEffect(() => {
    checkImageExists();
    fetchvehicleImageExists();
  }, []);

  return (
    <>
      <TouchableOpacity
        style={styles.header}
        onPress={() => props.navigation.toggleDrawer()}>
        <SidebarIcon />
        <View
          style={{
            alignSelf: 'flex-start',
            flexDirection: 'row',
            flex: 1,
            marginLeft: wp(2),
            marginTop: hp(0.4),
          }}>
          <Text style={{fontSize: hp(3), fontFamily: 'RobotoMono-Regular'}}>
            My Profile
          </Text>
        </View>
      </TouchableOpacity>
      {loading || isEmpty(driverDetails) ? (
        <LoaderComponent />
      ) : (
        <>
          <View style={styles.container}>
            <View style={{alignItems: 'center'}}>
              {userImg ? (
                <Image
                  style={styles.profileView}
                  source={{uri: `file://${userImg}`}}
                />
              ) : (
                <View style={styles.profileIcon}>
                  <Text style={styles.profileIconText}>
                    {userData.firstName[0].toUpperCase()}
                  </Text>
                </View>
              )}

              {/* uploading vehicle image  */}

              <View style={styles.profileDataContainer}>
                <View style={styles.vehicleImageMainContainer}>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={openCamera}>
                    <ImageUpload />
                  </TouchableOpacity>

                  <Text style={styles.imageViewHeading}>Vehicle Image</Text>

                  <View style={styles.vehicleImageContainer}>
                    {isUploading && (
                      <ActivityIndicator
                        size="large"
                        color={
                          randomLoderColor[
                            Math.floor(Math.random() * randomLoderColor.length)
                          ]
                        }
                        style={{position: 'absolute', zIndex: 5}}
                      />
                    )}

                    {vehicleImage ? (
                      <Image
                        source={{uri: vehicleImage}}
                        // resizeMode="contain"
                        style={styles.imageViewBox}
                      />
                    ) : (
                      <Text
                        style={{
                          fontFamily: 'RobotoMono-Regular',
                          color: '#0A0000',
                          fontSize: hp(2),
                          fontWeight: '700',
                        }}>
                        Upload your vehicle image
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.contentView}>
                  <Text style={styles.contentViewHeading}>Name</Text>
                  <Text style={styles.contentViewText}>
                    {driverDetails.firstName} {driverDetails.lastName}
                  </Text>
                </View>

                <View style={styles.contentView}>
                  <Text style={styles.contentViewHeading}>Mobile Number</Text>
                  <Text style={styles.contentViewText}>
                    +{driverDetails.mobileNumber}
                  </Text>
                </View>
                <View style={styles.contentView}>
                  <Text style={styles.contentViewHeading}>Vehicle Number</Text>
                  <Text style={styles.contentViewText}>
                    {driverDetails.vehicleNumber
                      ? `${driverDetails.vehicleNumber.substring(
                          0,
                          2,
                        )}${driverDetails.vehicleNumber.substring(
                          2,
                          4,
                        )}${driverDetails.vehicleNumber.substring(
                          4,
                          6,
                        )}${driverDetails.vehicleNumber.substring(6)}`
                      : 'N/A'}
                  </Text>
                </View>
                <View style={styles.contentView}>
                  <Text style={styles.contentViewHeading}>Vehicle Type</Text>
                  <Text style={styles.contentViewText}>
                    {driverDetails.vehicleType}
                  </Text>
                </View>
                <View style={styles.contentView}>
                  <Text style={styles.contentViewHeading}>Vehicle Name</Text>
                  <Text style={styles.contentViewText}>
                    {driverDetails.vehicleName}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.bottomView}>
              <TouchableOpacity onPress={handleLogout}>
                <LogOutIcon />
              </TouchableOpacity>
              <Text style={styles.date}>Member Since {formattedDate}</Text>
            </View>
          </View>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  profileIcon: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(50),
    backgroundColor: 'navy',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIconText: {
    fontFamily: 'RobotoMono-Regular',
    color: 'white',
    fontSize: wp(5),
  },
  container: {
    // flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    // marginTop: hp(4),
  },
  vehicleImage: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: hp(3),
  },
  profileDataContainer: {
    alignSelf: 'center',
    gap: wp(2),
    marginTop: hp(2),
    // width: wp(70),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(2),
    width: wp(100),
  },
  profileView: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(50),
    backgroundColor: '#2BB180',
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: hp(10),
  },
  profileText: {color: '#ffffff', fontSize: wp(10)},
  horixontalLine: {
    backgroundColor: '#E5E7EB',
    height: 1,
    width: wp(60),
    marginTop: hp(8),
    alignSelf: 'center',
  },

  vehicleImageMainContainer: {
    borderRadius: wp(3),
    shadowColor: '#171717',
    backgroundColor: 'white',
    overflow: 'hidden',
    width: wp(90),
    height: hp(24),
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },

  vehicleImageContainer: {
    // borderRadius: wp(3),
    shadowColor: '#171717',
    backgroundColor: 'white',
    overflow: 'hidden',
    paddingHorizontal: 25,
    marginTop: hp(4),
    width: wp(90),
    height: hp(20),
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageViewHeading: {
    fontFamily: 'RobotoMono-Regular',
    color: '#9CA3AF',
    fontSize: hp(1.8),
    fontWeight: '500',
    position: 'absolute',
    top: hp(0.5),
    left: wp(2),
  },

  uploadButton: {
    position: 'absolute',
    top: hp(0.5),
    right: wp(2),
    zIndex: 10,
    borderRadius: 5,
    paddingHorizontal: wp(1.5),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
  },

  imageViewBox: {
    objectFit: 'fill',
    height: hp(25),
    width: wp(90),
  },

  contentView: {
    borderRadius: wp(3),
    shadowColor: '#171717',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 25,
    width: wp(90),
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  contentViewHeading: {
    fontFamily: 'RobotoMono-Regular',
    color: '#9CA3AF',
    fontSize: hp(1.8),
    fontWeight: '500',
  },
  contentViewText: {
    fontFamily: 'RobotoMono-Regular',
    color: '#212121',
    fontSize: hp(2.2),
    fontWeight: '500',
  },
  text: {fontSize: wp(5), color: '#000000'},
  loaderStyles: {marginTop: hp(40), alignSelf: 'center'},
  bottomView: {
    top: hp(5),
    alignSelf: 'center',
    alignItems: 'center',
  },
  date: {
    fontFamily: 'RobotoMono-Regular',
    marginTop: hp(1),
    color: '#BAB6B6',
    fontWeight: '600',
  },
  imagePreview: {
    width: wp(20),
    height: hp(10),
    marginTop: hp(1),
    borderRadius: 10,
  },
});

export default Profile;
