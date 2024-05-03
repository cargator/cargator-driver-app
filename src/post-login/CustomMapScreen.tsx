import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Geolocation from '@react-native-community/geolocation';
import * as geolib from 'geolib';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import { StyleSheet, View, PermissionsAndroid, Text, TouchableOpacity, Dimensions, Image, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { removeUserData, setDriverPath, setLocationPermission, setRideDetails, setRideStatus } from '../redux/redux';
import customAxios from '../services/appservices';
import SidebarIcon from '../svg/SidebarIcon';
import SlideButton from 'rn-slide-button';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import { isEmpty as _isEmpty } from 'lodash';
import { createRides, getBreakPointsAPI, upDateRideStatus } from '../services/userservices';
import { TouchableHighlight } from 'react-native-gesture-handler';


const CustomMapScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const userId = useSelector((store: any) => store.userId);
  const rideStatus = useSelector((store:any) => store.rideStatus);
  const DriverPath = useSelector((store:any) => store.driverPath);
  const ridesId = useSelector((store:any) => store.rideDetails._id);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [sliderButtonLoader, setSliderButtonLoader] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [isProfileModal, setIsProfileModal] = useState<boolean>(false);

  // map-------------------
  const screen = Dimensions.get('window');
  const ASPECTS_RATIO = screen.width / screen.height;
  const LATITUDE_DELTA = 0.009;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECTS_RATIO;
  const [position, setPosition] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [mylocation, setMyLocation] = useState({
    latitude: 19.165131064505033,
    longitude: 72.96577142466332,
  });
  const [path, setPath] = useState<any>([]);
  const [heading, setHeading] = useState<any>(0)
  const [geolocationWatchId, setGeolocationWatchId] = useState<any>();
  const [region, setRegion] = useState<any>({});
  const mapRef = useRef<any>(null);
  const [breakPoints, setBreakPoints] = useState<any>([]);
  const [slideCount, setSlideCount] = useState<number>(0);
  const [buttonText, setButtonText] = useState<any>("Base out");
  const [rideId, setRideId] = useState<any>('');
  const [isReachedDrop, setIsReachedDrop] = useState<boolean>(false);
  const [isRideStarted, setIsRideStarted] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isConnectedNet, setIsConnectedNet] = useState<boolean>(true);
  const [networkIssue, setNetworkIssue] = useState(false);

  const handleLogout = async () => {
    try {
      dispatch(removeUserData());
    } catch (err) {
      console.log('err in handleLogOut', err);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await customAxios.patch(`/update-driver-status/${userId}`);
      if (res) {
        handleLogout();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updatePath = (newCoords: any) => {
    setPath((prevPath: any) => [...prevPath, newCoords]);
  };

  const getBreakspoints = async () => {
    try {
      setSliderButtonLoader(true)
      const res = await getBreakPointsAPI();
      setBreakPoints(res.data)
      setSliderButtonLoader(false)
    } catch (error) {
      setSliderButtonLoader(false)
      console.log("error", error)
    }
  }


  const emitLiveLocation = () => {
    let prevLocation:any = null;
    try {
      const watchId = Geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, heading } = position.coords;
          const newLocation = { latitude, longitude };
          setMyLocation(newLocation)
          setHeading(heading)
          if (isRideStarted) {
            if (prevLocation) {
              const distance = geolib.getDistance(prevLocation, newLocation);
              if (distance >= 15) {
                setMyLocation(newLocation);
                setPath((prevPath:any) => [...prevPath, newLocation]);
                prevLocation = newLocation;
              }
            } else {
              setMyLocation(newLocation);
              setPath((prevPath:any) => [...prevPath, newLocation]);
              prevLocation = newLocation;
            }
          }
        },
        (error) => {
          console.log(`emitLiveLocation error :>> `, error);
          if (error.message == 'Location permission not granted.') {
            Toast.show({
              type: 'error',
              text1: 'Please allow location permission.',
            });
            dispatch(setLocationPermission(false));
          }
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000, distanceFilter: 15 }
      );

      setLoading(false);
      setGeolocationWatchId(watchId);
      return () => {
        Geolocation.clearWatch(watchId);
      };
    } catch (error) {
      console.log(`emitLiveLocation error :>> `, error);
      setLoading(false);
    }
  };


  const getCurrentPosition = useCallback(async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          (position) => {
            setPosition({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
            setMyLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error: any) => console.log('location err', error),
          {
            enableHighAccuracy: false,
            timeout: 10000,
          }
        );
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }, []);

  const handleBaseOut= async() => {
    try {
      setLoading(true);
      setPath([]);
      dispatch(setDriverPath([]));
      const data = {
        driverId: userId,
        status: breakPoints[0].breakingPointName,
        driverPath: [mylocation],
      }
      console.log("object")
      const res = await createRides(data)
      setLoading(false);
      Toast.show({
        type: 'success',
        text1: `Successfully ${breakPoints[slideCount].breakingPointName}, Ride started!`,
      });
      setSlideCount(slideCount + 1)
      console.log("DATA IS :", res?.data)
      dispatch(setRideDetails(res?.data))
      dispatch(setRideStatus(slideCount))
      console.log("object", breakPoints[slideCount + 1].breakingPointName)
      setButtonText(breakPoints[slideCount + 1].breakingPointName)
      setIsRideStarted(true)
      setRideId(res?.data._id)
    } catch (error) {
      setLoading(false)
      setNetworkIssue(true)
      setSlideCount(slideCount)
      setButtonText(breakPoints[0].breakingPointName)
      Toast.show({
        type: 'error',
        text1: 'Error of Creating ride !',
        // text1: error.response.data.error,
      });
    }
  }

  const handleUpdateRide = async () => {
    try {
      console.log("rideId", rideId)
      setNetworkIssue(false)
      setLoading(true)
      // setPath(prevPath => [...prevPath, newLocation]);
      setPath((prevPath:any)=> {
        if (prevPath.length > 0) {
          const updatedPath = [...prevPath];
          updatedPath[prevPath.length - 1] = { ...updatedPath[prevPath.length - 1], label: breakPoints[slideCount]?.breakingPointName };
          return updatedPath;
        } else {
          return [...prevPath]
        }
      });
      const status = {
        rideId: rideId,
        status: breakPoints[slideCount].breakingPointName,
        driverPath: path.length > 0 ? path : [mylocation],
      }
      const res = await upDateRideStatus(status);
      dispatch(setRideDetails(res?.data))
      dispatch(setRideStatus(slideCount))
      Toast.show({
        type: 'success',
        text1: `Successfully ${breakPoints[slideCount].breakingPointName} !`,
      });
      console.log("object--------",res.data)
      setLoading(false)
      if (slideCount >= breakPoints.length - 1) {
        setIsRideStarted(false)
        setIsReachedDrop(false)
        setPath([]);
        dispatch(setRideStatus(''))
        dispatch(setDriverPath([]))
        setSlideCount(0)
        setButtonText(breakPoints[0].breakingPointName)
        return;
      }
      setSlideCount(slideCount + 1)
      setButtonText(breakPoints[slideCount + 1].breakingPointName)
      console.log("res", res)
    } catch (error) {
      console.log("update status error", error)
      setNetworkIssue(true)
      setLoading(false)
      Toast.show({
        type: 'error',
        text1: 'Update status error !',
      });
      setSlideCount(slideCount - 1)
      setButtonText(breakPoints[slideCount - 1].breakingPointName)
    }
  }


  const handleRideCompleted = async () => {
    try {
      // console.log("pathhhhssss", path)
      setNetworkIssue(false)
      setLoading(true)
      const status = {
        rideId: rideId,
        status: 'completed',
        driverPath: path.length > 0 ? path : [mylocation]
      }
      const res = await upDateRideStatus(status);
      setLoading(false)
      dispatch(setRideDetails(res?.data))
      setIsRideStarted(false)
      setIsReachedDrop(false)
      Toast.show({
        type: 'success',
        text1: 'Successfully trip completed !',
      });
      setSlideCount(1)
      setButtonText("Base out")
      setPath([])
      dispatch(setDriverPath([]))
      // console.log("res", res)
    } catch (error) {
      console.log("update status error", error)
      setNetworkIssue(true)
      setLoading(false)
      Toast.show({
        type: 'error',
        text1: 'Update status error !',
      });
      setSlideCount(4)
      setButtonText("completed")
    }
  };


  const handleEndReached = async () => {
    console.log('Reached end of the slide!');
    if (slideCount === 0) {
      console.log('First function called');
      handleBaseOut();
    } else if (slideCount >= 1) {
      console.log('Second function called');
      handleUpdateRide()
    }
  }

  useEffect(() => {
    getBreakspoints();
  }, [])

  useEffect(() => {
    if (rideStatus === Number('0')) {
      setIsRideStarted(true);
      setPath(DriverPath);
      setSlideCount(rideStatus + 1);
      setButtonText(breakPoints[rideStatus + 1]?.breakingPointName);
      setRideId(ridesId);
    } else if (rideStatus === breakPoints.length - 1) {
      setIsRideStarted(false)
      setIsReachedDrop(false)
      setSlideCount(0)
      setButtonText(breakPoints[0]?.breakingPointName)
      setPath([])
      dispatch(setDriverPath([]))
    } else if (rideStatus > Number('0')) {
      setIsRideStarted(true);
      setPath(DriverPath);
      setSlideCount(rideStatus + 1);
      setButtonText(breakPoints[rideStatus + 1]?.breakingPointName);
      setRideId(ridesId)
    }
  }, [breakPoints])

  useEffect(() => {
    Geolocation.clearWatch(geolocationWatchId);
    setPath([])
    emitLiveLocation();
  }, [isRideStarted]);

  useEffect(() => {
    getCurrentPosition()
  }, [getCurrentPosition]);

  return (
    <>
    {isProfileModal && (
      <View style={styles.profileModalView}>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setDeleteModal(true);
            setIsProfileModal(false);
          }}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    )}
    {deleteModal && (
      <View style={styles.deleteContainer}>
        <View style={styles.modalContainer}>
          {deleteModal && (
            <View style={styles.modalContent}>
              <Text style={styles.modalText1}>
                Are you sure you want to delete?
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDelete}>
                  <Text style={styles.buttonText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setDeleteModal(false)}>
                  <Text style={styles.buttonText}>No</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    )}
    <View style={styles.headerBar}>
      <View>
        <TouchableOpacity
          onPress={() => {
            // console.log('SideBarIcon pressed!');
            navigation.toggleDrawer();
          }}>
          <SidebarIcon />
        </TouchableOpacity>
      </View>
      <View style={styles.profileIcon}>
        <TouchableOpacity
          hitSlop={{
            left: widthPercentageToDP(10),
            right: widthPercentageToDP(5),
            top: heightPercentageToDP(2),
          }}
          onPress={() => setIsProfileModal(!isProfileModal)}>
          <Text style={styles.profileIconText}>
            D{/* {userData.firstName[0].toUpperCase()} */}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    <View style={styles.container}>
      <MapView provider={PROVIDER_GOOGLE} style={styles.map}
        ref={mapRef}
        initialRegion={{
          latitude: mylocation.latitude,
          longitude: mylocation.longitude,
          latitudeDelta: 0.0122,
          longitudeDelta: 0.0121,
        }}
        region={{
          latitude: region.latitude || mylocation.latitude,
          longitude: region.longitude || mylocation.longitude,
          latitudeDelta: region.latitudeDelta || 0.0122,
          longitudeDelta: region.longitudeDelta || 0.0121,
        }}
        mapPadding={{ top: 200, right: 50, left: 20, bottom: 30 }}>
        {!isRideStarted && <Marker coordinate={mylocation} />}
        {isRideStarted && (
          <Marker
            identifier="dropLocationMarker"
            coordinate={path.length > 0 ? path[path.length - 1] : mylocation}
            icon={require('../svg/images/driverLiveLocation.png')}
            // imageStyle={{ width: wp(100), height: hp(100) }}
            rotation={heading - 50 || 0}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={5}
          />
        )}
            {isRideStarted && path.length > 0 && (
            <Marker
              identifier="dropLocationMarker"
              coordinate={path[0]}
              icon={require('../svg/images/startPoint.png')}
              anchor={{ x: 0.5, y: 0.5 }}
              zIndex={1}
            />
          )}
          {
          path.map((point:any, index:any) => {
              // console.log("points",point)
              return (
                point?.label === 'hospitalised' ? (
                  <Marker
                    key={index}
                    identifier="dropLocationMarker"
                    coordinate={{ "latitude": point.latitude, "longitude": point.longitude }}
                    icon={require('../svg/images/hospital.png')}
                    // imageStyle={{ width: wp(100), height: hp(100) }}
                    zIndex={1}
                  />
                ) : null

              );
            })
          }
          <Polyline
            coordinates={path}
            strokeColor={'#404080'}
            strokeWidth={4}
          />
      </MapView>
      <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom:hp(1), }}>
          <SlideButton
            width={290}
            height={50}
            animationDuration={180}
            autoResetDelay={1080}
            animation={true}
            autoReset={true}
            sliderWidth={50}
            onReachedToEnd={handleEndReached}
            // onSlideSuccess={handleSlide}
            containerStyle={{ backgroundColor: '#3A5299', color: 'red' }}
            thumbStyle={{ backgroundColor: 'white' }}
            underlayStyle={{ backgroundColor: '#4964b3' }}
            icon={<Image source={require('../svg/arrao2.png')} style={styles.thumbImage} />} // Adjust width and height as needed
            title={sliderButtonLoader ? <ActivityIndicator size="small" color="#fff" /> : buttonText}
            slideDirection="right"
          >
            <Text style={{ color: 'white', fontSize: 18 }}>{sliderButtonLoader ? <ActivityIndicator size="small" color="#fff" /> : buttonText}</Text>
          </SlideButton>
        </View>
        {isReachedDrop && (
            <View style={styles.otpModalView}>
              <Text style={styles.rideCompletedModalText}>
                Trip completed
              </Text>
              <Text style={{ color: 'black' }}>
                Base in to Hospital
              </Text>

              <View style={styles.rideCompletedModalBtnContainer}>
                <TouchableHighlight
                  style={styles.noBtn}
                  onPress={() => {
                    setIsReachedDrop(false);
                  }}>
                  <Text style={styles.rideCompletedModalNoBtnText}>
                    No
                  </Text>
                </TouchableHighlight>

                <TouchableHighlight
                  onPress={handleRideCompleted}
                  style={styles.yesBtn}
                  underlayColor="#DDDDDD" // Change this color to the desired touch effect color
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.rideCompletedModalYesBtnText}>
                      Confirm
                    </Text>
                  )}
                </TouchableHighlight>
              </View>
            </View>
          )}
    </View>
  </>
  )
}


