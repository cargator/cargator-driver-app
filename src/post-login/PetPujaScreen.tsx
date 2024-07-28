import Geolocation from '@react-native-community/geolocation';
import NetInfo from '@react-native-community/netinfo';
import * as geolib from 'geolib';
import {isEmpty as _isEmpty} from 'lodash';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ImageBackground,
  Linking,
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
  removeUserData,
  setCurrentOnGoingOrderDetails,
  setLocationPermission,
} from '../redux/redux';
import customAxios from '../services/appservices';
import {
  getProgressDetails,
  updateOrderStatusAPI,
} from '../services/rideservices';
import {
  driverLivelocationAPI,
  getAllOrdersAPI,
  getMyPendingOrdersFromAPI,
  setDriverOffline,
  setDriverOnline,
  updatePaymentStatusInDB,
} from '../services/userservices';
import Navigate from '../svg/Navigate';
import SidebarIcon from '../svg/SidebarIcon';
import Spinner from '../svg/spinner';
import {getSocketInstance, socketDisconnect} from '../utils/socket';
import OnlineOfflineSwitch from './OnlineOfflineSwitch';
export let socketInstance: any;

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

export const dialCall = (number: string) => {
  let phoneNumber = `tel:${number}`;
  Linking.openURL(phoneNumber).catch((err: any) => {
    console.log('err', err), Alert.alert('Error', 'Unable to make a call');
  });
};

