import Geolocation from '@react-native-community/geolocation';
import NetInfo from '@react-native-community/netinfo';
import * as geolib from 'geolib';
import {isEmpty as _isEmpty} from 'lodash';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Linking,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE, Polyline} from 'react-native-maps';
import {
  heightPercentageToDP,
  heightPercentageToDP as hp,
  widthPercentageToDP,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import SlideButton from 'rn-slide-button';
import LoaderComponent from '../components/LoaderComponent';
import {
  removeCurrentOnGoingOrderDetails,
  removeRejectedOrders,
  removeUserData,
  setCurrentOnGoingOrderDetails,
  setGpsPermission,
  setLocationPermission,
  setRejectedOrders,
  setRiderPath,
} from '../redux/redux';
import customAxios from '../services/appservices';
import {
  getFlowsAPI,
  getForGroundIntervalDurationAPI,
  getProgressDetails,
  updateOrderStatusAPI,
} from '../services/rideservices';
import {
  driverLivelocationAPI,
  driverUpdateTimelineAPI,
  getAllOrdersAPI,
  getDriverStatusAPI,
  getMyPendingOrdersFromAPI,
  toggleDriverStatus,
  updatePaymentStatusInDB,
} from '../services/userservices';
import Navigate from '../svg/Navigate';
import SidebarIcon from '../svg/SidebarIcon';
import Spinner from '../svg/spinner';
import {getSocketInstance, socketDisconnect} from '../utils/socket';
import OnlineOfflineSwitch from './OnlineOfflineSwitch';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import {useFocusEffect} from '@react-navigation/native';

const OrderStatusEnum = {
  ORDER_ACCEPTED: 'ACCEPTED', //(Order Created Successfully.)
  ORDER_ALLOTTED: 'ALLOTTED', //(Rider Alloted to pick up the items.)
  ARRIVED: 'ARRIVED', //(Rider has reached the pickup location.)
  DISPATCHED: 'DISPATCHED', //(Order is picked up by the rider.)
  ARRIVED_CUSTOMER_DOORSTEP: 'ARRIVED_CUSTOMER_DOORSTEP', //(Rider has reached the drop-off location.)
  DELIVERED: 'DELIVERED', // (Successfully delivered and transaction has concluded.)
  // ORDER_CANCELLED: 'CANCELLED', // (Order is cancelled.)
  // RECEIVER_NOT_AVAILABLE: 'RECEIVER_NOT_AVAILABLE', //(Receiver is not available.)
  // RETURNED_TO_SELLER: 'RETURNED_TO_SELLER', //(Order was returned to Restaurant.)
};

const nextOrderStatus: any = {
  ACCEPTED: 'ALLOTTED',
  ALLOTTED: 'ARRIVED',
  ARRIVED: 'DISPATCHED',
  DISPATCHED: 'ARRIVED_CUSTOMER_DOORSTEP',
  ARRIVED_CUSTOMER_DOORSTEP: 'DELIVERED',
  // DELIVERED: 'CANCELLED',
  // ORDER_CANCELLED: 'RECEIVER_NOT_AVAILABLE',
  // RECEIVER_NOT_AVAILABLE: 'RETURNED_TO_SELLER',
};

export const SliderText = {
  [OrderStatusEnum.ORDER_ACCEPTED]: 'ACCEPT ORDER',
  [OrderStatusEnum.ORDER_ALLOTTED]: 'ARRIVED AT PICKUP LOCATION',
  [OrderStatusEnum.ARRIVED]: 'ORDER DISPATCHED',
  [OrderStatusEnum.DISPATCHED]: 'ARRIVED AT CUSTOMER LOCATION',
  [OrderStatusEnum.ARRIVED_CUSTOMER_DOORSTEP]: 'ORDER DELIVERED',
};

const supportContact = ['8178514753', '8800097708'];

export const dialCall = (number: string) => {
  let phoneNumber = `tel:${number}`;
  Linking.openURL(phoneNumber).catch((err: any) => {
    console.log('err', err), Alert.alert('Error', 'Unable to make a call');
  });
};

const screen = Dimensions.get('window');
const ASPECTS_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECTS_RATIO;

const PetPujaScreen = ({navigation, route}: any) => {
  const currentOnGoingOrderDetails = useSelector(
    (store: any) => store.currentOnGoingOrderDetails,
  );
  const loginToken = useSelector((store: any) => store.loginToken);
  const userId = useSelector((store: any) => store.userId);
  const userData = useSelector((store: any) => store.userData);
  const riderPath = useSelector((store: any) => store.riderPath);
  const rejectedOrders = useSelector((store: any) => store.rejectedOrders);
  const [progressData, setProgressData] = useState<any>({});
  const [isProfileModal, setIsProfileModal] = useState<boolean>(false);
  const dispatch = useDispatch();
  const mapRef = useRef<any>(null);
  const [isDriverOnline, setIsDriverOnline] = useState<boolean>(false);
  const netConnected = useRef(false);
  const [loading, setLoading] = useState(false);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [orderStarted, setOrderStarted] = useState<boolean>(false);
  const orderStartedRef = useRef<any>(false);
  const driverStatusRef = useRef<any>(false);
  const availableOrdersRef = useRef<any>([]);
  const rejectedOrderRef = useRef<any>([]);
  const [buttonText, setButtonText] = useState<any>('ACCEPT ORDER');
  const [heading, setHeading] = useState(0);
  const [path, setPath] = useState<any>([]);
  const [realPath, setRealPath] = useState<any>([]);
  const [cod, setcod] = useState(true);
  const [sliderButtonLoader, setSliderButtonLoader] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(true);
  const animation = useRef(new Animated.Value(-200)).current;
  const socketInstance = useRef<any>(undefined);
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
  const [geolocationWatchId, setGeolocationWatchId] = useState<any>();
  const buttonTextFlow = useRef<any>();
  const forGroundIntervalDuration = useRef<any>(15);
  const currentOnGoingOrderId = useRef<any>();

  const myLocation = useRef<any>({longitude: 72.870729, latitude: 19.051322});
  let prevLocation: any = useRef(null);

  const [region, setRegion] = useState({
    ...myLocation.current,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  const autoUpdateRegion = () => {
    setRegion({
      ...myLocation.current,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    });
  };

  useEffect(() => {
    autoUpdateRegion();
  }, [myLocation.current]);

  const animateCart = (toValue: number, callback: any = undefined) => {
    Animated.timing(animation, {
      toValue: toValue,
      duration: 500,
      useNativeDriver: true,
    }).start(callback);
  };

  const orderAcceptAnimation = () => {
    animation.setValue(-500); // Reset position to off-screen left
    animateCart(0); // Move on-screen
  };

  const orderRejectAnimation = () => {
    animation.setValue(500); // Reset position to off-screen below
    Animated.timing(animation, {
      toValue: 0, // Move on-screen
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const getProgressDetail = async () => {
    try {
      const response = await getProgressDetails();
      setProgressData(response.data);
    } catch (error) {
      console.log('Driver Detail error :>> ', error);
    }
  };

  const parseSocketMessage = (message: any) => {
    try {
      return JSON.parse(message);
    } catch (error) {
      console.log(`parseSocketMessage error :>> `, error);
    }
  };

  const driverStatusToggle = async (event: boolean) => {
    setLoading(true);
    try {
      await toggleDriverStatus();
      setAvailableOrders([]);
      setIsDriverOnline(event);
      netConnected.current = event;
      if (!event) {
        if (socketInstance.current?.connected) {
          await socketDisconnect();
        }
      } else {
        if (!socketInstance.current || !socketInstance.current?.connected) {
          socketInstance.current = await getSocketInstance(loginToken);
          setIsSocketConnected(socketInstance.current.connected);
          startOrderStatusListener();
        }
      }
      const eventStatus = event ? 'online' : 'offline';
      Toast.show({
        type: 'success',
        text1: `You are ${eventStatus}!`,
        visibilityTime: 5000,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.message || error,
        visibilityTime: 5000,
      });
    }
    setLoading(false);
  };

  const navigateToGoogleMaps = ({latitude, longitude}: any) => {
    const url = `https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=${latitude},${longitude}`;
    Linking.openURL(url).then((supported: any) => {
      if (supported) {
        return Linking.openURL(url);
      }
    });
  };

  const getCurrentPosition = useCallback(async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message:
            'This app needs access to your location " + "so you can track your movements in real-time, even when the app is closed.",',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          (position: any) => {
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            console.log('getCurrentPosition called', newLocation);
            myLocation.current = newLocation;
            driverLivelocationAPI({
              coordinates: [newLocation.latitude, newLocation.longitude],
            });
          },
          (error: any) => console.log('location err', error),
          {
            enableHighAccuracy: false,
            timeout: 10000,
          },
        );
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }, []);

  const emitLiveLocation = () => {
    try {
      Geolocation.clearWatch(geolocationWatchId);
      const watchId: any = Geolocation.watchPosition(
        (position: any) => {
          const {latitude, longitude, heading} = position.coords;
          const newLocation = {latitude, longitude};
          setHeading(heading);
          // console.log('live location emitted', newLocation);
          if (prevLocation.current) {
            // Calculate distance between previous and new location
            const distance = geolib.getDistance(
              prevLocation.current,
              newLocation,
            );
            // if (distance >= 15) {
            // console.log('Updating location and sending to API');
            myLocation.current = newLocation;
            driverLivelocationAPI({
              coordinates: [newLocation.latitude, newLocation.longitude],
            });
            prevLocation.current = newLocation;
            // } else {
            // console.log("Location change is less than 15 meters");
            prevLocation.current = newLocation;
            // }
          } else {
            // console.log('Setting initial location');
            myLocation.current = newLocation;
            prevLocation.current = newLocation;
          }
        },
        (error: any) => {
          console.log(`emitLiveLocation error :>> `, error);
          if (error.message == 'Location permission not granted.') {
            Toast.show({
              type: 'error',
              text1: 'Please allow location permission.',
            });
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 5000,
          distanceFilter: 15,
        },
      );

      setLoading(false);
      setGeolocationWatchId(watchId);
      return () => {
        Geolocation.clearWatch(watchId);
      };
    } catch (error: any) {
      console.log(`emitLiveLocation error :>> `, error);
      setLoading(false);
    }
  };

  const onAcceptOrder = async (order: any) => {
    setLoading(true);
    socketInstance.current?.emit('accept-order', {
      id: order._id.toString(),
      driverLoc: myLocation.current,
    });
  };

  const startOrderStatusListener = async () => {
    socketInstance.current.on('new-order', (message: any) => {
      const order = parseSocketMessage(message);
      if (availableOrdersRef.current.length == 0) {
        orderAcceptAnimation();
      }
      availableOrdersRef.current.push(order.order);
      availableOrdersRef.current = availableOrdersRef.current.filter(
        (obj1: any, i: any, arr: any) =>
          arr.findIndex(
            (obj2: any) =>
              obj2.order_details.vendor_order_id ===
              obj1.order_details.vendor_order_id,
          ) === i,
      );
      setAvailableOrders([...availableOrdersRef.current]);
    });

    socketInstance.current.on('order-update-response', (message: any) => {
      let body1 = parseSocketMessage(message);
      let body = body1.message;
      if (body.order.status === OrderStatusEnum['ORDER_ALLOTTED']) {
        if (body.driverId === userId) {
          setOrderStarted(true);
          orderStartedRef.current = true;
          setPath(body?.path?.coords);
          // setButtonText(SliderText[OrderStatusEnum.ORDER_ALLOTTED]);
          setButtonText(buttonTextFlow.current[1].breakingPointName);
          dispatch(setCurrentOnGoingOrderDetails(body.order));
          currentOnGoingOrderId.current = body.order._id;
          availableOrdersRef.current.shift();
          setAvailableOrders([...availableOrdersRef.current]);
          setLoading(false);
          Toast.show({
            type: 'success',
            text1: `ORDER SUCCESSFULLY ${body.order.status} !`,
            visibilityTime: 5000,
          });
        } else {
          if (!orderStartedRef.current && availableOrdersRef.current.length) {
            availableOrdersRef.current = availableOrdersRef.current.filter(
              (ele: any) => ele._id != body.order._id,
            );
            setAvailableOrders([...availableOrdersRef.current]);
            orderAcceptAnimation();
            setLoading(false);
            Toast.show({
              type: 'error',
              text1: `Order already assigned to someone!`,
              visibilityTime: 5000,
            });
          }
        }
      }
    });
  };

  const updateOrderStatus = async () => {
    try {
      setLoading(true);
      const req = {
        id: currentOnGoingOrderDetails._id,
        status: nextOrderStatus[currentOnGoingOrderDetails.status],
        location: myLocation.current,
      };

      const response = await updateOrderStatusAPI(req);
      if (
        (response.data.order.status === OrderStatusEnum.DELIVERED &&
          currentOnGoingOrderDetails.order_details.payment_status) ||
        response.data.order.status === 'CANCELLED'
      ) {
        dispatch(removeCurrentOnGoingOrderDetails());
        startProcessing();
        setOrderStarted(false);
        orderStartedRef.current = false;
        setButtonText('ACCEPT ORDER');
        dispatch(setRiderPath([]));
        setRealPath([]);
        setLoading(false);
        removeRejectedOrders();
        if (response.data.order.status === 'CANCELLED') {
          Toast.show({
            type: 'error',
            text1: 'Order cancelled by customer!',
            visibilityTime: 5000,
          });
          return;
        } else {
          Toast.show({
            type: 'success',
            text1: `ORDER DELIVERED SUCCESSFULLY!`,
            visibilityTime: 5000,
          });
        }
        getProgressDetail();
      } else if (
        response.data.order.status === OrderStatusEnum.DELIVERED &&
        !currentOnGoingOrderDetails.order_details.payment_status
      ) {
        setLoading(false);
        setcod(false);
        dispatch(setRiderPath([]));
        setRealPath([]);
        Toast.show({
          type: 'success',
          text1: `ORDER DELIVERED SUCCESSFULLY!`,
          visibilityTime: 5000,
        });
      } else {
        switch (response.data.order.status) {
          case OrderStatusEnum.ARRIVED:
            // setButtonText(SliderText[OrderStatusEnum.ARRIVED]);
            setButtonText(buttonTextFlow.current[2].breakingPointName);
            break;
          case OrderStatusEnum.DISPATCHED:
            // setButtonText(SliderText[OrderStatusEnum.DISPATCHED]);
            setButtonText(buttonTextFlow.current[3].breakingPointName);
            break;
          case OrderStatusEnum.ARRIVED_CUSTOMER_DOORSTEP:
            // setButtonText(SliderText[OrderStatusEnum.ARRIVED_CUSTOMER_DOORSTEP]);
            setButtonText(buttonTextFlow.current[4].breakingPointName);
            break;
          default:
            break;
        }
        if (response.data.order.status == 'DISPATCHED') {
          setPath(response.data.order?.pickupToDrop);
        }
        setLoading(false);
        dispatch(setCurrentOnGoingOrderDetails(response.data.order));
        if (response.data.order.status == 'ARRIVED') {
          Toast.show({
            type: 'success',
            text1: `RIDER SUCCESSFULLY ${
              nextOrderStatus[currentOnGoingOrderDetails.status]
            } !`,
            visibilityTime: 5000,
          });
        } else {
          Toast.show({
            type: 'success',
            text1: `ORDER SUCCESSFULLY ${
              nextOrderStatus[currentOnGoingOrderDetails.status]
            } !`,
            visibilityTime: 5000,
          });
        }
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const onRejectOrder = async () => {
    try {
      orderRejectAnimation();
      const rejectedOrder: any = availableOrdersRef.current.shift();
      rejectedOrderRef.current = [...rejectedOrderRef.current, rejectedOrder];
      setAvailableOrders([...availableOrdersRef.current]);
      dispatch(setRejectedOrders([...rejectedOrderRef.current]));
    } catch (error) {
      console.log(error);
    }
  };

  const paymentButton = async () => {
    try {
      setLoading(true);
      await updatePaymentStatusInDB({
        id: currentOnGoingOrderDetails._id,
        status: true,
      });
      setcod(true);
      setOrderStarted(false);
      orderStartedRef.current = false;
      setPath([]);
      dispatch(removeCurrentOnGoingOrderDetails());
      setButtonText('ACCEPT ORDER');
      setAvailableOrders([]);
      availableOrdersRef.current = [];
      setLoading(false);
      Toast.show({
        type: 'success',
        text1: `PAYMENT DONE!`,
        visibilityTime: 5000,
      });
      startProcessing();
    } catch (error) {
      console.log(error);
    }
  };

  const handleMyPendingOrder = (order: any) => {
    try {
      setOrderStarted(true);
      orderStartedRef.current = true;
      dispatch(setCurrentOnGoingOrderDetails(order));
      currentOnGoingOrderId.current = order._id;
      setRealPath(order.realPath);
      if (order.status == 'ALLOTTED' || order.status == 'ARRIVED') {
        setPath(order?.riderPathToPickUp);
      } else {
        setPath(order?.pickupToDrop);
      }
      switch (order.status) {
        case OrderStatusEnum.ORDER_ALLOTTED:
          // setButtonText(SliderText[OrderStatusEnum.ORDER_ALLOTTED]);
          setButtonText(buttonTextFlow.current[1].breakingPointName);
          break;
        case OrderStatusEnum.ARRIVED:
          // setButtonText(SliderText[OrderStatusEnum.ARRIVED]);
          setButtonText(buttonTextFlow.current[2].breakingPointName);
          break;
        case OrderStatusEnum.DISPATCHED:
          // setButtonText(SliderText[OrderStatusEnum.DISPATCHED]);
          setButtonText(buttonTextFlow.current[3].breakingPointName);
          break;
        case OrderStatusEnum.ARRIVED_CUSTOMER_DOORSTEP:
          // setButtonText(SliderText[OrderStatusEnum.ARRIVED_CUSTOMER_DOORSTEP]);
          setButtonText(buttonTextFlow.current[4].breakingPointName);
          break;
        case OrderStatusEnum.DELIVERED:
          setcod(false);
          break;
        default:
          break;
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  const startProcessing = async () => {
    try {
      let resp: any = await getMyPendingOrdersFromAPI();
      if (resp.data) {
        handleMyPendingOrder(resp.data);
        setAvailableOrders([]);
        availableOrdersRef.current = [];
        return;
      }
      resp = await getAllOrdersAPI();
      if (availableOrdersRef.current.length == 0) {
        orderAcceptAnimation();
      }

      const newOrders = resp.data.filter(
        (element: any) =>
          !rejectedOrders
            .map((order: any) => order.order_details.vendor_order_id)
            .includes(element.order_details.vendor_order_id),
      );

      setAvailableOrders(newOrders);
      availableOrdersRef.current = [...newOrders];
      setLoading(false);
    } catch (error) {
      console.log('error', error);
    }
  };

  const getDriverStatus = async () => {
    try {
      setLoading(true);
      driverStatusRef.current = true;
      const res: any = await getDriverStatusAPI();

      const status = res.data.rideStatus === 'offline' ? false : true;
      setIsDriverOnline(status);

      if (!socketInstance.current || !socketInstance.current?.connected) {
        socketInstance.current = await getSocketInstance(loginToken);
        setIsSocketConnected(socketInstance.current.connected);
        startOrderStatusListener();
      }
    } catch (error) {
      driverStatusRef.current = false;
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  // const requestLocationPermission = async () => {
  //   // Geolocation.requestAuthorization('always');
  //   try {
  //     const granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  //       {
  //         title: 'Location Permission',
  //         message: 'App needs access to your location.',
  //         buttonNeutral: 'Ask Me Later',
  //         buttonNegative: 'Cancel',
  //         buttonPositive: 'OK',
  //       },
  //     );

  //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //       // console.log('Location permission granted');
  //     } else {
  //       console.log('Location permission denied');
  //     }
  //     PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
  //       {
  //         title: 'Background Location Permission',
  //         message:
  //           'We need access to your location ' +
  //           'so you can get live quality updates.',
  //         buttonNeutral: 'Ask Me Later',
  //         buttonNegative: 'Cancel',
  //         buttonPositive: 'OK',
  //       },
  //     );
  //   } catch (err) {
  //     console.warn(err);
  //   }
  // };

  const startForeground = () => {
    ReactNativeForegroundService.add_task(startTracking, {
      delay: forGroundIntervalDuration.current * 1000,
      onLoop: true,
      taskId: 'taskid',
      onError: (e: any) => console.log(`Error logging:`, e),
    });

    ReactNativeForegroundService.start({
      id: 1,
      title: 'Location Tracking',
      message: 'Tracking your current location',
      vibration: true,
      // icon: 'ic_launcher',
      // button: true,
      // button2: false,
      // // buttonText: "Button",
      // // button2Text: "Anther Button",
      // // buttonOnPress: "cray",
      // setOnlyAlertOnce: "false",
      // color: '#000000',
    });
  };

  const stopForeground = async () => {
    // Make always sure to remove the task before stoping the service. and instead of re-adding the task you can always update the task.
    if (ReactNativeForegroundService.is_running()) {
      return await ReactNativeForegroundService.stop();
    }
    // Stoping Foreground service.
    return await ReactNativeForegroundService.stopAll();
  };

  const startTracking = async () => {
    try {
      // console.log(
      //   'fetching location with orderId===> ',
      //   currentOnGoingOrderId.current,
      // );
      await emitLiveLocation();
      // const distance = geolib.getDistance(myLocation.current, newLocation);
      // if (distance < 15) {Start Service Triggered
      //   console.log('Not much change in location');
      //   return;
      // }
      if (prevLocation.current) {
        setRealPath((prev: any) => [...prev, prevLocation.current]);
        // console.log('real path>>>>>>>>', realPath);
        myLocation.current = prevLocation.current;
        const payload = {
          orderId: currentOnGoingOrderId.current,
          pathCoords: {coords: prevLocation.current, time: Date.now()},
        };
        // dispatch(setRiderPath(realPath));
        const res = await driverUpdateTimelineAPI(payload);
      }
    } catch (error) {
      console.warn('error on tracking', error);
    }
  };

  const getForGroundIntervalDuration = async () => {
    try {
      const res = await getForGroundIntervalDurationAPI();
      forGroundIntervalDuration.current = res.data.forGroundIntervalDuration;
    } catch (error) {
      console.log('error', error);
    }
  };

  const getButtonTextFlows = async () => {
    try {
      const result = await getFlowsAPI();
      buttonTextFlow.current = result.data;
      // console.log('getButtonTextFlows>>>>>', result.data);
    } catch (error: any) {
      console.log('getButtonTextFlows error', {error});
    }
  };

  useFocusEffect(
    useCallback(() => {
      getButtonTextFlows();
    }, []),
  );

  useEffect(() => {
    if (orderStartedRef.current) {
      return;
    }

    if (!driverStatusRef.current) {
      getDriverStatus();
      getCurrentPosition();
    }

    //dispatch(setCurrentOnGoingOrderDetails({}));
    getProgressDetail();
    if (isDriverOnline) {
      rejectedOrderRef.current = rejectedOrders;
      startProcessing();
    }

    let unsubscribe: any, watchId: any;

    unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected ?? false; // Use false if state.isConnected is null
      setConnected(isConnected);

      if (!isConnected) {
        driverStatusRef.current = false;
      }
      if (!driverStatusRef.current) {
        if (isConnected && !orderStartedRef.current) {
          driverStatusRef.current = true;
          rejectedOrderRef.current = rejectedOrders;
          getDriverStatus();
          startProcessing();
        }
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [route.params?.refresh, isDriverOnline]);

  useEffect(() => {
    if (orderStarted && currentOnGoingOrderDetails._id) {
      startForeground();
      Geolocation.clearWatch(geolocationWatchId);
    } else {
      getForGroundIntervalDuration();
      stopForeground();
      emitLiveLocation();
    }
  }, [orderStarted, currentOnGoingOrderDetails]);

  return (
    <>
      {!connected && (
        <View
          style={{
            zIndex: 5,
            position: 'absolute',
            top: hp(6),
            alignSelf: 'flex-start',
            justifyContent: 'center',
          }}>
          {/* <Text>You are not connected to the internet.</Text> */}
          <Image
            style={{height: hp(30), width: wp(100)}}
            source={require('../svg/images/Offline.png')}
          />
        </View>
      )}

      {isProfileModal && (
        <View style={styles.profileModalView}>
          <TouchableOpacity
            onPress={() => {
              setIsProfileModal(false);
            }}></TouchableOpacity>

          <TouchableOpacity onPress={() => dialCall(supportContact[0])}>
            <View style={styles.supportRow}>
              <Image
                source={require('../images/callicon.png')}
                style={styles.supportCallIcon}
              />
              <Text style={styles.supportText}>{supportContact[0]}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => dialCall(supportContact[1])}>
            <View style={styles.supportRow}>
              <Image
                source={require('../images/callicon.png')}
                style={styles.supportCallIcon}
              />
              <Text style={styles.supportText}>{supportContact[1]}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {
        <View style={styles.headerBar}>
          <View>
            <TouchableOpacity
              onPress={() => {
                navigation.toggleDrawer();
              }}>
              <SidebarIcon />
            </TouchableOpacity>
          </View>

          {_isEmpty(currentOnGoingOrderDetails) && (
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
              {/* <Text style={styles.profileSupportIcon}>
                {userData.firstName[0].toUpperCase()}
              </Text> */}
              <Image
                style={styles.profileSupportIcon} // Define this style to size the image properly
                source={require('../images/Support.jpg')}
              />
            </TouchableOpacity>
          </View>
        </View>
      }

      {loading ? (
        <LoaderComponent />
      ) : (
        <>
          {!isDriverOnline && (
            <View style={styles.offlineModalView}>
              <Text style={styles.offlineModalHeaderText}>
                Hello {userData.firstName.split(' ')[0]}!
              </Text>
              {/* Today Model View */}
              <View style={styles.todayModalView}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    style={{fontSize: 25, color: '#333333', marginLeft: wp(3)}}>
                    Today Progress{' '}
                  </Text>
                </View>
                <View style={styles.circleModel}>
                  <View style={styles.circle}>
                    <View
                      style={{flexDirection: 'column', alignItems: 'center'}}>
                      <Image source={require('../images/Rupay.png')} />
                      <Text> Earning</Text>
                    </View>
                    <Text style={{fontWeight: 'bold'}}>
                      {progressData.today?.earning || 0}
                    </Text>
                  </View>
                  <View style={styles.circle}>
                    <View
                      style={{flexDirection: 'column', alignItems: 'center'}}>
                      <Image source={require('../images/Rupay.png')} />
                      <Text> Earning</Text>
                    </View>
                    <Text style={{fontWeight: 'bold'}}>
                      {progressData.today?.earning || 0}
                    </Text>
                  </View>
                  <View style={styles.circle}>
                    <View
                      style={{flexDirection: 'column', alignItems: 'center'}}>
                      <Image source={require('../images/watch.png')} />
                      <Text>On-Ride Duration</Text>
                    </View>

                    <Text style={{fontWeight: 'bold'}}>
                      {progressData.today?.loginHours || 0}
                    </Text>
                  </View>
                  <View style={styles.circle}>
                    <View
                      style={{flexDirection: 'column', alignItems: 'center'}}>
                      <Image source={require('../images/order.png')} />
                      <Text>Orders</Text>
                    </View>
                    <Text style={{fontWeight: 'bold'}}>
                      {progressData.today?.orders || 0}
                    </Text>
                  </View>
                </View>
              </View>
              {/* Week Model View */}
              <View style={styles.todayModalView}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    style={{fontSize: 25, color: '#333333', marginLeft: wp(3)}}>
                    This Week Progress
                  </Text>
                </View>
                <View style={styles.circleModel}>
                  <View style={styles.circle}>
                    <View
                      style={{flexDirection: 'column', alignItems: 'center'}}>
                      <Image source={require('../images/Rupay.png')} />
                      <Text> Earning</Text>
                    </View>
                    <Text style={{fontWeight: 'bold'}}>
                      {progressData.week?.earning || 0}
                    </Text>
                  </View>
                  <View style={styles.circle}>
                    <View
                      style={{flexDirection: 'column', alignItems: 'center'}}>
                      <Image source={require('../images/watch.png')} />
                      <Text>On-Ride Duration</Text>
                    </View>

                    <Text style={{fontWeight: 'bold'}}>
                      {progressData.week?.loginHours || 0}
                    </Text>
                  </View>
                  <View style={styles.circle}>
                    <View
                      style={{flexDirection: 'column', alignItems: 'center'}}>
                      <Image source={require('../images/order.png')} />
                      <Text>Orders</Text>
                    </View>
                    <Text style={{fontWeight: 'bold'}}>
                      {progressData.week?.orders || 0}
                    </Text>
                  </View>
                </View>
              </View>
              {/* Month Model View */}
              <View style={styles.todayModalView}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    style={{fontSize: 25, color: '#333333', marginLeft: wp(3)}}>
                    This Month Progress
                  </Text>
                </View>
                <View style={styles.circleModel}>
                  <View style={styles.circle}>
                    <View
                      style={{flexDirection: 'column', alignItems: 'center'}}>
                      <Image source={require('../images/Rupay.png')} />
                      <Text> Earning</Text>
                    </View>
                    <Text style={{fontWeight: 'bold'}}>
                      {progressData.month?.earning || 0}
                    </Text>
                  </View>
                  <View style={styles.circle}>
                    <View
                      style={{flexDirection: 'column', alignItems: 'center'}}>
                      <Image source={require('../images/watch.png')} />
                      <Text>On-Ride Duration</Text>
                    </View>

                    <Text style={{fontWeight: 'bold'}}>
                      {progressData.month?.loginHours || 0}
                    </Text>
                  </View>
                  <View style={styles.circle}>
                    <View
                      style={{flexDirection: 'column', alignItems: 'center'}}>
                      <Image source={require('../images/order.png')} />
                      <Text>Orders</Text>
                    </View>
                    <Text style={{fontWeight: 'bold'}}>
                      {progressData.month?.orders || 0}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
          <View style={styles.container}>
            {isDriverOnline &&
              _isEmpty(currentOnGoingOrderDetails) &&
              _isEmpty(availableOrders) &&
              !orderStarted && (
                <View style={styles.offlineModalView}>
                  <Text style={styles.offlineModalHeaderText}>
                    Hello {userData.firstName.split(' ')[0]}!
                  </Text>
                  {/* Searching for Order */}
                  <View style={styles.SearchingModalView}>
                    <ImageBackground
                      source={require('../images/map.png')} // Replace 'path_to_your_image' with the actual path or URL of your image
                      style={{
                        width: wp(95),
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: hp(8),
                      }} // Adjust the width and height according to your image dimensions
                    >
                      <View style={styles.spinnerContainer}>
                        <Spinner visible={true} />
                      </View>
                      <View style={styles.SearchingModalViewChild}>
                        <Text
                          style={{
                            textAlign: 'center',
                            fontFamily: 'RobotoMono-Regular',
                            fontSize: wp(4),
                            fontWeight: 'bold',
                            color: '#333333',
                          }}>
                          Searching for Orders ...
                        </Text>
                      </View>
                    </ImageBackground>
                  </View>
                  {/* Today Model View */}
                  <View style={styles.todayModalView}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text
                        style={{
                          fontSize: 25,
                          color: '#333333',
                          marginLeft: wp(3),
                        }}>
                        Today Progress
                      </Text>
                    </View>
                    <View style={styles.circleModel}>
                      {/* <View style={styles.circle}>
                        <View
                          style={{
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}>
                          <Image source={require('../images/Rupay.png')} />
                          <Text> Earning</Text>
                        </View>
                        <Text style={{fontWeight: 'bold'}}>
                          {progressData.today?.earning || 0}
                        </Text>
                      </View> */}
                      <View style={styles.circle}>
                        <View
                          style={{
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}>
                          <Image source={require('../images/Rupay.png')} />
                          <Text> Total KM's</Text>
                        </View>
                        <Text style={{fontWeight: 'bold'}}>
                          {progressData.today?.earning || 0}
                        </Text>
                      </View>
                      <View style={styles.circle}>
                        <View
                          style={{
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}>
                          <Image source={require('../images/watch.png')} />
                          <Text>On-Ride Duration</Text>
                        </View>

                        <Text style={{fontWeight: 'bold'}}>
                          {progressData.today?.loginHours || 0}
                        </Text>
                      </View>
                      <View style={styles.circle}>
                        <View
                          style={{
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}>
                          <Image source={require('../images/order.png')} />
                          <Text>Orders</Text>
                        </View>
                        <Text style={{fontWeight: 'bold'}}>
                          {progressData.today?.orders || 0}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {/* Week Model View */}
                  <View style={styles.todayModalView}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text
                        style={{
                          fontSize: 25,
                          color: '#333333',
                          marginLeft: wp(3),
                        }}>
                        This Week Progress
                      </Text>
                    </View>
                    <View style={styles.circleModel}>
                      {/* <View style={styles.circle}>
                        <View
                          style={{
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}>
                          <Image source={require('../images/Rupay.png')} />
                          <Text> Earning</Text>
                        </View>
                        <Text style={{fontWeight: 'bold'}}>
                          {progressData.today?.earning || 0}
                        </Text>
                      </View> */}
                      <View style={styles.circle}>
                        <View
                          style={{
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}>
                          <Image source={require('../images/Rupay.png')} />
                          <Text> Total KM's</Text>
                        </View>
                        <Text style={{fontWeight: 'bold'}}>
                          {progressData.week?.earning || 0}
                        </Text>
                      </View>
                      <View style={styles.circle}>
                        <View
                          style={{
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}>
                          <Image source={require('../images/watch.png')} />
                          <Text>On-Ride Duration</Text>
                        </View>

                        <Text style={{fontWeight: 'bold'}}>
                          {progressData.week?.loginHours || 0}
                        </Text>
                      </View>
                      <View style={styles.circle}>
                        <View
                          style={{
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}>
                          <Image source={require('../images/order.png')} />
                          <Text>Orders</Text>
                        </View>
                        <Text style={{fontWeight: 'bold'}}>
                          {progressData.week?.orders || 0}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {/* Month Model View */}
                  <View style={styles.todayModalView}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text
                        style={{
                          fontSize: 25,
                          color: '#333333',
                          marginLeft: wp(3),
                        }}>
                        This Month Progress
                      </Text>
                    </View>
                    <View style={styles.circleModel}>
                      {/* <View style={styles.circle}>
                        <View
                          style={{
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}>
                          <Image source={require('../images/Rupay.png')} />
                          <Text> Earning</Text>
                        </View>
                        <Text style={{fontWeight: 'bold'}}>
                          {progressData.today?.earning || 0}
                        </Text>
                      </View> */}
                      <View style={styles.circle}>
                        <View
                          style={{
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}>
                          <Image source={require('../images/Rupay.png')} />
                          <Text> Total KM's</Text>
                        </View>
                        <Text style={{fontWeight: 'bold'}}>
                          {progressData.month?.earning || 0}
                        </Text>
                      </View>
                      <View style={styles.circle}>
                        <View
                          style={{
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}>
                          <Image source={require('../images/watch.png')} />
                          <Text>On-Ride Duration</Text>
                        </View>

                        <Text style={{fontWeight: 'bold'}}>
                          {progressData.month?.loginHours || 0}
                        </Text>
                      </View>
                      <View style={styles.circle}>
                        <View
                          style={{
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}>
                          <Image source={require('../images/order.png')} />
                          <Text>Orders</Text>
                        </View>
                        <Text style={{fontWeight: 'bold'}}>
                          {progressData.month?.orders || 0}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

            {_isEmpty(currentOnGoingOrderDetails) &&
              availableOrders[0] &&
              !orderStarted && (
                <>
                  {loading ? (
                    <LoaderComponent />
                  ) : (
                    <Animated.View
                      style={{transform: [{translateY: animation}]}}>
                      <ImageBackground source={require('../images/Sukam.jpg')}>
                        <View
                          key={`order_${0 + 1}`}
                          style={[styles.modalView, {opacity: 2}]}>
                          {/* orderId Text */}
                          <View style={{top: wp(3)}}>
                            <Text
                              style={{
                                fontFamily: 'Roboto Mono',
                                fontSize: hp(2.5),
                                fontWeight: '600',
                                textAlign: 'center',
                                color: '#212121',
                              }}>
                              Order Id :{' '}
                              <Text
                                style={{
                                  fontFamily: 'RobotoMono-Regular',
                                  fontWeight: '700',
                                  color: '#118F5E',
                                  fontSize: 20,
                                }}>
                                {availableOrders[0].order_details?.vendor_order_id.slice(
                                  -6,
                                )}
                              </Text>
                            </Text>
                          </View>
                          {/* Circul data */}
                          <View style={styles.circleModel}>
                            <View style={styles.circle}>
                              <Text style={{alignItems: 'center'}}>{'₹'}</Text>
                              <Text style={{alignItems: 'center'}}>
                                {'Earning'}
                              </Text>
                              <Text
                                style={{
                                  fontWeight: '600',
                                  color: '#000000',
                                  fontSize: 15,
                                }}>
                                {'₹ '}0
                              </Text>
                            </View>
                          </View>
                          {/* <View style={styles.text}> */}

                          <View style={{alignItems: 'center'}}>
                            <Text>
                              <Image source={require('../images/cart.png')} />{' '}
                              Pickup Location
                            </Text>
                            <Text
                              style={{
                                fontWeight: '600',
                                color: '#333333',
                                fontSize: 15,
                              }}>
                              {availableOrders[0].pickup_details?.address}
                            </Text>
                          </View>
                          <View
                            style={{alignItems: 'center', marginTop: hp(2)}}>
                            <Text>
                              <Image source={require('../images/cart.png')} />{' '}
                              Drop Location
                            </Text>
                            <Text
                              style={{
                                fontWeight: '600',
                                color: '#333333',
                                fontSize: 15,
                              }}>
                              {availableOrders[0].drop_details?.address}
                            </Text>
                          </View>
                          {/* SliderButton */}
                          <View
                            style={{
                              flex: 1,
                              justifyContent: 'flex-end',
                              marginBottom: hp(0),
                            }}>
                            <SlideButton
                              width={290}
                              height={50}
                              animationDuration={180}
                              autoResetDelay={1080}
                              animation={true}
                              autoReset={true}
                              borderRadius={15}
                              sliderWidth={50}
                              icon={
                                <Image
                                  source={require('../svg/arrow.png')}
                                  style={styles.thumbImage}
                                />
                              } // Adjust width and height as needed
                              onReachedToEnd={() =>
                                onAcceptOrder(availableOrders[0])
                              }
                              containerStyle={{
                                backgroundColor: '#118F5E',
                                color: 'red',
                              }}
                              underlayStyle={{backgroundColor: 'Red'}}
                              title={buttonText}
                              disabled={!connected || !isSocketConnected}
                              slideDirection="right"></SlideButton>

                            <SlideButton
                              width={290}
                              height={50}
                              borderRadius={15}
                              animationDuration={180}
                              autoResetDelay={1080}
                              animation={true}
                              autoReset={true}
                              sliderWidth={50}
                              icon={
                                <Image
                                  source={require('../svg/arrow.png')}
                                  style={styles.thumbImage}
                                />
                              } // Adjust width and height as needed
                              onReachedToEnd={() => onRejectOrder()}
                              containerStyle={{
                                backgroundColor: '#D11A2A',
                                color: 'red',
                              }}
                              underlayStyle={{backgroundColor: 'Red'}}
                              title="Reject Order"
                              titleStyle={{color: 'white'}}
                              disabled={!connected || !isSocketConnected}
                              slideDirection="right">
                              <Text style={{color: 'red', fontSize: 18}}></Text>
                            </SlideButton>
                          </View>
                        </View>
                      </ImageBackground>
                    </Animated.View>
                  )}
                </>
              )}

            {/* // If order Accepted */}
            {orderStarted && !_isEmpty(currentOnGoingOrderDetails) && (
              <View>
                {loading ? (
                  <LoaderComponent />
                ) : (
                  <>
                    {/* order Details card */}
                    {[
                      OrderStatusEnum.ORDER_ACCEPTED,
                      OrderStatusEnum.ARRIVED,
                      OrderStatusEnum.ORDER_ALLOTTED,
                    ].includes(currentOnGoingOrderDetails.status) && (
                      <View style={styles.orderDetailsCard}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            // left: wp(7),
                            top: hp(2),
                          }}>
                          <Text style={{left: wp(6)}}>
                            Order ID:{' '}
                            <Text
                              style={{
                                fontFamily: 'RobotoMono-Regular',
                                fontWeight: '700',
                                color: '#118F5E',
                                fontSize: 15,
                              }}>
                              {currentOnGoingOrderDetails?.order_details.vendor_order_id.slice(
                                -6,
                              )}
                            </Text>
                          </Text>
                          <Text style={{color: '#828282', right: wp(6)}}>
                            {/* <Image source={require('../images/Rupay.png')} /> */}
                            {'₹'} {'Earning'}
                          </Text>
                        </View>
                        <View
                          style={{
                            top: hp(2),
                            alignSelf: 'flex-end',
                            alignItems: 'center',
                            right: wp(6),
                            width: wp(15),
                          }}>
                          <Text
                            style={{
                              color: '#000000',
                              fontFamily: 'RobotoMono-Regular',
                              fontWeight: '700',
                              fontSize: 16,
                            }}>
                            {0}
                            {'₹'}
                          </Text>
                        </View>
                        <View style={styles.line} />
                        <View style={{alignItems: 'center', top: hp(6)}}>
                          <Text>
                            <Image source={require('../images/cart.png')} />{' '}
                            Food Pickup Location
                          </Text>
                          <Text
                            style={{
                              fontWeight: '600',
                              color: '#333333',
                              fontSize: 15,
                            }}>
                            {
                              currentOnGoingOrderDetails?.pickup_details
                                ?.address
                            }
                          </Text>
                        </View>
                        <View style={styles.line1} />
                        <View style={styles.contactNumber}>
                          <TouchableOpacity
                            onPress={() =>
                              dialCall(
                                currentOnGoingOrderDetails.pickup_details
                                  .contact_number,
                              )
                            }>
                            <Image
                              source={require('../images/callicon.png')}
                              style={styles.callIcon}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() =>
                              dialCall(
                                currentOnGoingOrderDetails.pickup_details
                                  .contact_number,
                              )
                            }>
                            <Text style={{color: '#333333'}}>
                              {' '}
                              +91
                              {
                                currentOnGoingOrderDetails.pickup_details
                                  .contact_number
                              }
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                    {[
                      OrderStatusEnum.DISPATCHED,
                      OrderStatusEnum.ARRIVED_CUSTOMER_DOORSTEP,
                    ].includes(currentOnGoingOrderDetails.status) &&
                      cod && (
                        <View style={styles.orderDetailsCard}>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              // left: wp(7),
                              top: hp(2),
                            }}>
                            <Text style={{left: wp(6)}}>
                              Order ID:{' '}
                              <Text
                                style={{
                                  fontFamily: 'RobotoMono-Regular',
                                  fontWeight: '700',
                                  color: '#118F5E',
                                  fontSize: 15,
                                }}>
                                {currentOnGoingOrderDetails?.order_details.vendor_order_id.slice(
                                  -6,
                                )}
                              </Text>
                            </Text>
                            <Text style={{color: '#828282', right: wp(6)}}>
                              {/* <Image source={require('../images/Rupay.png')} /> */}
                              {'₹'} {'Earning'}
                            </Text>
                          </View>
                          <View
                            style={{
                              top: hp(2),
                              alignSelf: 'flex-end',
                              alignItems: 'center',
                              right: wp(6),
                              width: wp(15),
                            }}>
                            <Text
                              style={{
                                color: '#000000',
                                fontFamily: 'RobotoMono-Regular',
                                fontWeight: '700',
                                fontSize: 16,
                              }}>
                              {
                                currentOnGoingOrderDetails.order_details
                                  .order_total
                              }
                              {'₹'}
                            </Text>
                          </View>
                          <View style={styles.line} />
                          <View style={{alignItems: 'center', top: hp(6)}}>
                            <Text>
                              <Image source={require('../images/cart.png')} />{' '}
                              Food Drop Location
                            </Text>
                            <Text
                              style={{
                                fontWeight: '600',
                                color: '#333333',
                                fontSize: 15,
                              }}>
                              {
                                currentOnGoingOrderDetails?.drop_details
                                  ?.address
                              }
                            </Text>
                          </View>
                          <View style={styles.line1} />
                          <View style={styles.contactNumber}>
                            <TouchableOpacity
                              onPress={() =>
                                dialCall(
                                  currentOnGoingOrderDetails.drop_details
                                    .contact_number,
                                )
                              }>
                              <Image
                                source={require('../images/callicon.png')}
                                style={styles.callIcon}
                              />
                            </TouchableOpacity>
                            {/* <callLogo /> */}
                            <TouchableOpacity
                              onPress={() =>
                                dialCall(
                                  currentOnGoingOrderDetails.drop_details
                                    .contact_number,
                                )
                              }>
                              <Text style={{color: '#333333'}}>
                                {' '}
                                +91
                                {
                                  currentOnGoingOrderDetails.drop_details
                                    .contact_number
                                }
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    {!cod && (
                      <View style={styles.paymentWindiw}>
                        <Text style={styles.paymentText}>Cash</Text>
                        <Text style={{fontSize: 18}}>
                          Please collect the order amount from the customer.
                        </Text>
                        <Text style={styles.totalorder}>
                          ₹{' '}
                          {currentOnGoingOrderDetails.order_details.order_total}
                        </Text>
                        <Pressable
                          style={styles.paymentButton}
                          onPress={() => {
                            paymentButton();
                          }}>
                          <Text style={{color: 'white', fontSize: 24}}>
                            Received
                          </Text>
                        </Pressable>
                      </View>
                    )}
                    <MapView
                      provider={PROVIDER_GOOGLE}
                      style={styles.map}
                      ref={mapRef}
                      region={region}
                      mapPadding={{top: 200, right: 50, left: 20, bottom: 30}}>
                      <Marker.Animated
                        identifier="dropLocationMarker"
                        coordinate={
                          realPath.length > 0
                            ? realPath[realPath.length - 1]
                            : myLocation.current
                        }
                        icon={require('../svg/images/driverLiveLocation.png')}
                        // imageStyle={{width: wp(200), height: hp(200)}}
                        rotation={heading - 50 || 0}
                        anchor={{x: 0.5, y: 0.5}}
                        zIndex={5}
                      />

                      {/* <Marker
                        identifier="myLocationMarker"
                        coordinate={myLocation.current}
                        icon={require('../images/MapDriverIcon.png')}
                      /> */}

                      {[
                        OrderStatusEnum.ORDER_ACCEPTED,
                        OrderStatusEnum.ORDER_ALLOTTED,
                      ].includes(currentOnGoingOrderDetails.status) && (
                        <Marker
                          identifier="pickUpLocationMarker"
                          coordinate={{
                            latitude:
                              currentOnGoingOrderDetails?.pickup_details
                                ?.latitude,
                            longitude:
                              currentOnGoingOrderDetails?.pickup_details
                                ?.longitude,
                          }}
                          icon={require('../images/MapPickupDropLocationIcon.png')}
                        />
                      )}
                      {[
                        OrderStatusEnum.DISPATCHED,
                        OrderStatusEnum.ARRIVED_CUSTOMER_DOORSTEP,
                      ].includes(currentOnGoingOrderDetails.status) && (
                        <Marker
                          identifier="dropLocationMarker"
                          coordinate={{
                            latitude:
                              currentOnGoingOrderDetails?.drop_details
                                ?.latitude,
                            longitude:
                              currentOnGoingOrderDetails?.drop_details
                                ?.longitude,
                          }}
                          icon={require('../images/MapPickupDropLocationIcon.png')}
                        />
                      )}

                      <Polyline
                        coordinates={path || []}
                        strokeColor={'#404080'}
                        strokeWidth={4}
                      />
                      <Polyline
                        coordinates={realPath || []}
                        strokeColor={'#3cb371'}
                        strokeWidth={4}
                      />
                    </MapView>
                    {/*   Nevigate to google map */}
                    <TouchableOpacity
                      style={styles.directionButton}
                      onPress={() =>
                        navigateToGoogleMaps(
                          [
                            OrderStatusEnum.DISPATCHED,
                            OrderStatusEnum.ARRIVED_CUSTOMER_DOORSTEP,
                          ].includes(currentOnGoingOrderDetails.status)
                            ? {
                                latitude:
                                  currentOnGoingOrderDetails.drop_details
                                    .latitude,
                                longitude:
                                  currentOnGoingOrderDetails.drop_details
                                    .longitude,
                              }
                            : {
                                latitude:
                                  currentOnGoingOrderDetails.pickup_details
                                    .latitude,
                                longitude:
                                  currentOnGoingOrderDetails.pickup_details
                                    .longitude,
                              },
                        )
                      }>
                      <Navigate />
                      {/* <Text style={styles.textNavigateReached}>Navigate</Text> */}
                    </TouchableOpacity>

                    {/* slider Button */}
                    {cod && (
                      <View
                        style={{
                          flex: 1,
                          justifyContent: 'flex-end',
                          bottom: hp(6),
                        }}>
                        <SlideButton
                          width={290}
                          height={50}
                          animationDuration={180}
                          autoResetDelay={1080}
                          animation={true}
                          autoReset={true}
                          borderRadius={15}
                          sliderWidth={50}
                          icon={
                            <Image
                              source={require('../svg/arrow.png')}
                              style={styles.thumbImage}
                            />
                          } // Adjust width and height as needed
                          onReachedToEnd={async () => {
                            await updateOrderStatus();
                          }}
                          containerStyle={{
                            backgroundColor: '#118F5E',
                            color: 'red',
                          }}
                          underlayStyle={{backgroundColor: 'Red'}}
                          title={
                            sliderButtonLoader ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              buttonText
                            )
                          }
                          slideDirection="right"
                          disabled={!connected}></SlideButton>
                      </View>
                    )}
                  </>
                )}
              </View>
            )}
          </View>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#FFFFFF',
  },
  profileIcon: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(50),
    // backgroundColor: 'navy',
    alignItems: 'center',
    justifyContent: 'center',
    right: wp(2),
  },
  profileSupportIcon: {
    height: hp(5),
    width: wp(10),
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
    alignItems: 'flex-start',
    width: wp(40),
    height: hp(10),
    position: 'absolute',
    top: hp(6),
    right: wp(2),
    zIndex: 4,
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  supportText: {
    fontSize: wp(4),
    color: '#000',
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
  offlineModalView: {
    backgroundColor: '#F5FFFB',
    height: hp(95),
    width: wp(100),
    shadowOpacity: wp(0.25),
    shadowRadius: wp(4),
    elevation: hp(5),
    alignSelf: 'center',
    gap: hp(2.5),
    position: 'absolute',
    marginTop: hp(6.5),
  },
  offlineModalHeaderText: {
    fontFamily: 'RobotoMono-Regular',
    color: '#212121',
    fontWeight: '500',
    fontSize: wp(7),
    textAlign: 'center',
  },
  callIcon: {
    width: 24, // Adjust the size as needed
    height: 24, // Adjust the size as needed
    marginRight: 8, // Adjust the spacing as needed
  },
  supportCallIcon: {
    width: 20,
    height: 20,
  },
  offlineModalBodyText: {
    fontFamily: 'RobotoMono-Regular',
    color: '#464E5F',
    fontWeight: '500',
    fontSize: wp(4.5),
    textAlign: 'center',
  },
  SearchingModalView: {
    // flex: 1,
    backgroundColor: 'white',
    width: wp(95),
    alignSelf: 'center',
    height: hp(15),
    alignItems: 'center',
    justifyContent: 'center',
    // verticalAlign:'center'
  },
  SearchingModalViewChild: {
    width: wp(50),
    height: hp(5),
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    borderRadius: 20,
    justifyContent: 'center',
    top: '50%',
    left: '50%',
    transform: [{translateX: -23}, {translateY: 80}], // Adjust the translation to center the spinner
    // Adjust the translateX and translateY values if the spinner size is different
  },
  spinnerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: 24}, {translateY: 5}], // Adjust the translation to center the spinner
    // Adjust the translateX and translateY values if the spinner size is different
  },
  todayModalView: {
    flex: 1,
    backgroundColor: 'white',
    width: wp(95),
    alignSelf: 'center',
    height: hp(25),
  },
  circleModel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 1,
  },
  circle: {
    width: 95,
    height: 95,
    borderRadius: 50,
    backgroundColor: 'white',
    borderColor: '#28DA95',
    borderTopWidth: 2,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.2,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  modalView: {
    flex: 1,
    width: wp(100),
    height: hp(60),
    backgroundColor: '#FFFFFF',
    marginTop: hp(35),
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImage: {
    width: widthPercentageToDP(18),
    height: widthPercentageToDP(18),
    borderRadius: widthPercentageToDP(30),
    resizeMode: 'cover',
    marginTop: wp(1),
  },
  text: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 70,
  },
  map: {
    // flex:1,
    // backgroundColor: '#F5FFFB',
    height: hp(95),
    width: wp(100),
    // shadowOpacity: wp(0.25),
    // shadowRadius: wp(4),
    // elevation: hp(5),
    // alignSelf: 'center',
    // gap: hp(2.5),
    // position: 'absolute',
    top: hp(5),
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  orderDetailsCard1: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: wp(95),
    alignSelf: 'center',
    height: hp(20),
    zIndex: 4,
    position: 'absolute',
    marginTop: wp(3),
    borderRadius: 20,
  },
  orderDetailsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: wp(95),
    alignSelf: 'center',
    height: hp(30),
    zIndex: 4,
    position: 'absolute',
    marginTop: wp(15),
    borderRadius: 20,
  },
  line: {
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    width: '90%',
    left: wp(5),
    top: hp(4),
  },
  line1: {
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    width: '90%',
    left: wp(5),
    top: hp(10),
  },
  contactNumber: {
    flexDirection: 'row',
    width: wp(45),
    height: hp(5),
    backgroundColor: '#F5FFFB',
    borderRadius: 20,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    top: hp(12),
  },
  directionButton: {
    bottom: hp(15),
    marginRight: wp(5),
    alignSelf: 'flex-end',
    transform: [{rotate: '315deg'}],
  },
  paymentButton: {
    marginTop: '10%',
    backgroundColor: 'green',
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
    height: '20%',
    padding: 5,
  },
  totalorder: {
    color: 'black',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: '5%',
  },
  paymentText: {
    marginTop: '10%',
    fontSize: 24,
    color: 'black',
    fontWeight: '400',
  },
  paymentWindiw: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '90%',
    alignSelf: 'center',
    height: hp(30),
    zIndex: 4,
    position: 'absolute',
    marginTop: '45%',
    borderRadius: 20,
    alignItems: 'center',
  },
  background: {
    flex: 1,
    backgroundColor: '#FFFFF',
    width: wp(100),
    height: hp(50),
  },
});

export default PetPujaScreen;
