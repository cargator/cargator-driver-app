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
import {getS3SignUrlApi, updateVehicleImageKey} from '../services/userservices';
import axios from 'axios';
import {Buffer} from 'buffer';
import {requestCameraPermission} from '../components/functions';
import {useDispatch, useSelector} from 'react-redux';
import SidebarIcon from '../svg/SidebarIcon';
import moment from 'moment';
import LoaderComponent from '../components/LoaderComponent';
import {userDetails} from '../services/rideservices';
import {useIsFocused} from '@react-navigation/native';
import LogOutIcon from '../svg/LogOutIcon';
import {socketDisconnect} from '../utils/socket';
import {removeUserData} from '../redux/redux';
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
  const [isUploading, setIsUploading] = useState(false);
  const handleLogout = async () => {
    try {
      // await RNFetchBlob.fs.unlink(`file://${userImg}`);
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
      setImageUri(response.imageUri[0]?.imageUri);
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

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Camera permission is required to use this feature.',
      );
      return;
    }

    const options: CameraOptions = {
      mediaType: 'photo',
      saveToPhotos: true,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const photoUri = response.assets[0].uri || null;
        setImageUri(photoUri || null);
        uploadImage(photoUri);
      }
    });
  };

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
          setIsUploading(false);
          Toast.show({
            type: 'success',
            text1: `VEHICLE IMAGE UOLOADED SUCCESSFULLY !`,
            visibilityTime: 5000,
          });
          // console.log("response >>",response);
        }
      } catch (error) {
        console.log('error while uploading vehicle image', error);
      }
      setIsUploading(false);
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

  // const checkImageExists = async () => {
  //   try {
  //     const exists = await RNFetchBlob.fs.exists(userImg);
  //     if (!exists) {
  //       console.log('fetching user Image.....as he may have cleared cache');
  //       await FetchUserImage(dispatch, profileImageKey, userId);
  //     }
  //   } catch (error) {
  //     console.log('error in checkImageExists', error);
  //   }
  // };
  useEffect(() => {
    // checkImageExists();
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
              {/* <View style={styles.vehicleImage}>
                <Button title="Upload vehicle image" onPress={openCamera} />
                {isUploading && (
                  <ActivityIndicator size="large" color="#00ff00" />
                )}
                {imageUri && (
                  <Image source={{uri: imageUri}} style={styles.imagePreview} />
                )}
              </View> */}

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
                        style={{position: 'absolute'}}
                      />
                    )}

                    {imageUri && (
                      <Image
                        source={{uri: imageUri}}
                        // resizeMode="contain"
                        style={styles.imageViewBox}
                      />
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
    marginTop: hp(10),
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
    paddingHorizontal:25,
    marginTop:hp(4),
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
    // fontFamily: 'RobotoMono-Regular',
    // color: '#FFF',
    // fontSize: hp(1.5),
    // fontWeight: '700',
    // zIndex: 5,
    // backgroundColor: 'rgba(0, 0, 0, 0.2)',
    // borderRadius: 5,
    // paddingHorizontal: wp(1.5),
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.8,
    // shadowRadius: 3,
    // elevation: 5,
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
    // shadowOpacity: 0.8,
    // shadowRadius: 3,
    // elevation: 5,
  },

  imageViewBox: {
    objectFit: 'fill',
    height: hp(40),
    width: wp(100),
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
