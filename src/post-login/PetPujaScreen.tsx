import Geolocation from '@react-native-community/geolocation';
import NetInfo from '@react-native-community/netinfo';
import * as geolib from 'geolib';
import {isEmpty as _isEmpty} from 'lodash';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ImageBackground,
  Linking,
  PermissionsAndroid,
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
  removeOrderDetails,
  removeUserData,
  setDriverPath,
  setLocationPermission,
  setNotificationData,
  setOrderDetails,
  setOrderStatus,
} from '../redux/redux';
import customAxios from '../services/appservices';
import {getProgressDetails} from '../services/rideservices';
import {
  driverLivelocationAPI,
  getAllOrdersAPI,
  setDriverOffline,
} from '../services/userservices';
import Navigate from '../svg/Navigate';
import SidebarIcon from '../svg/SidebarIcon';
import Spinner from '../svg/spinner';
import {getSocketInstance, socketDisconnect} from '../utils/socket';
import OnlineOfflineSwitch from './OnlineOfflineSwitch';
export let socketInstance: any;
let intervalId: any;

export const SliderText = [
  {flowName: 'ACCEPT ORDER'},
  {flowName: 'ARRIVED'},
  {flowName: 'DISPATCHED'},
  {flowName: 'ARRIVED_CUSTOMER_DOORSTEP'},
  {flowName: 'DELIVERED'},
];

export const dialCall = (number: string) => {
  let phoneNumber = `tel:${number}`;
  Linking.openURL(phoneNumber).catch((err: any) => {
    console.log('err', err), Alert.alert('Error', 'Unable to make a call');
  });
};