const PetPujaScreen = ({navigation, route}: any) => {
  const currentOnGoingOrderDetails = useSelector(
    (store: any) => store.currentOnGoingOrderDetails,
  );
  const loginToken = useSelector((store: any) => store.loginToken);
  const userId = useSelector((store: any) => store.userId);
  const userData = useSelector((store: any) => store.userData);
  const [progressData, setProgressData] = useState<any>({});
  const dispatch = useDispatch();
  const mapRef = useRef<any>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isProfileModal, setIsProfileModal] = useState<boolean>(false);
  const [isDriverOnline, setIsDriverOnline] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [orderStarted, setOrderStarted] = useState<boolean>(false);
  const orderStartedRef = useRef<any>(false);
  const [buttonText, setButtonText] = useState<any>('ACCEPT ORDER');
  const [path, setPath] = useState<any>([]);
  const [cod, setcod] = useState(true);
  const [sliderButtonLoader, setSliderButtonLoader] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(true);
  const animation = useRef(new Animated.Value(-200)).current; // Start from off-screen left

  const myLocation = useRef<any>({longitude: 72.870729, latitude: 19.051322});

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

  const handleLogout = async () => {
    try {
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
        await setDriverOnline();
        socketInstance = await getSocketInstance(loginToken);
        startOrderStatusListener();
        startProcessing();
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

  const emitLiveLocation = () => {
    let prevLocation: any = null;
    try {
      const watchId = Geolocation.watchPosition(
        position => {
          const {latitude, longitude} = position.coords;
          const newLocation = {latitude, longitude};
          myLocation.current = newLocation;
          if (prevLocation) {
            const distance = geolib.getDistance(prevLocation, newLocation);
            if (distance >= 15) {
              prevLocation = newLocation;
              driverLivelocationAPI({
                coordinates: [newLocation.latitude, newLocation.longitude],
              });
            }
          } else {
            prevLocation = newLocation;
            driverLivelocationAPI({
              coordinates: [newLocation.latitude, newLocation.longitude],
            });
          }
        },
        error => {
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
      return watchId;
    } catch (error) {
      console.log(`emitLiveLocation error :>> `, error);
    }
  };

  const onAcceptOrder = (order: any) => {
    setLoading(true);
    socketInstance?.emit('accept-order', {
      id: order._id.toString(),
      driverLoc: myLocation.current,
    });
  };

  const startOrderStatusListener = async () => {
    socketInstance.on('order-update-response', (message: any) => {
      let body1 = parseSocketMessage(message);
      let body = body1.message;
      if (body.order.status === OrderStatusEnum['ORDER_ALLOTTED']) {
        if (body.driverId === userId) {
          setOrderStarted(true);
          orderStartedRef.current = true;
          setPath(body?.path?.coords);
          setButtonText(nextOrderStatus[body.order.status]);
          dispatch(setCurrentOnGoingOrderDetails(body.order));
          setLoading(false);
          Toast.show({
            type: 'success',
            text1: `ORDER SUCCESSFULLY ${body.order.status} !`,
            visibilityTime: 5000,
          });
        } else {
          if (!orderStartedRef.current) {
            setAvailableOrders((allOrders: any[]) =>
              allOrders.filter(ele => ele._id != body.order._id),
            );
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
        setButtonText('');
        if (response.data.order.status === 'CANCELLED') {
          Toast.show({
            type: 'error',
            text1: 'Order cancelled by customer!',
            visibilityTime: 5000,
          });
          return;
        }
      } else if (
        response.data.order.status === OrderStatusEnum.DELIVERED &&
        !currentOnGoingOrderDetails.order_details.payment_status
      ) {
        setLoading(false);
        setcod(false);
      } else {
        setButtonText(nextOrderStatus[response.data.order.status]);
        setLoading(false);
        dispatch(setCurrentOnGoingOrderDetails(response.data.order));
        Toast.show({
          type: 'success',
          text1: `ORDER SUCCESSFULLY ${
            nextOrderStatus[currentOnGoingOrderDetails.status]
          } !`,
          visibilityTime: 5000,
        });
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const onRejectOrder = async () => {
    try {
      orderRejectAnimation();
      const resp = availableOrders.shift();

      setAvailableOrders([...availableOrders]);
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
      setLoading(false);
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
      setPath(order?.path?.coords);

      switch (order.status) {
        case OrderStatusEnum.ORDER_ALLOTTED:
          setButtonText(nextOrderStatus[OrderStatusEnum.ORDER_ALLOTTED]);
          break;
        case OrderStatusEnum.ARRIVED:
          setButtonText(nextOrderStatus[OrderStatusEnum.ARRIVED]);
          break;
        case OrderStatusEnum.DISPATCHED:
          setButtonText(nextOrderStatus[OrderStatusEnum.DISPATCHED]);
          break;
        case OrderStatusEnum.ARRIVED_CUSTOMER_DOORSTEP:
          setButtonText(
            nextOrderStatus[OrderStatusEnum.ARRIVED_CUSTOMER_DOORSTEP],
          );
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
      let resp = await getMyPendingOrdersFromAPI();
      if (resp.data) {
        handleMyPendingOrder(resp.data);
        return;
      }
      resp = await getAllOrdersAPI();
      setAvailableOrders(resp.data);
      orderAcceptAnimation();
      socketInstance = await getSocketInstance(loginToken);
      startOrderStatusListener();
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    if (orderStartedRef.current) {
      return;
    }

    dispatch(setCurrentOnGoingOrderDetails({}));
    getProgressDetail();
    startProcessing();

    let unsubscribe: any, watchId: any;

    unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected ?? false; // Use false if state.isConnected is null
      setConnected(isConnected);
    });

    watchId = emitLiveLocation();

    return () => {
      Geolocation.clearWatch(watchId);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [route.params?.refresh]);

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
            <Text style={styles.deleteText}>{userId.slice(-6)}</Text>
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

        {_isEmpty(currentOnGoingOrderDetails) &&
          availableOrders[0] &&
          !orderStarted && (
            <>
              {loading ? (
                <LoaderComponent />
              ) : (
                <Animated.View style={{transform: [{translateY: animation}]}}>
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
                          onReachedToEnd={() =>
                            onAcceptOrder(availableOrders[0])
                          }
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
                          onReachedToEnd={() => onRejectOrder()}
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
                        <Image source={require('../images/cart.png')} /> Food
                        Pickup Location
                      </Text>
                      <Text
                        style={{
                          fontWeight: '600',
                          color: '#333333',
                          fontSize: 15,
                        }}>
                        {currentOnGoingOrderDetails?.pickup_details?.address}
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
                          {currentOnGoingOrderDetails.order_details.order_total}
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
                          {currentOnGoingOrderDetails?.drop_details?.address}
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
                      ₹ {currentOnGoingOrderDetails.order_details.order_total}
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
                    latitude: myLocation.current.latitude,
                    longitude: myLocation.current.longitude,
                    latitudeDelta: 0.0122,
                    longitudeDelta: 0.0121,
                  }}
                  mapPadding={{top: 200, right: 50, left: 20, bottom: 30}}>
                  <Marker
                    identifier="myLocationMarker"
                    coordinate={myLocation.current}
                    icon={require('../images/MapDriverIcon.png')}
                  />

                  {[
                    OrderStatusEnum.DISPATCHED,
                    OrderStatusEnum.ARRIVED_CUSTOMER_DOORSTEP,
                  ].includes(currentOnGoingOrderDetails.status) && (
                    <Marker
                      identifier="pickUpLocationMarker"
                      coordinate={{
                        latitude:
                          currentOnGoingOrderDetails?.pickup_details?.latitude,
                        longitude:
                          currentOnGoingOrderDetails?.pickup_details?.longitude,
                      }}
                      icon={require('../images/MapPickupDropLocationIcon.png')}
                    />
                  )}
                  {[
                    OrderStatusEnum.DISPATCHED,
                    OrderStatusEnum.ARRIVED_CUSTOMER_DOORSTEP,
                  ].includes(currentOnGoingOrderDetails.status) && (
                    <Marker
                      identifier="pickUpLocationMarker"
                      coordinate={{
                        latitude:
                          currentOnGoingOrderDetails?.drop_details?.latitude,
                        longitude:
                          currentOnGoingOrderDetails?.drop_details?.longitude,
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
                      [
                        OrderStatusEnum.DISPATCHED,
                        OrderStatusEnum.ARRIVED_CUSTOMER_DOORSTEP,
                      ].includes(currentOnGoingOrderDetails.status)
                        ? {
                            latitude:
                              currentOnGoingOrderDetails.pickup_details
                                .latitude,
                            longitude:
                              currentOnGoingOrderDetails.pickup_details
                                .longitude,
                          }
                        : {
                            latitude:
                              currentOnGoingOrderDetails.drop_details.latitude,
                            longitude:
                              currentOnGoingOrderDetails.drop_details.longitude,
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
