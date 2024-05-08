import Geolocation from 'react-native-geolocation-service';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  BackHandler,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, {Marker, Polyline} from 'react-native-maps';
import {
  heightPercentageToDP,
  heightPercentageToDP as hp,
  widthPercentageToDP,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {getSocketInstance, socketDisconnect} from '../utils/socket';
import LoaderComponent from '../components/LoaderComponent';
import {useDispatch, useSelector} from 'react-redux';
import {
  removeRideDetails,
  removeUserData,
  setGpsPermission,
  setLocationPermission,
  setRideDetails,
  setUnseenMessagesCountInRedux,
} from '../redux/redux';
import {Toast} from 'react-native-toast-message/lib/src/Toast';
import PickUpLocationIcon from '../svg/PickUpLocationIcon';
import PickUpLocationIcon2 from '../svg/PickUpLocationIcon2';
import DropLocationIcon from '../svg/DropLocationIcon';
import OfflineIcon from '../svg/OfflineIcon';
import Navigate from '../svg/Navigate';
import Reached from '../svg/Reached';
import CompleteIcon from '../svg/CompleteIcon';
import SidebarIcon from '../svg/SidebarIcon';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import ChatComponent from './ChatComponent';
import {GiftedChat} from 'react-native-gifted-chat';
import ChatIcon from '../svg/ChatIcon';
import RejectRideIcon from '../svg/RejectRideIcon';
import {Badge} from 'react-native-elements';
import OnlineOfflineSwitch from './OnlineOfflineSwitch';
import {TouchableWithoutFeedback} from 'react-native';
import * as geolib from 'geolib';
import {isEmpty as _isEmpty} from 'lodash';
import {FetchUserImage} from '../components/functions';
import RNFetchBlob from 'rn-fetch-blob';
import customAxios from '../services/appservices';
// import Spinner from 'react-native-spinkit';

export let socketInstance: any;

const MapScreen = ({navigation}: any) => {
  const userId = useSelector((store: any) => store.userId);
  const loginToken = useSelector((store: any) => store.loginToken);
  const userImage = useSelector((store: any) => store.userImage.exists);
  const profileImageKey = useSelector(
    (store: any) => store.userData.profileImageKey,
  );
  const documentsKey = useSelector((store: any) => store.userData.documentsKey);
  const userImg = useSelector((store: any) => store.userImage.path);
  const rideDetails = useSelector((store: any) => store.rideDetails);
  const driverAppFlow = useSelector((store: any) => store.driverAppFlow);
  // const pendingPayment = useSelector((store: any) => store.pendingPayment);

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isDriverOnline, setIsDriverOnline] = useState<boolean>(true);
  const [availableRides, setAvailableRides] = useState<any>([]);
  const [path, setPath] = useState<any>([]);
  const [isPickupScreen, setIsPickupScreen] = useState<boolean>(false);
  const [isRideStarted, setIsRideStarted] = useState<boolean>(false);
  const isFirstRender = useRef(true);
  const [mylocation, setMyLocation] = useState<any>({
    latitude: 19.165131064505033,
    longitude: 72.96577142466332,
  });
  const [geolocationWatchId, setGeolocationWatchId] = useState<any>();
  const mapRef = useRef<any>(null);
  const [OTP, setOTP] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isReachedDrop, setIsReachedDrop] = useState<boolean>(false);
  const [isChatComponent, setIsChatComponent] = useState<boolean>(false);
  const [unseenMessagesCount, setUnseenMessagesCount] = useState<number>(0);
  const [messages, setMessages] = useState<Array<any>>([]);
  const [paymentModal, setPaymentModal] = useState<boolean>(false);
  const [isProfileModal, setIsProfileModal] = useState<boolean>(false);
  const [region, setRegion] = useState<any>({});
  // const [waitingTime, setWaitingTime] = useState(0); // Time in SECONDS while waiting for customer-pickup.

  const handleLogout = async () => {
    try {
      // await RNFetchBlob.fs.unlink(`file://${userImg}`);
      await socketDisconnect();
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

  const handleSeenAllMessges = () => {
    // console.log(`handleSeenAllMessages called !`);
    socketInstance.emit('all-chat-messages-seen', {
      message: 'Driver has seen all messages',
      rideId: rideDetails._id,
    });
  };

  const startChatListener = () => {
    socketInstance.on('chat-message', (body: any) => {
      console.log(`chat-message event >> body :>> `, body);
      body = JSON.parse(body);
      if (body.message == 'New message from rider') {
        setMessages((previousMessages: any) =>
          GiftedChat.append(previousMessages, body.newChatMessage),
        );
        setUnseenMessagesCount(prevCount => prevCount + 1);
      }
      if (isChatComponent) {
        handleSeenAllMessges();
      }
    });
  };

  const handleSendMessage = useCallback(
    (newMessage: any = []) => {
      console.log(`handleSendMessage >> newMessage :>> `, newMessage);
      setMessages((previousMessages: any) =>
        GiftedChat.append(previousMessages, newMessage),
      );
      socketInstance.emit('chat-message', {
        message: 'New message from driver',
        // status: 203,
        rideId: rideDetails._id,
        chatMessage: newMessage[0],
      });
    },
    [rideDetails],
  );

  const emptyStates = () => {
    setOTP('');
    setIsReachedDrop(false);
    setIsRideStarted(false);
    setIsPickupScreen(false);
    setIsOtpVerified(false);
    setIsProfileModal(false);
    setPaymentModal(false);
    setPath([]);
    setMessages([]);
    dispatch(setUnseenMessagesCountInRedux(0));
    dispatch(removeRideDetails());
  };

  const handleOnlinePayment = async () => {
    Toast.show({
      type: 'error',
      text1: 'Please wait for the rider to complete the payment !',
    });
  };

  const handleCashPayment = async () => {
    socketInstance.emit('payment-completed', {
      rideId: rideDetails._id,
    });
    setLoading(true);
  };

  const handleReachedDestinationBtn = async () => {
    // socketInstance.emit('ride-update', {
    //   message: 'reached destination',
    //   rideId: assignedRide._id,
    // });
    setIsReachedDrop(true);
  };

  const confirmReachedDestination = async () => {
    socketInstance.emit('ride-update', {
      message: 'reached destination',
      rideId: rideDetails._id,
    });
    setIsReachedDrop(false);
  };

  const handleStartRideBtn = async () => {
    console.log(`handleStartRideBtn called :>> `);
    if (!isOtpVerified) {
      Toast.show({
        type: 'error',
        text1: 'Please enter OTP.',
      });
      return;
    }
    setIsPickupScreen(false);
    setIsRideStarted(true);
    // dispatch(setUserData({isRideStarted: true}));
  };

  const sendOTP = async (otp: any) => {
    // console.log(`sendOTP :>> `, sendOTP);
    setLoading(true);
    socketInstance.emit('ride-update-otp-check', {
      otp,
      rideId: rideDetails._id,
    });

    socketInstance.on('ride-update-otp-check', (body: any) => {
      // setLoading(false);
      console.log('ride-update-otp-check event :>> ', body);
      body = JSON.parse(body);
      setOTP('');

      if (body.message == 'validOTP') {
        socketInstance.emit('ride-update', {otp, rideId: rideDetails._id});
        Toast.show({
          type: 'success',
          text1: 'OTP verified. You can start the ride.',
        });
        // setIsTimerRunning(false);
        // setIsPickupScreen(false);
        // setIsRideStarted(true);
        // dispatch(setUserData({isRideStarted: true}));
        setOTP('');
        setIsOtpVerified(true);
        setTimeout(() => {
          setLoading(false);
        }, 2500);
      } else if (body.status == 403) {
        setLoading(false);
        // console.warn('Invalid OTP. Please try again.');
        Toast.show({
          type: 'error',
          text1: 'Invalid OTP. Please try again.',
        });
        console.log('Invalid OTP. Please try again.');
      }
    });
  };

  const parseSocketMessage = (message: any) => {
    try {
      return JSON.parse(message);
    } catch (error) {
      console.log(`parseSocketMessage error :>> `, error);
    }
  };

  const navigateToGoogleMaps = ({latitude, longitude}: any) => {
    const url = `https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=${latitude},${longitude}`;
    Linking.openURL(url).then(supported => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        console.log('navigateToGoogleMaps ---- No ELSE-CASE provided !');
      }
    });
  };

  const handleReachedPickupBtn = async () => {
    if (rideDetails?.status == 'pending-arrival') {
      socketInstance.emit('reached-pickup-location', {
        message: 'driver reached pickup-location',
        rideId: rideDetails._id,
      });
    }
    setIsPickupScreen(true);
  };

  const fitMapToMarkers = useCallback(() => {
    if (!isRideStarted) {
      if (mapRef.current && rideDetails.driverDistanceToPickUp?.value > 10) {
        const markerIDs = ['myLocationMarker', 'pickUpLocationMarker'];
        setTimeout(() => {
          mapRef.current?.fitToSuppliedMarkers(markerIDs, {
            edgePadding: {top: 100, right: 100, bottom: 100, left: 100},
            animated: true,
          });
        }, 10);
      }
    } else {
      if (mapRef.current) {
        const markerIDs = ['myLocationMarker', 'dropLocationMarker'];
        setTimeout(() => {
          mapRef.current?.fitToSuppliedMarkers(markerIDs, {
            edgePadding: {top: 100, right: 100, bottom: 100, left: 100},
            animated: true,
          });
        }, 10);
      }
    }
  }, [rideDetails, isRideStarted]);

  const onAcceptRide = (ride: any) => {
    setLoading(true);
    socketInstance?.emit('ride-accept', {id: ride._id.toString()});
    setAvailableRides((allRides: any[]) =>
      allRides.filter(ele => ele._id != ride._id),
    );
    // console.log('ride-accept emiited');
  };

  const onRejectRide = (ride: any) => {
    setLoading(true);
    // socketInstance.emit('cancel-ride', {id: ride._id.toString()});
    setAvailableRides((allRides: any[]) =>
      allRides.filter(ele => ele._id != ride._id),
    );
    setLoading(false);
  };

  const handleRideStatus = () => {
    try {
      console.log('handleRideStatus status :>> ', rideDetails?.status);

      switch (rideDetails?.status) {
        case 'pending-accept': //! UNNECESSARY
          console.log('case : pending-accept');
          break;

        case 'pending-arrival':
          console.log('case : pending-arrival');
          setIsPickupScreen(false);
          setIsRideStarted(false);
          setPath(rideDetails.driverPathToPickUp);
          break;

        case 'pending-otp':
          console.log('case : pending-otp');
          setIsPickupScreen(true);
          setIsRideStarted(false);
          setPath([]);
          break;

        case 'ride-started':
          console.log('case : ride-started');
          setIsRideStarted(true);
          setIsPickupScreen(false);
          setPath(rideDetails.pickupToDropPath);
          break;

        case 'pending-payment':
          console.log('case : pending-payment');
          setPaymentModal(true);
          setIsRideStarted(true);
          setPath(rideDetails.pickupToDropPath);
          break;

        case 'payment-failed':
          console.log('case : payment-failed');
          setPaymentModal(true);
          setIsRideStarted(true);
          setPath(rideDetails.pickupToDropPath);
          break;

        case 'completed':
          console.log('case : completed');
          emptyStates();
          setLoading(false);
          Toast.show({
            type: 'success',
            text1: 'Payment successful and ride completed !',
          });
          break;

        case 'cancelled': //! UNNECESSARY
          console.log('case : cancelled');
          break;

        default:
          console.log('case : default');
      }
    } catch (error) {
      console.log('handleRideStatus error :>> ', error);
    }
  };

  // 'ride-status' event called when driver has ongoing-ride.
  const rideStatusListener = () => {
    socketInstance.on('ride-status', async (message: any) => {
      console.log(`ride-status event body :>> `, message);
      let body = parseSocketMessage(message);
      console.log(`ride-status event >> message :>> `, body.message);

      if (body?.status === 404) {
        if (!_isEmpty(rideDetails)) {
          emptyStates();
          setLoading(false);
        }
      }

      if (body?.status == 200) {
        emptyStates();
        setLoading(false);
        Toast.show({
          type: 'success',
          text1: 'Payment successful and ride completed !',
        });
      }

      let rideData;

      if (body?.onGoingRide) {
        rideData = body.onGoingRide[0];
      } else if (body?.data) {
        console.log('ride-status event ELSE-IF :>> ', body.data.message);
        rideData = body.data;
      }

      if (rideData) {
        // if (rideData.status != rideDetails.status) {
          if(rideData.rideType !== "custom"){
        dispatch(setRideDetails(rideData));
         
          // }

        const chatMessages = rideData.chatMessages;
        const reversedMessages = [...chatMessages].reverse();
        setMessages(reversedMessages);
        setUnseenMessagesCount(rideData.driverUnreadMessagesCount);
      }
      }
    });
  };

  const rideAcceptResponseListener = () => {
    socketInstance.on('ride-accept-response', (message: any) => {
      // console.log('ride-accept-response event :>> ', message);
      // setLoading(true);
      let body = parseSocketMessage(message);
      console.log('ride-accept-response event :>> ', message.message);

      if (body.driverId && body.driverId.toString() != userId) {
        setAvailableRides((rides: any) =>
          rides.filter((ride: any) => ride._id != body.ride._id),
        );
        Toast.show({
          type: 'error',
          text1: 'Ride not available !',
          visibilityTime: 5000,
        });
      } else {
        if (body.driverId && body.ride) {
          dispatch(setRideDetails(body.ride));
          setPath(body.ride.driverPathToPickUp);
          setMessages(body.ride.chatMessages);
        }
      }

      if (body?.status == 404) {
        Toast.show({
          type: 'error',
          text1: 'Ride not available !',
          visibilityTime: 5000,
        });
        dispatch(removeRideDetails());
      }
      setLoading(false);
    });
  };

  const newRidesListener = () => {
    try {
      socketInstance.on('ride-request', async (message: any) => {
        message = parseSocketMessage(message);
        setAvailableRides((prev: any) => [...prev, ...message]);
      });

      socketInstance.on('cancel-ride', async (body: any) => {
        console.log(`cancel-ride event >> body :>> `, body);
        setLoading(true);
        body = parseSocketMessage(body);
        setAvailableRides((rides: any) =>
          rides.filter((ride: any) => ride._id != body.rideId),
        );
        setIsRideStarted(false);
        setIsPickupScreen(false);
        dispatch(removeRideDetails());
        setMessages([]);
        setPath([]);
        setLoading(false);
        // setWaitingTime(0);
        // navigation.navigate('MapScreen');
        Toast.show({
          type: 'error',
          // text1: 'Ride cancelled by rider.',
          text1: body.message,
          visibilityTime: 5000,
        });
      });

      socketInstance.on('change-payment-mode', (body: any) => {
        console.log(`change-payment-mode event :>> `, body);
        setLoading(true);
        body = JSON.parse(body);
        dispatch(setRideDetails(body.data));
        setLoading(false);
        Toast.show({
          type: 'error',
          text1: 'The rider changed their payment mode !',
          visibilityTime: 5000,
        });
      });

      socketInstance.on('error', (body: any) => {
        console.log(`ERROR EVENT :>> `, body);
        body = JSON.parse(body);
        setLoading(false);
        // Toast.show({
        //   type: 'error',
        //   text1: `Socket Error: ${body.message}`,
        // });
      });
    } catch (error) {
      console.log(`socket-events catch-error :>> `, error);
      setLoading(false);
    }
  };

  const startSocketListeners = () => {
    newRidesListener();
    rideAcceptResponseListener();
    rideStatusListener();
    startChatListener();
    checkDriver();
  };

  const checkDriver = () => {
    socketInstance.on('driver-online', (body: any) => {
      console.log('body', body);
      emitLiveLocation();
    });
  };

  const updatePath = (coords: any) => {
    // console.log('updatePath >> coords :>> ', coords);
    // console.log('updatePath >> path.length :>> ', path.length);

    if (rideDetails && rideDetails?.status != 'pending-otp') {
      // console.log('rideDetails.status :>> ', rideDetails.status);
      let currentPath = [];
      if (rideDetails.status == 'pending-arrival') {
        currentPath = rideDetails.driverPathToPickUp;
      } else {
        currentPath = rideDetails.pickupToDropPath;
      }
      if (currentPath?.length) {
        const nearestCoord: any = geolib.findNearest(coords, currentPath);
        // console.log(`nearestCoord :>> `, nearestCoord);
        let foundNearestCoordFlag = false;
        let newPath = [];

        for (let i = 0; i < currentPath.length; i++) {
          if (
            currentPath[i].latitude == nearestCoord.latitude &&
            currentPath[i].longitude == nearestCoord.longitude
          ) {
            foundNearestCoordFlag = true;
            newPath.push(currentPath[i]);
          } else {
            if (foundNearestCoordFlag) {
              newPath.push(currentPath[i]);
            } else {
              continue;
            }
          }
        }
        // console.log(`newPath.length :>> `, newPath.length);
        setPath(newPath);
      }
    }
  };

  const emitLiveLocation = () => {
    try {
      const watchId = Geolocation.watchPosition(
        position => {
          const {coords} = position;
          socketInstance?.emit('live-location', {
            coordinates: [coords.longitude, coords.latitude],
            rideId: rideDetails._id ? rideDetails._id : null,
          });
          console.log('live location emitted');
          setMyLocation({
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
          updatePath({
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
        },
        (error: any) => {
          console.log(`emitLiveLocation error :>> `, error);
          if (error.message == 'Location permission not granted.') {
            Toast.show({
              type: 'error',
              text1: 'Please allow location permission.',
            });
            dispatch(setLocationPermission(false));
            // setTimeout(() => {
            //   requestLocationPermission(dispatch);
            // }, 2000);
          }
          if (error.code == 2) {
            dispatch(setGpsPermission(false));
          }
        },
        {enableHighAccuracy: true, distanceFilter: 5},
      );
      setGeolocationWatchId(watchId);
      setLoading(false);
    } catch (error) {
      console.log(`emitLiveLocation error :>> `, error);
      setLoading(false);
    }
  };

  const driverStatusToggle = async (event: boolean) => {
    try {
      setLoading(true);
      setIsDriverOnline(event);
      if (!event) {
        setAvailableRides([]);
        await socketDisconnect();
      } else {
        socketInstance = await getSocketInstance(loginToken);
        startSocketListeners();
        // emitLiveLocation();
      }
    } catch (error) {
      console.log(`driverStatusToggle error :>> `, error);
    } finally {
      setLoading(false);
    }
  };

  const backAction = () => {
    let flag = false;

    if (isProfileModal) {
      setIsProfileModal(false);
      flag = true;
    }
    if (!loading && isPickupScreen) {
      setIsPickupScreen(false);
      flag = true;
    }
    setIsReachedDrop(false);
    if (!loading && isReachedDrop) {
      setIsReachedDrop(false);
      flag = true;
    }

    return flag;
  };

  const checkUserImgExists = async () => {
    try {
      if (userImage) {
        return;
      }
      console.log('Fetching presigned url from server for Profile Image');
      await FetchUserImage(dispatch, profileImageKey, userId);
    } catch (err) {
      console.log('err in checkUserImgExists', err);
    }
  };
  useEffect(() => {
    if (isFirstRender.current) {
      driverStatusToggle(isDriverOnline);
    }
    isFirstRender.current = false;
  }, [isDriverOnline]);

  useEffect(() => {
    Geolocation.clearWatch(geolocationWatchId);
    emitLiveLocation();
    if (!_isEmpty(rideDetails)) {
      handleRideStatus();
    }
  }, [rideDetails]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => {
      backHandler.remove();
    };
  }, [isProfileModal, isPickupScreen, isReachedDrop]);

  useEffect(() => {
    checkUserImgExists();
  }, []);
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (!loading && isPickupScreen) {
          setIsPickupScreen(false);
        }
        if (isProfileModal) {
          setIsProfileModal(false);
        }
      }}>
      <View style={styles.mainView}>
        {loading ? (
          <LoaderComponent />
        ) : (
          // <KeyboardAvoidingView
          //   style={{flex: 1, height: hp(100), width: wp(100)}}
          //   keyboardVerticalOffset={Platform.select({
          //     ios: 20,
          //     android: -200,
          //   })}
          //   behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

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

            {!isChatComponent && (
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

                {/* {isDriverOnline && !assignedRide && ( */}
                {_isEmpty(rideDetails) && (
                  <OnlineOfflineSwitch
                    isDriverOnline={isDriverOnline}
                    driverStatusToggle={driverStatusToggle}
                  />
                )}

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
            )}

            {_isEmpty(rideDetails) && (
              <View style={styles.noRideContainer}>
                <MapView
                  initialRegion={{
                    latitude: mylocation.latitude,
                    longitude: mylocation.longitude,
                    latitudeDelta: 0.0122,
                    longitudeDelta: 0.0121,
                  }}
                  region={{
                    latitude: mylocation.latitude,
                    longitude: mylocation.longitude,
                    latitudeDelta: 0.0122,
                    longitudeDelta: 0.0121,
                  }}
                  showsUserLocation={true}
                  style={[
                    styles.noRidesMap,
                    ((_isEmpty(rideDetails) && availableRides[0]) ||
                      !isDriverOnline) &&
                      styles.loadingOpacity,
                  ]}>
                  {isDriverOnline && _isEmpty(rideDetails) && (
                    <Marker
                      identifier="myLocationMarker"
                      coordinate={mylocation}
                    />
                  )}
                </MapView>

                {!isDriverOnline && (
                  <View style={styles.offlineModalView}>
                    <Text style={styles.offlineModalHeaderText}>
                      You are offline at the moment
                    </Text>

                    <Text style={styles.offlineModalBodyText}>
                      {/* If you want to go online, please click the button above */}
                      If you want to take new-rides, please go online by
                      clicking the button above
                    </Text>

                    <OfflineIcon />

                    {/* <OnlineOfflineSwitch
                      isDriverOnline={isDriverOnline}
                      driverStatusToggle={driverStatusToggle}
                    /> */}
                  </View>
                )}

                {_isEmpty(rideDetails) && availableRides[0] && (
                  <View
                    key={`ride_${0 + 1}`}
                    style={[styles.modalView, {opacity: 2}]}>
                    <View style={styles.availableRidesModal}>
                      <View style={styles.availableRidesAddressView}>
                        <PickUpLocationIcon />

                        <View style={styles.availableRidesAddressTextView}>
                          <Text style={styles.availableRidesAddressText}>
                            Pickup Location:
                          </Text>

                          <Text style={styles.availableRidesAddressDataText}>
                            {availableRides[0].pickUpAddress}
                          </Text>

                          {/* <Text
                            style={{
                              color: 'black',
                              fontWeight: 'bold',
                              marginTop: wp(2),
                              marginBottom: wp(2),
                            }}>
                            Distance: {availableRides[0].pickUpDistance}
                            Distance: {availableRides[0].driverDistanceToPickUp}
                          </Text>

                          <Text
                            style={{
                              color: 'black',
                              fontWeight: 'bold',
                              marginTop: wp(2),
                              marginBottom: wp(2),
                            }}>
                            Duration: {availableRides[0].driverDurationToPickUp}
                          </Text> */}
                        </View>
                      </View>

                      <View style={styles.availableRidesButtonsView}>
                        <Pressable
                          onPress={() => {
                            onRejectRide(availableRides[0]);
                          }}>
                          <RejectRideIcon />
                        </Pressable>

                        <Pressable
                          // style={[
                          //   styles.button,
                          //   styles.buttonAccept,
                          //   {flex: 1},
                          // ]}
                          style={styles.availableRidesAcceptButton}
                          onPress={() => {
                            onAcceptRide(availableRides[0]);
                          }}>
                          <Text style={styles.textStyle}>Accept</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}

            {isDriverOnline && !_isEmpty(rideDetails) && (
              <View style={styles.ridesContainer}>
                {isChatComponent && (
                  <View style={styles.chatContainer}>
                    <ChatComponent
                      setIsChatComponent={setIsChatComponent}
                      messages={messages}
                      handleSendMessage={handleSendMessage}
                      setUnseenMessagesCount={setUnseenMessagesCount}
                      handleSeenAllMessges={handleSeenAllMessges}
                    />
                  </View>
                )}

                {!isChatComponent && (
                  <View>
                    <View style={styles.rideMapContainer}>
                      <MapView
                        ref={mapRef}
                        onMapReady={() => fitMapToMarkers()}
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
                          // latitudeDelta: 0.1,
                          // longitudeDelta: 0.1,
                        }}
                        mapPadding={{top: 550, right: 50, left: 50, bottom: 0}}
                        onRegionChangeComplete={(newRegion, details) => {
                          // console.log(`newRegion :>> `, newRegion);
                          // console.log(`details :>> `, details);
                          if (details.isGesture) {
                            setRegion(newRegion);
                          }
                        }}
                        // minZoomLevel={2}
                        // showsUserLocation={true}
                        // showsMyLocationButton={true}
                        // loadingEnabled={true}
                        style={[
                          styles.ridesMap,
                          ((isPickupScreen && !isRideStarted) ||
                            isReachedDrop ||
                            paymentModal) &&
                            styles.ridesMapOpacity,
                        ]}>
                        <Marker
                          identifier="myLocationMarker"
                          coordinate={mylocation}
                          // icon={require('../images/MapDriverIcon.png')}
                        />

                        {/* <Marker
                          identifier={
                            !isRideStarted
                              ? 'pickUpLocationMarker'
                              : 'dropLocationMarker'
                          }
                          coordinate={
                            !isRideStarted
                              ? {
                                  latitude: assignedRide.pickUpLocation[0],
                                  longitude: assignedRide.pickUpLocation[1],
                                }
                              : {
                                  latitude: assignedRide.dropLocation[0],
                                  longitude: assignedRide.dropLocation[1],
                                }
                          }
                          icon={require('../images/MapPickupDropLocationIcon.png')}
                        /> */}

                        {!isRideStarted && (
                          <Marker
                            identifier="pickUpLocationMarker"
                            coordinate={{
                              latitude: rideDetails.pickUpLocation[0],
                              longitude: rideDetails.pickUpLocation[1],
                            }}
                            icon={require('../images/MapPickupDropLocationIcon.png')}
                          />
                        )}

                        {isRideStarted && (
                          <Marker
                            identifier="dropLocationMarker"
                            coordinate={{
                              latitude: rideDetails.dropLocation[0],
                              longitude: rideDetails.dropLocation[1],
                            }}
                            icon={require('../images/MapPickupDropLocationIcon.png')}
                          />
                        )}
                        <Polyline
                          coordinates={path}
                          strokeColor={'#404080'}
                          strokeWidth={4}
                        />
                      </MapView>

                      <View
                        style={[
                          styles.modalView,
                          ((isPickupScreen && !isRideStarted) ||
                            isReachedDrop ||
                            paymentModal) &&
                            styles.ridesMapOpacity,
                        ]}>
                        <View style={styles.pickupDropModalContainer}>
                          <View style={styles.pickupDropModal}>
                            {!isRideStarted ? (
                              <PickUpLocationIcon2 />
                            ) : (
                              <DropLocationIcon />
                            )}

                            <View style={styles.pickupDropModalTextContainer}>
                              <Text style={styles.pickupDropModalText}>
                                {!isRideStarted
                                  ? 'Pickup Location:'
                                  : 'Drop Location:'}
                              </Text>
                              <Text style={styles.pickupDropModalTextData}>
                                {!isRideStarted
                                  ? rideDetails.pickUpAddress
                                  : rideDetails.dropAddress}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      {isPickupScreen && !isRideStarted && (
                        <TouchableWithoutFeedback>
                          <View style={styles.otpModalView}>
                            <Text style={styles.reachedPickupTextEnterOtp}>
                              Enter OTP
                            </Text>

                            <OTPInputView
                              style={styles.reachedPickupOtpInput}
                              pinCount={4}
                              code={OTP}
                              onCodeChanged={code => {
                                setOTP(code);
                              }}
                              autoFocusOnLoad={false}
                              selectionColor="black"
                              codeInputFieldStyle={styles.underlineStyleBase}
                              codeInputHighlightStyle={
                                styles.underlineStyleHighLighted
                              }
                              keyboardType="number-pad"
                              editable={true}
                              onCodeFilled={code => {
                                // console.log(`Code is ${code}, you are good to go!`);
                                sendOTP(code); // API Call to Verify-OTP.
                              }}
                            />

                            <TouchableOpacity
                              style={styles.doneButton}
                              // disabled={!isOtpVerified}
                              onPress={() => handleStartRideBtn()}>
                              <Text style={styles.reachedPickupDoneBtnText}>
                                Done
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </TouchableWithoutFeedback>
                      )}

                      {isReachedDrop && (
                        <View style={styles.otpModalView}>
                          <Text style={styles.rideCompletedModalText}>
                            Have you completed the ride?
                          </Text>

                          <View style={styles.rideCompletedModalBtnContainer}>
                            <Pressable
                              style={styles.noBtn}
                              onPress={() => {
                                setIsReachedDrop(false);
                              }}>
                              <Text style={styles.rideCompletedModalNoBtnText}>
                                No
                              </Text>
                            </Pressable>

                            <Pressable
                              onPress={confirmReachedDestination}
                              style={styles.yesBtn}>
                              <Text
                                // style={[styles.textStyle, {fontSize: wp(4)}]}>
                                style={styles.rideCompletedModalYesBtnText}>
                                Yes
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      )}

                      {paymentModal && (
                        <View style={styles.otpModalView}>
                          <View>
                            <Text style={styles.paymentModalHeaderText}>
                              {rideDetails.paymentMode === 'Cash'
                                ? 'Cash'
                                : 'Online'}
                            </Text>

                            <Text style={styles.paymentModalBodyText}>
                              Collect fare from the Rider
                            </Text>
                          </View>

                          <View style={styles.paymentModalFareContainer}>
                            <Text style={styles.paymentModalFareRupeeSymbol}>
                              ₹
                            </Text>
                            <Text style={styles.paymentModalFareText}>
                              {rideDetails.fare}
                            </Text>
                          </View>

                          <View style={styles.paymentModalButtonContainer}>
                            <Pressable
                              onPress={() =>
                                rideDetails.paymentMode === 'Cash'
                                  ? handleCashPayment()
                                  : handleOnlinePayment()
                              }
                              style={styles.paymentModalAcceptBtn}>
                              <Text
                                style={[styles.textStyle, {fontSize: wp(4)}]}>
                                {rideDetails.paymentMode === 'Cash'
                                  ? 'Received Cash'
                                  : 'Done'}
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      )}
                    </View>

                    <View
                      style={[
                        styles.rideFooter,
                        ((isPickupScreen && !isRideStarted) ||
                          isReachedDrop ||
                          paymentModal) &&
                          styles.ridesMapOpacity,
                      ]}>
                      <TouchableOpacity
                        onPress={() =>
                          navigateToGoogleMaps(
                            !isRideStarted
                              ? {
                                  latitude: rideDetails.pickUpLocation[0],
                                  longitude: rideDetails.pickUpLocation[1],
                                }
                              : {
                                  latitude: rideDetails.dropLocation[0],
                                  longitude: rideDetails.dropLocation[1],
                                },
                          )
                        }>
                        <Navigate />
                        <Text style={styles.textNavigateReached}>Navigate</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setUnseenMessagesCount(0);
                          handleSeenAllMessges();
                          setIsChatComponent(true);
                          setIsProfileModal(false);
                        }}>
                        {unseenMessagesCount > 0 && (
                          <Badge
                            status="error"
                            // status="success"
                            value={`${unseenMessagesCount}`}
                            containerStyle={styles.notificationBadge}
                          />
                        )}
                        <ChatIcon />
                        <Text style={styles.textNavigateReached}>Chat</Text>
                      </TouchableOpacity>

                      <View>
                        <TouchableOpacity
                          onPress={
                            !isRideStarted
                              ? handleReachedPickupBtn
                              : handleReachedDestinationBtn
                          }>
                          {!isRideStarted ? <Reached /> : <CompleteIcon />}
                          <Text style={styles.textNavigateReached}>
                            {!isRideStarted ? 'Reached' : 'Complete'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
  },
  deleteContainer: {
    display: 'flex',
    width: wp(100),
    height: hp(100),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  deleteModal: {
    backgroundColor: 'white',
    width: wp(60),
    height: hp(20),
    zIndex: 10,
    top: hp(0),
    left: wp(0),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontFamily: 'RobotoMono-Regular',
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  deleteText: {
    fontFamily: 'RobotoMono-Regular',
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: 'red',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(2),
    backgroundColor: '#ffffff',
  },
  profileIcon: {
    width: wp(8),
    height: wp(8),
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
  noRideContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOpacity: {
    opacity: 0.5,
  },
  offlineModalView: {
    backgroundColor: 'white',
    borderRadius: wp(5),
    padding: wp(7),
    shadowColor: '#000',
    shadowOffset: {
      width: wp(0),
      height: hp(2),
    },
    shadowOpacity: wp(0.25),
    shadowRadius: wp(4),
    elevation: hp(5),
    alignItems: 'center',
    justifyContent: 'center',
    gap: hp(2.5),
    position: 'absolute',
  },
  offlineModalHeaderText: {
    fontFamily: 'RobotoMono-Regular',
    color: '#212121',
    fontWeight: '500',
    fontSize: wp(5.5),
    textAlign: 'center',
  },
  offlineModalBodyText: {
    fontFamily: 'RobotoMono-Regular',
    color: '#464E5F',
    fontWeight: '500',
    fontSize: wp(4.5),
    textAlign: 'center',
  },
  availableRidesModal: {
    gap: hp(2),
  },
  availableRidesAddressView: {
    flexDirection: 'row',
    gap: wp(2),
    justifyContent: 'center',
  },
  availableRidesAddressTextView: {
    width: wp(70),
    gap: hp(1),
  },
  availableRidesAddressText: {
    fontFamily: 'RobotoMono-Regular',
    color: '#212121',
    fontWeight: 'bold',
    fontSize: hp(2.5),
  },
  availableRidesAddressDataText: {
    fontFamily: 'RobotoMono-Regular',
    color: 'grey',
    fontSize: hp(2),
  },
  availableRidesButtonsView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availableRidesAcceptButton: {
    borderRadius: hp(1),
    padding: hp(2),
    width: wp(40),
    margin: wp(2),
    backgroundColor: '#50CD89',
    borderColor: '#50CD89',
    borderWidth: wp(0.4),
    flex: 1,
  },
  noRidesMap: {
    width: wp(100),
    height: hp(93),
  },
  // levelOne: {
  //   alignSelf: 'center',
  // },
  // levelTwo: {
  //   alignSelf: 'center',
  //   position: 'absolute',
  //   zIndex: 1,
  // },
  // levelThree: {
  //   alignSelf: 'center',
  //   position: 'absolute',
  //   zIndex: 1,
  // },
  // levelFour: {
  //   alignSelf: 'center',
  //   position: 'absolute',
  //   zIndex: 1,
  // },
  ridesContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContainer: {
    alignItems: 'center',
  },
  rideMapContainer: {
    alignItems: 'center',
  },
  pickupDropModalContainer: {gap: hp(2)},
  pickupDropModal: {
    flexDirection: 'row',
    gap: wp(2),
    justifyContent: 'center',
  },
  pickupDropModalTextContainer: {
    width: wp(70),
    gap: hp(0.5),
  },
  pickupDropModalText: {
    fontFamily: 'RobotoMono-Regular',
    color: '#212121',
    fontWeight: 'bold',
    fontSize: hp(2),
  },
  pickupDropModalTextData: {
    fontFamily: 'RobotoMono-Regular',
    color: 'grey',
    fontSize: hp(1.7),
  },
  map: {
    width: wp(90),
    height: hp(80),
  },
  mapButton: {
    width: wp(20),
    height: hp(5),
    borderRadius: hp(1),
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginBottom: hp(2),
  },
  switch: {
    color: 'black',
    fontWeight: '600',
    fontSize: wp(30),
  },
  modalView: {
    margin: hp(2),
    backgroundColor: 'white',
    borderRadius: wp(5),
    padding: wp(4),
    shadowColor: '#000',
    shadowOffset: {
      width: wp(0),
      height: hp(2),
    },
    shadowOpacity: wp(0.25),
    shadowRadius: wp(4),
    elevation: hp(5),
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
  },
  button: {
    borderRadius: hp(1),
    padding: hp(2),
    width: wp(40),
    margin: wp(2),
  },
  buttonAccept: {
    backgroundColor: '#50CD89',
    borderColor: '#50CD89',
    borderWidth: wp(0.4),
  },
  buttonReject: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EB5757',
    borderWidth: wp(0.4),
  },
  textStyle: {
    fontFamily: 'RobotoMono-Regular',
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: hp(2),
    textAlign: 'center',
  },
  ridesMap: {
    width: wp(100),
    height: hp(81),
  },
  ridesMapOpacity: {
    opacity: 0.5,
  },
  textNavigateReached: {
    fontFamily: 'RobotoMono-Regular',
    textAlign: 'center',
    color: '#212121',
    fontSize: wp(4.5),
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
  underlineStyleBase: {
    width: wp(7),
    height: hp(6),
    borderWidth: wp(0),
    borderBottomWidth: wp(1),
    color: 'black',
    fontSize: wp(6),
    borderColor: '#118F5E',
    fontWeight: '700',
  },
  underlineStyleHighLighted: {
    borderColor: 'grey',
  },
  doneButton: {
    borderRadius: 5,
    padding: hp(0.8),
    width: wp(25),
    marginBottom: hp(1.5),
    marginTop: wp(7),
    backgroundColor: '#118F5E',
  },
  yesBtn: {
    borderRadius: 5,
    padding: hp(1.3),
    width: wp(37),
    margin: wp(2),
    backgroundColor: '#50CD89',
    borderColor: '#50CD89',
    borderWidth: wp(0.4),
  },
  noBtn: {
    borderRadius: 5,
    padding: hp(1.3),
    width: wp(37),
    margin: wp(2),
    backgroundColor: '#FFFFFF',
    borderColor: '#EB5757',
    borderWidth: wp(0.4),
  },
  pickUpAddressMap: {
    borderWidth: 1,
    borderColor: 'black',
    width: wp(90),
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: hp(1),
    padding: hp(0.5),
  },
  dropAddressMap: {
    borderWidth: 1,
    borderColor: 'black',
    width: wp(90),
    alignSelf: 'center',
    marginTop: hp(1),
    backgroundColor: '#ffffff',
    borderRadius: hp(1),
    padding: hp(0.5),
  },
  chatBtn: {
    width: wp(9),
    height: hp(5),
    alignItems: 'center',
  },
  profileModalView: {
    backgroundColor: 'white',
    borderRadius: wp(2),
    padding: wp(2),
    shadowColor: '#000000',
    shadowOffset: {
      width: wp(0),
      height: hp(2),
    },
    shadowOpacity: wp(0.25),
    shadowRadius: wp(4),
    elevation: hp(5),
    gap: hp(2),
    justifyContent: 'center',
    alignItems: 'center',
    width: wp(30),
    position: 'absolute',
    top: hp(6),
    right: wp(2),
    zIndex: 4,
  },
  infoCard1: {
    alignSelf: 'flex-end',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'row',
    padding: wp(3),
    borderRadius: wp(20),
    position: 'absolute',
    bottom: hp(15),
  },
  reachedPickupTextEnterOtp: {
    fontFamily: 'RobotoMono-Regular',
    color: 'black',
    fontSize: wp(5.5),
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: hp(1.5),
    marginBottom: wp(1),
  },
  reachedPickupOtpInput: {
    fontFamily: 'RobotoMono-Regular',
    width: wp(35),
    height: hp(5),
  },
  reachedPickupDoneBtnText: {
    fontFamily: 'RobotoMono-Regular',
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
    fontSize: wp(4.5),
  },
  rideCompletedModalText: {
    fontFamily: 'RobotoMono-Regular',
    color: '#212121',
    fontSize: wp(4.4),
    textAlign: 'center',
    margin: wp(2),
    fontWeight: '600',
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
    fontSize: wp(4),
  },
  rideCompletedModalYesBtnText: {
    fontFamily: 'RobotoMono-Regular',
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: wp(4),
  },
  paymentModalHeaderText: {
    fontFamily: 'RobotoMono-Regular',
    color: '#212121',
    fontSize: wp(5),
    textAlign: 'center',
    marginTop: wp(1.5),
    fontWeight: '600',
  },
  paymentModalBodyText: {
    fontFamily: 'RobotoMono-Regular',
    color: '#212121',
    fontSize: wp(4),
    textAlign: 'center',
    margin: wp(2),
  },
  paymentModalFareContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 4,
    marginTop: 4,
  },
  paymentModalFareRupeeSymbol: {
    fontFamily: 'RobotoMono-Regular',
    color: '#000000',
    fontSize: wp(6),
    marginRight: 8,
  },
  paymentModalFareText: {
    fontFamily: 'RobotoMono-Regular',
    color: '#212121',
    fontSize: wp(6),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  paymentModalButtonContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  paymentModalAcceptBtn: {
    borderRadius: 5,
    padding: hp(1.3),
    margin: wp(2),
    backgroundColor: '#50CD89',
    borderColor: '#50CD89',
    borderWidth: wp(0.4),
    width: wp(70),
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(10),
    // height:hp(15)
    flex: 1,
    position: Platform.OS == 'ios' ? 'absolute' : 'relative',
    bottom: 0,
    alignSelf: 'center',
    backgroundColor: '#f2f3f7',
    width: wp(100),
  },
  notificationBadge: {
    position: 'absolute',
    right: wp(0),
    top: hp(0.5),
    zIndex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalText1: {
    fontFamily: 'RobotoMono-Regular',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deleteButton: {
    backgroundColor: '#FF5050',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'RobotoMono-Regular',
    color: '#fff',
    fontSize: 16,
  },
});

export default MapScreen;