const PetPujaScreen = ({navigation}: any) => {
  const orderDetails = useSelector((store: any) => store.orderDetails);
  const loginToken = useSelector((store: any) => store.loginToken);
  const userId = useSelector((store: any) => store.userId);
  const userData = useSelector((store: any) => store.userData);
  const orderStatus = useSelector((store: any) => store.orderStatus);
  const DriverPath = useSelector((store: any) => store.driverPath);
  const notificationData = useSelector((store: any) => store.notificationData);
  const notificationOrder = useSelector((store: any) => store.notificationOrder);
  const [progressData, setProgressData] = useState<any>({});
  const dispatch = useDispatch();
  const isFirstRender = useRef(true);
  const mapRef = useRef<any>(null);
  const [geolocationWatchId, setGeolocationWatchId] = useState<any>();
  const [heading, setHeading] = useState<any>(0);
  const [region, setRegion] = useState<any>({});
  const [deleteModal, setDeleteModal] = useState(false);
  const [isProfileModal, setIsProfileModal] = useState<boolean>(false);
  const [driverStatus, setDriverStatus] = useState<boolean>(false);
  const [isDriverOnline, setIsDriverOnline] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const ordersList = useRef<any>([]);
  const [orderStarted, setOrderStarted] = useState<boolean>(false);
  const [slideCount, setSlideCount] = useState<any>(0);
  const [buttonText, setButtonText] = useState<any>('ACCEPT ORDER');
  const [path, setPath] = useState<any>([]);
  const [cod, setcod] = useState(true);
  const [sliderButtonLoader, setSliderButtonLoader] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [intervalState, setIntervalState] = useState();
  const [newNotificationData, setNewNotificationData] = useState();
  const [mylocation, setMyLocation] = useState({
    latitude: 19.0,
    longitude: 72.0,
  });

  const animation = useRef(new Animated.Value(-200)).current; // Start from off-screen left
  const [cartVisible, setCartVisible] = useState(true);

  const animateCart = (toValue: number, callback: any = undefined) => {
    Animated.timing(animation, {
      toValue: toValue,
      duration: 500,
      useNativeDriver: true,
    }).start(callback);
  };

  const newCart = () => {
    setCartVisible(true);
    animation.setValue(-200); // Reset position to off-screen left
    animateCart(0); // Move on-screen
  };

  const handleLogout = async () => {
    try {
      // await RNFetchBlob.fs.unlink(`file://${userImg}`);
      await socketDisconnect();
      dispatch(removeUserData());
    } catch (err) {
      console.log('err in handleLogOut', err);
    }
  };

  const getProgressDetail = async () => {
    try {
      setLoading(true);
      const response = await getProgressDetails();
      setProgressData(response.data);
      // setFormattedDate(moment(response.data.createdAt).format('D MMMM, YYYY'));
    } catch (error) {
      console.log('Driver Detail error :>> ', error);
    }
    setLoading(false);
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

  const parseSocketMessage = (message: any) => {
    try {
      return JSON.parse(message);
    } catch (error) {
      console.log(`parseSocketMessage error :>> `, error);
    }
  };

  const driverStatusToggle = async (event: boolean) => {
    try {
      setLoading(true);
      setIsDriverOnline(event);
      if (!event) {
        setAvailableOrders([]);
        await socketDisconnect();
        await setDriverOffline();
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

  const navigateToGoogleMaps = ({latitude, longitude}: any) => {
    const url = `https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=${latitude},${longitude}`;
    Linking.openURL(url).then((supported: any) => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        console.log('navigateToGoogleMaps ---- No ELSE-CASE provided !');
      }
    });
  };

  const driverLivelocation = async () => {
    try {
      let coordinates = [mylocation.latitude, mylocation.longitude];
      const data = {coordinates};
      const res = await driverLivelocationAPI(data);
    } catch (error) {
      console.log('Error', error);
    }
  };

  const emitLiveLocation = () => {
    let prevLocation: any = null;
    try {
      const watchId = Geolocation.watchPosition(
        position => {
          const {latitude, longitude, heading} = position.coords;
          const newLocation = {latitude, longitude};
          socketInstance?.emit('emit-driver-live-location', {
            coordinates: [position.coords.latitude, position.coords.longitude],
          });
          setMyLocation(newLocation);
          setHeading(heading);
          if (orderStarted) {
            if (prevLocation) {
              const distance = geolib.getDistance(prevLocation, newLocation);
              if (distance >= 15) {
                setMyLocation(newLocation);
                prevLocation = newLocation;
              }
            } else {
              setMyLocation(newLocation);
              prevLocation = newLocation;
            }
          }
        },
        error => {
          console.log(`emitLiveLocation error :>> `, error);
          if (error.message == 'Location permission not granted.') {
            Toast.show({
              type: 'error',
              text1: 'Please allow location permission.',
            });
            dispatch(setLocationPermission(false));
          }
        },
        {
          enableHighAccuracy: true,
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
          position => {
            setMyLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
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

  // const newOrdersListener = () => {
  //   try {
  //     socketInstance.on('order-request', async (orders: []) => {
  //       // console.log('>>>>>>>>>>>', orders);
  //       orders.map((order: any) => {
  //         setAvailableOrders((prev: any) => {
  //           // Check if the order already exists in the array
  //           const orderExists = prev.some(
  //             (existingOrder: any) => existingOrder._id === order._id,
  //           );
  //           // If the order doesn't exist, add it to the array
  //           if (!orderExists) {
  //             newCart();
  //             return [...prev, order];
  //           }
  //           // If the order exists, return the previous state without changes
  //           return prev;
  //         });
  //       });
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const getAllOrders = async () => {
    try {
      if (!orderStarted) {
        const orders: any = await getAllOrdersAPI();
        orders.data.forEach((order: any) => {
          setAvailableOrders((prev: any) => {
            console.log('Previous state:', prev);

            if (!Array.isArray(prev)) {
              prev = [];
            }
            const orderExists = prev.some(
              (existingOrder: any) => existingOrder._id === order._id,
            );

            if (!orderExists) {
              newCart();
              return [...prev, order];
            }
            return prev;
          });
        });
      }
    } catch (error) {
      console.log('Error', error);
    }
  };

  const onAcceptOrder = (order: any) => {
    driverStatusToggle(isDriverOnline)
    setLoading(true);
    socketInstance?.emit('accept-order', {
      id: order._id.toString(),
      driverLoc: mylocation,
    });
    setAvailableOrders([]);
    ordersList.current = [];
  };

  const updateOrderStatus = async () => {
    try {
      setLoading(true);
      const status = {
        id: orderDetails._id,
        status: SliderText[slideCount]?.flowName,
      };
      socketInstance?.emit('update-order-status', status);

      if (
        slideCount >= SliderText.length - 1 &&
        orderDetails.order_details.payment_status
      ) {
        setOrderStarted(false);
        getAllOrders();
        setPath([]);
        dispatch(removeOrderDetails());
        dispatch(setOrderStatus(''));
        dispatch(setDriverPath([]));
        setSlideCount(0);
        setButtonText('ACCEPT ORDER');
        setAvailableOrders([]);
        await getSocketInstance(loginToken);
        return;
      }
      if (
        slideCount >= SliderText.length - 1 &&
        !orderDetails.order_details.payment_status
      ) {
        setLoading(false);
        setcod(false);
      }
      if (slideCount <= SliderText.length - 2) {
        setSlideCount(slideCount + 1);
        setButtonText(SliderText[slideCount + 1].flowName);
        dispatch(setOrderStatus(slideCount));
      }
    } catch (error) {
      console.log('Error', error);
    }
  };

  const orderStatusListener = async () => {
    socketInstance.on('order-update-response', (message: any) => {
      console.log('orders>>>>', parseSocketMessage(message));
      let body1 = parseSocketMessage(message);
      let body = body1.message;
      switch (body1.type) {
        case 'accept-order-response':
          {
            if (!body.driverId) {
              ordersList.current = [];
              dispatch(setNotificationData(null));
              // setAvailableOrders([])
              setAvailableOrders((allOrders: any[]) =>
                allOrders.filter(ele => ele._id != body.order.orderId),
              );
              setLoading(false);
              setCartVisible(false);
              Toast.show({
                type: 'error',
                text1: 'Order not found !',
                visibilityTime: 5000,
              });
            } else if (body.driverId != userId && !orderStarted) {
              ordersList.current = [];
              dispatch(setNotificationData(null));
              // setAvailableOrders([])
              setAvailableOrders((allOrders: any[]) =>
                allOrders.filter(ele => ele._id != body.order._id),
              );
              newCart();
              setLoading(false);
              setCartVisible(false);
              Toast.show({
                type: 'error',
                text1: ` order not available!`,
                visibilityTime: 5000,
              });
            }  else if (body?.status == 404) {
              Toast.show({
                type: 'error',
                text1: 'You are already on an ongoing order !',
                visibilityTime: 5000,
              });
              dispatch(removeOrderDetails());
            } else {
              if (
                body.driverId &&
                body.driverId.toString() == userId &&
                body.order
              ) {
                dispatch(setNotificationData(null));
                dispatch(setOrderDetails(body.order));
                dispatch(setDriverPath(body?.path?.coords || []));
                setOrderStarted(true);
                setPath(body?.path?.coords);
                setButtonText(SliderText[slideCount + 1].flowName);
                setSlideCount(slideCount + 1);
                dispatch(setOrderStatus(slideCount));
                // setDriverStatus(true)
                setLoading(false);
                Toast.show({
                  type: 'success',
                  text1: `ORDER SUCCESSFULLY ${body.order.status} !`,
                  visibilityTime: 5000,
                });
              }
            }
            setLoading(false);
          }
          break;

        case 'order-update-response':
          {
            setSliderButtonLoader(false);
            setLoading(false);
            if (body.status === 405) {
              Toast.show({
                type: 'error',
                text1: 'Order cancelled by customer!',
                visibilityTime: 5000,
              });
              setOrderStarted(false);
              setPath([]);
              dispatch(removeOrderDetails());
              dispatch(setOrderStatus(''));
              dispatch(setDriverPath([]));
              setSlideCount(0);
              setButtonText('ACCEPT ORDER');
              setAvailableOrders([]);
              getAllOrders();
              return;
            } else {
              if (body.driverId && body.driverId.toString() == userId) {
                if (body.order.status === 'DISPATCHED') {
                  dispatch(setDriverPath(body?.path?.coords || []));
                  setPath(body?.path?.coords);
                }
                Toast.show({
                  type: 'success',
                  text1: `ORDER SUCCESSFULLY ${body.order.status} !`,
                  visibilityTime: 5000,
                });
                setLoading(false);
              }
            }
          }
          break;
        default:
          if (body.message.status === 404) {
            Toast.show({
              type: 'error',
              text1: body.message.message,
            });
          }
          break;
      }
    });
  };

  const onRejectOrder = async (order: any) => {
    try {
      newCart();
      dispatch(setNotificationData(null));
      setAvailableOrders((allOrders: any[]) =>
        allOrders.filter(ele => ele._id != order._id),
      );
      ordersList.current = [];
    } catch (error) {
      console.log(error);
    }
  };

  const handleEndReached = async () => {
    try {
      if (slideCount === 0) {
        onAcceptOrder(availableOrders[0]);
      } else if (slideCount >= 1) {
        updateOrderStatus();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to show the alert
  // const showAlert = () => {
  //   Alert.alert(
  //     'No Internet Connection',
  //     'Please check your internet connection.',
  //     [
  //       {
  //         text: 'OK',
  //         onPress: () => {},
  //         style: 'cancel',
  //       },
  //     ],
  //     {cancelable: false},
  //   );
  // };

  const startSocketListeners = () => {
    orderStatusListener();
  };

  const paymentButton = () => {
    try {
      setcod(true);
      socketInstance.emit('payment-status', orderDetails);
      setOrderStarted(false);
      setPath([]);
      dispatch(removeOrderDetails());
      dispatch(setOrderStatus(''));
      dispatch(setDriverPath([]));
      setSlideCount(0);
      setButtonText('ACCEPT ORDER');
      setAvailableOrders([]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    driverStatusToggle(isDriverOnline);
  }, [isDriverOnline]);

  const fetchData = async () => {
    setLoading(true);
    try {
      getProgressDetail();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [orderStarted]);

  useEffect(() => {
    if (orderStatus === Number('0')) {
      setOrderStarted(true);
      setPath(DriverPath);
      setSlideCount(orderStatus + 1);
      setButtonText(SliderText[orderStatus + 1]?.flowName);
      setAvailableOrders(orderDetails);
    } else if (orderStatus === SliderText.length - 1) {
      setOrderStarted(false);
      setPath([]);
      dispatch(removeOrderDetails());
      dispatch(setOrderStatus(''));
      setButtonText(SliderText[0]?.flowName);
      dispatch(setDriverPath([]));
      setSlideCount(0);
    } else if (orderStatus > Number('0')) {
      setOrderStarted(true);
      setPath(DriverPath);
      setSlideCount(orderStatus + 1);
      setButtonText(SliderText[orderStatus + 1]?.flowName);
      setAvailableOrders(orderDetails);
    }
  }, []);

  useEffect(() => {
    Geolocation.clearWatch(geolocationWatchId);
    getCurrentPosition();
    let unsubscribe: any;
    unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected ?? false; // Use false if state.isConnected is null
      setConnected(isConnected);
      setIsDisabled(!isConnected);
    });

    intervalId = setInterval(() => {
      emitLiveLocation();
      driverLivelocation();
    }, 10000);
    return () => {
      clearInterval(intervalId);
      if (unsubscribe) return unsubscribe();
    };
  }, []);

  // useEffect hook to subscribe to network status changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected ?? false; // Use false if state.isConnected is null
      setConnected(isConnected);
      driverStatusToggle(isConnected);
      setIsDisabled(!isConnected);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (Object.keys(notificationData || {}).length) {
      const orderExists = ordersList.current.some(
        (existingOrder: any) => existingOrder._id === notificationData._id,
      );
      // If the order doesn't exist, add it to the array
      if (!orderExists) {
        newCart();
        ordersList.current = [...ordersList.current, notificationData];
      }
      setAvailableOrders(ordersList.current);
      dispatch(setNotificationData(null));
    }
  }, [notificationData]);

  useEffect(() => {
    getAllOrders();
  }, [notificationOrder, orderStarted]);

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

          {/* {isDriverOnline && !assignedRide && ( */}
          {_isEmpty(orderDetails) && (
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
                {userData.firstName[0].toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      }

      {!isDriverOnline && (
        <View style={styles.offlineModalView}>
          <Text style={styles.offlineModalHeaderText}>
            Hello {userData.firstName.split(' ')[0]}!
          </Text>
          {/* Today Model View */}
          <View style={styles.todayModalView}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{fontSize: 25, color: '#333333', marginLeft: wp(3)}}>
                Today Progress{' '}
              </Text>
            </View>
            <View style={styles.circleModel}>
              <View style={styles.circle}>
                <View style={{flexDirection: 'column', alignItems: 'center'}}>
                  <Image source={require('../images/Rupay.png')} />
                  <Text> Earning</Text>
                </View>
                <Text style={{fontWeight: 'bold'}}>
                  {progressData.today?.earning || 0}
                </Text>
              </View>
              <View style={styles.circle}>
                <View style={{flexDirection: 'column', alignItems: 'center'}}>
                  <Image source={require('../images/watch.png')} />
                  <Text>Login Hours</Text>
                </View>

                <Text style={{fontWeight: 'bold'}}>
                  {progressData.today?.loginHours || 0}
                </Text>
              </View>
              <View style={styles.circle}>
                <View style={{flexDirection: 'column', alignItems: 'center'}}>
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
              <Text style={{fontSize: 25, color: '#333333', marginLeft: wp(3)}}>
                This Week Progress
              </Text>
            </View>
            <View style={styles.circleModel}>
              <View style={styles.circle}>
                <View style={{flexDirection: 'column', alignItems: 'center'}}>
                  <Image source={require('../images/Rupay.png')} />
                  <Text> Earning</Text>
                </View>
                <Text style={{fontWeight: 'bold'}}>
                  {progressData.week?.earning || 0}
                </Text>
              </View>
              <View style={styles.circle}>
                <View style={{flexDirection: 'column', alignItems: 'center'}}>
                  <Image source={require('../images/watch.png')} />
                  <Text>Login Hours</Text>
                </View>

                <Text style={{fontWeight: 'bold'}}>
                  {progressData.week?.loginHours || 0}
                </Text>
              </View>
              <View style={styles.circle}>
                <View style={{flexDirection: 'column', alignItems: 'center'}}>
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
              <Text style={{fontSize: 25, color: '#333333', marginLeft: wp(3)}}>
                This Month Progress
              </Text>
            </View>
            <View style={styles.circleModel}>
              <View style={styles.circle}>
                <View style={{flexDirection: 'column', alignItems: 'center'}}>
                  <Image source={require('../images/Rupay.png')} />
                  <Text> Earning</Text>
                </View>
                <Text style={{fontWeight: 'bold'}}>
                  {progressData.month?.earning || 0}
                </Text>
              </View>
              <View style={styles.circle}>
                <View style={{flexDirection: 'column', alignItems: 'center'}}>
                  <Image source={require('../images/watch.png')} />
                  <Text>Login Hours</Text>
                </View>

                <Text style={{fontWeight: 'bold'}}>
                  {progressData.month?.loginHours || 0}
                </Text>
              </View>
              <View style={styles.circle}>
                <View style={{flexDirection: 'column', alignItems: 'center'}}>
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
        {/* <Text style={styles.offlineModalHeaderText}>
          Hello {userData.firstName.split(' ')[0]}!
        </Text> */}
        {isDriverOnline &&
          _isEmpty(orderDetails) &&
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
                      Searching for Order ...
                    </Text>
                  </View>
                </ImageBackground>
              </View>
              {/* Today Model View */}
              <View style={styles.todayModalView}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    style={{fontSize: 25, color: '#333333', marginLeft: wp(3)}}>
                    Today Progress
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
                      <Image source={require('../images/watch.png')} />
                      <Text>Login Hours</Text>
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
                      <Text>Login Hours</Text>
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
                      <Text>Login Hours</Text>
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

        {_isEmpty(orderDetails) && availableOrders[0] && !orderStarted && (
          <>
            {loading ? (
              <LoaderComponent />
            ) : (
              <Animated.View style={{transform: [{translateX: animation}]}}>
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
                        <Text style={{alignItems: 'center'}}>{'Earning'}</Text>
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
                    {/* <View style={styles.text}>
              <View
                style={{
                  width: wp(30),
                  height: hp(4),
                  backgroundColor: '#F5FFFB',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 15,
                }}>
                <Text>Time : {1}-HRS.</Text>
              </View>
              <View
                style={{
                  width: wp(38),
                  height: hp(4),
                  backgroundColor: '#F5FFFB',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 15,
                }}>
                <Text>Distance :{15}-KM.</Text>
              </View>
            </View> */}

                    <View style={{alignItems: 'center'}}>
                      <Text>
                        <Image source={require('../images/cart.png')} /> Pickup
                        Location
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
                    <View style={{alignItems: 'center', marginTop: hp(2)}}>
                      <Text>
                        <Image source={require('../images/cart.png')} /> Drop
                        Location
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
                        r
                        animationDuration={180}
                        autoResetDelay={1080}
                        animation={true}
                        autoReset={true}
                        borderRadius={15}
                        sliderWidth={50}
                        icon={
                          <Image
                            source={require('../svg/Arrow.png')}
                            style={styles.thumbImage}
                          />
                        } // Adjust width and height as needed
                        onReachedToEnd={handleEndReached}
                        containerStyle={{
                          backgroundColor: '#118F5E',
                          color: 'red',
                        }}
                        underlayStyle={{backgroundColor: 'Red'}}
                        title={buttonText}
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
                            source={require('../svg/Arrow.png')}
                            style={styles.thumbImage}
                          />
                        } // Adjust width and height as needed
                        onReachedToEnd={() => onRejectOrder(availableOrders[0])}
                        containerStyle={{
                          backgroundColor: '#D11A2A',
                          color: 'red',
                        }}
                        underlayStyle={{backgroundColor: 'Red'}}
                        title="Reject Order"
                        titleStyle={{color: 'white'}}
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
        {orderStarted && !_isEmpty(orderDetails) && (
          <View>
            {loading ? (
              <LoaderComponent />
            ) : (
              <>
                {/* order Details card */}
                {slideCount <= 2 && (
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
                          {orderDetails?.order_details.vendor_order_id.slice(
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
                        <Image source={require('../images/cart.png')} /> Food
                        Pickup Location
                      </Text>
                      <Text
                        style={{
                          fontWeight: '600',
                          color: '#333333',
                          fontSize: 15,
                        }}>
                        {orderDetails?.pickup_details?.address}
                      </Text>
                    </View>
                    <View style={styles.line1} />
                    <View style={styles.contactNumber}>
                      <TouchableOpacity
                        onPress={() =>
                          dialCall(orderDetails.pickup_details.contact_number)
                        }>
                        <Image
                          source={require('../images/callicon.png')}
                          style={styles.callIcon}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          dialCall(orderDetails.pickup_details.contact_number)
                        }>
                        <Text style={{color: '#333333'}}>
                          {' '}
                          +91{orderDetails.pickup_details.contact_number}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                {slideCount > 2 && cod && (
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
                          {orderDetails?.order_details.vendor_order_id.slice(
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
                        {orderDetails.order_details.order_total}
                        {'₹'}
                      </Text>
                    </View>
                    <View style={styles.line} />
                    <View style={{alignItems: 'center', top: hp(6)}}>
                      <Text>
                        <Image source={require('../images/cart.png')} /> Food
                        Drop Location
                      </Text>
                      <Text
                        style={{
                          fontWeight: '600',
                          color: '#333333',
                          fontSize: 15,
                        }}>
                        {orderDetails?.drop_details?.address}
                      </Text>
                    </View>
                    <View style={styles.line1} />
                    <View style={styles.contactNumber}>
                      <TouchableOpacity
                        onPress={() =>
                          dialCall(orderDetails.drop_details.contact_number)
                        }>
                        <Image
                          source={require('../images/callicon.png')}
                          style={styles.callIcon}
                        />
                      </TouchableOpacity>
                      {/* <callLogo /> */}
                      <TouchableOpacity
                        onPress={() =>
                          dialCall(orderDetails.drop_details.contact_number)
                        }>
                        <Text style={{color: '#333333'}}>
                          {' '}
                          +91{orderDetails.drop_details.contact_number}
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
                      ₹ {orderDetails.order_details.order_total}
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
                  initialRegion={{
                    latitude: 19.165061,
                    longitude: 72.965545,
                    latitudeDelta: 0.0122,
                    longitudeDelta: 0.0121,
                  }}
                  region={{
                    latitude: region.latitude || mylocation.latitude,
                    longitude: region.longitude || mylocation.longitude,
                    latitudeDelta: region.latitudeDelta || 0.0122,
                    longitudeDelta: region.longitudeDelta || 0.0121,
                  }}
                  mapPadding={{top: 200, right: 50, left: 20, bottom: 30}}>
                  <Marker
                    identifier="myLocationMarker"
                    coordinate={mylocation}
                    icon={require('../images/MapDriverIcon.png')}
                  />

                  {slideCount <= 2 && (
                    <Marker
                      identifier="pickUpLocationMarker"
                      coordinate={{
                        latitude: orderDetails?.pickup_details?.latitude,
                        longitude: orderDetails?.pickup_details?.longitude,
                      }}
                      icon={require('../images/MapPickupDropLocationIcon.png')}
                    />
                  )}
                  {slideCount > 2 && (
                    <Marker
                      identifier="pickUpLocationMarker"
                      coordinate={{
                        latitude: orderDetails?.drop_details?.latitude,
                        longitude: orderDetails?.drop_details?.longitude,
                      }}
                      icon={require('../images/MapPickupDropLocationIcon.png')}
                    />
                  )}

                  <Polyline
                    coordinates={path || []}
                    strokeColor={'#404080'}
                    strokeWidth={4}
                  />
                </MapView>
                {/*   Nevigate to google map */}
                <TouchableOpacity
                  style={styles.directionButton}
                  onPress={() =>
                    navigateToGoogleMaps(
                      slideCount <= 2
                        ? {
                            latitude: orderDetails.pickup_details.latitude,
                            longitude: orderDetails.pickup_details.longitude,
                          }
                        : {
                            latitude: orderDetails.drop_details.latitude,
                            longitude: orderDetails.drop_details.longitude,
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
                          source={require('../svg/Arrow.png')}
                          style={styles.thumbImage}
                        />
                      } // Adjust width and height as needed
                      onReachedToEnd={handleEndReached}
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
                      disabled={isDisabled}></SlideButton>
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </View>
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
    backgroundColor: 'navy',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIconText: {
    fontFamily: 'RobotoMono-Regular',
    color: 'white',
    fontSize: wp(5),
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