const styles = StyleSheet.create({
  mainView: {
    flex: 1,
  },
  deleteContainer: {
    display: 'flex',
    width: widthPercentageToDP(100),
    height: heightPercentageToDP(100),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  deleteModal: {
    backgroundColor: 'white',
    width: widthPercentageToDP(60),
    height: heightPercentageToDP(20),
    zIndex: 10,
    top: heightPercentageToDP(0),
    left: widthPercentageToDP(0),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontFamily: 'RobotoMono-Regular',
    fontSize: widthPercentageToDP(4.5),
    fontWeight: 'bold',
  },
  deleteText: {
    fontFamily: 'RobotoMono-Regular',
    fontSize: widthPercentageToDP(4.5),
    fontWeight: 'bold',
    color: 'red',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: widthPercentageToDP(2),
    backgroundColor: '#ffffff',
  },
  profileIcon: {
    width: widthPercentageToDP(8),
    height: widthPercentageToDP(8),
    borderRadius: widthPercentageToDP(50),
    backgroundColor: 'navy',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIconText: {
    fontFamily: 'RobotoMono-Regular',
    color: 'white',
    fontSize: widthPercentageToDP(5),
  },
  profileModalView: {
    backgroundColor: 'white',
    borderRadius: widthPercentageToDP(2),
    padding: widthPercentageToDP(2),
    shadowColor: '#000000',
    shadowOffset: {
      width: widthPercentageToDP(0),
      height: heightPercentageToDP(2),
    },
    shadowOpacity: widthPercentageToDP(0.25),
    shadowRadius: widthPercentageToDP(4),
    elevation: heightPercentageToDP(5),
    gap: heightPercentageToDP(2),
    justifyContent: 'center',
    alignItems: 'center',
    width: widthPercentageToDP(30),
    position: 'absolute',
    top: heightPercentageToDP(6),
    right: widthPercentageToDP(2),
    zIndex: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: widthPercentageToDP(20),
    borderRadius: widthPercentageToDP(10),
    width: '80%',
  },
  modalText1: {
    fontFamily: 'RobotoMono-Regular',
    fontSize: widthPercentageToDP(18),
    marginBottom: widthPercentageToDP(20),
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deleteButton: {
    backgroundColor: '#FF5050',
    paddingVertical: widthPercentageToDP(10),
    paddingHorizontal: widthPercentageToDP(20),
    borderRadius: widthPercentageToDP(5),
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: widthPercentageToDP(10),
    paddingHorizontal: widthPercentageToDP(20),
    borderRadius: widthPercentageToDP(5),
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'RobotoMono-Regular',
    color: '#fff',
    fontSize: widthPercentageToDP(16),
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    // marginTop: heightPercentageToDP(10),
    width: '100%',
    height: '90%',
    // marginBottom: widthPercentageToDP(40)
  },
  otpModalView: {
    backgroundColor: 'white',
    borderRadius: wp(5),
    padding: wp(3),
    shadowColor: '#000000',
    shadowOffset: {
      width: wp(0),
      height: hp(2),
    },
    shadowOpacity: wp(0.25),
    shadowRadius: wp(4),
    elevation: hp(5),
    justifyContent: 'center',
    position: 'absolute',
    top: hp(30),
    gap: hp(2),
    alignItems: 'center',
    width: wp(90),
  },
  rideCompletedModalText: {
    fontFamily: 'RobotoMono-Regular',
    color: '#212121',
    fontSize: widthPercentageToDP(4.4),
    textAlign: 'center',
    margin: widthPercentageToDP(2),
    fontWeight: '600',
  },
  thumbImage: {
    width: widthPercentageToDP(12),
    height: widthPercentageToDP(12),
    borderRadius: widthPercentageToDP(30),
    resizeMode: 'cover',
  },
  rideCompletedModalBtnContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  rideCompletedModalNoBtnText: {
    fontFamily: 'RobotoMono-Regular',
    color: '#EB5757',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: widthPercentageToDP(4),
  },
  rideCompletedModalYesBtnText: {
    fontFamily: 'RobotoMono-Regular',
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: widthPercentageToDP(4),
  },
  yesBtn: {
    borderRadius: widthPercentageToDP(5),
    padding: heightPercentageToDP(1.3),
    width: widthPercentageToDP(37),
    margin: widthPercentageToDP(2),
    backgroundColor: '#3A5299',
    borderColor: '#3A5299',
    borderWidth: widthPercentageToDP(0.4),
  },
  noBtn: {
    borderRadius: widthPercentageToDP(5),
    padding: heightPercentageToDP(1.3),
    width: widthPercentageToDP(37),
    margin: widthPercentageToDP(2),
    backgroundColor: '#FFFFFF',
    borderColor: '#EB5757',
    borderWidth: widthPercentageToDP(0.4),
  },
});

export default CustomMapScreen;
