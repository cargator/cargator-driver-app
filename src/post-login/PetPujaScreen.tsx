import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Pressable,
  ImageBackground,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {
  heightPercentageToDP,
  heightPercentageToDP as hp,
  widthPercentageToDP,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import SidebarIcon from '../svg/SidebarIcon';
import {useDispatch, useSelector} from 'react-redux';
import OnlineOfflineSwitch from './OnlineOfflineSwitch';
import {isEmpty as _isEmpty, orderBy} from 'lodash';
import {getSocketInstance, socketDisconnect} from '../utils/socket';
import {
  removeOrderDetails,
  removeUserData,
  setDriverPath,
  setOrderDetails,
  setOrderStatus,
} from '../redux/redux';
import customAxios from '../services/appservices';
import RejectRideIcon from '../svg/RejectRideIcon';
import Toast from 'react-native-toast-message';
import Spinner from '../svg/spinner';
import OrderScreen from './petPoojaComponent/OrderScreen';
import SlideButton from 'rn-slide-button';
import Navigate from '../svg/Navigate';
import {Circle, Svg} from 'react-native-svg';
import callLogo from '../svg/callLogo';
import MapView, {Marker, PROVIDER_GOOGLE, Polyline} from 'react-native-maps';
import {getProgressDetails} from '../services/rideservices';
export let socketInstance: any;

const SliderText = [
  {flowName: 'ACCEPT ORDER'},
  {flowName: 'ARRIVED'},
  {flowName: 'DISPATCHED'},
  {flowName: 'ARRIVED_CUSTOMER_DOORSTEP'},
  {flowName: 'DELIVERED'},
];

const PetPujaScreen = ({navigation}: any) => {
  const orderDetails = useSelector((store: any) => store.orderDetails);
  const loginToken = useSelector((store: any) => store.loginToken);
  const userId = useSelector((store: any) => store.userId);
  const userData = useSelector((store: any) => store.userData);
  const orderStatus = useSelector((store: any) => store.orderStatus);
  const DriverPath = useSelector((store: any) => store.driverPath);
  const [progressData, setProgressData] = useState<any>({});
  const dispatch = useDispatch();
  const isFirstRender = useRef(true);
  const mapRef = useRef<any>(null);
  const [region, setRegion] = useState<any>({});
  const [deleteModal, setDeleteModal] = useState(false);
  const [isProfileModal, setIsProfileModal] = useState<boolean>(false);
  const [driverStatus, setDriverStatus] = useState<boolean>(false);
  const [isDriverOnline, setIsDriverOnline] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [availableOrders, setAvailableOrders] = useState<any>([]);
  const [orderStarted, setOrderStarted] = useState<boolean>(false);
  const [slideCount, setSlideCount] = useState<any>(0);
  const [buttonText, setButtonText] = useState<any>('ACCEPT ORDER');
  const [path, setPath] = useState<any>([]);
  const [mylocation, setMyLocation] = useState({
    latitude: 19.16541,
    longitude: 72.96529,
  });

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
      console.log('response', response.data);

      setProgressData(response.data);
      // setFormattedDate(moment(response.data.createdAt).format('D MMMM, YYYY'));
    } catch (error) {
      console.log('Driver Detail error :>> ', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        getProgressDetail();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

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
    Linking.openURL(url).then(supported => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        console.log('navigateToGoogleMaps ---- No ELSE-CASE provided !');
      }
    });
  };

  const newOrdersListener = () => {
    try {
      socketInstance.on('order-request', async (orders: []) => {
        console.log('>>>>>>>>>>>', orders);
        orders.map((order: any) => {
          setAvailableOrders((prev: any) => {
            // Check if the order already exists in the array
            const orderExists = prev.some(
              (existingOrder: any) => existingOrder._id === order._id,
            );
            // If the order doesn't exist, add it to the array
            if (!orderExists) {
              return [...prev, order];
            }
            // If the order exists, return the previous state without changes
            return prev;
          });
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  const onAcceptOrder = (order: any) => {
    // console.log('inside accept ride function >>>>>>>>>>>>', order._id);
    setLoading(true);
    socketInstance?.emit('accept-order', {id: order._id.toString()});
    // setAvailableOrders((availableOrders: any[]) =>
    //   availableOrders.filter((ele: any) => ele._id != order._id),
    // );
    setAvailableOrders([]);
    setLoading(false);
    console.log('order-accept emiited');
  };

  const orderAcceptResponseListener = () => {
    socketInstance.on('accept-order-response', (message: any) => {
      // console.log('ride-accept-response event :>> ', message);
      setLoading(true);
      let body = parseSocketMessage(message);
      // console.log('accept-order-response event :>> ', message.message);

      if (body.driverId && body.driverId.toString() != userId) {
        setAvailableOrders((orders: any) =>
          orders.filter((order: any) => order._id != body.order._id.toString()),
        );
        setLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Order not available !',
          visibilityTime: 5000,
        });
      } else {
        if (body.driverId && body.order) {
          dispatch(setOrderDetails(body.order));
          dispatch(setDriverPath(body.path.coords));
          setOrderStarted(true);
          setPath(body.path.coords);
          setButtonText(SliderText[slideCount + 1].flowName);
          setSlideCount(slideCount + 1);
          dispatch(setOrderStatus(slideCount));
          // setDriverStatus(true)
          setLoading(false);
          Toast.show({
            type: 'error',
            text1: `ORDER SUCCESSFULLY ${body.order.status} !`,
            visibilityTime: 5000,
          });
        }
      }

      if (body?.status == 404) {
        Toast.show({
          type: 'error',
          text1: 'Order not available !',
          visibilityTime: 5000,
        });
        dispatch(removeOrderDetails());
      }
      setLoading(false);
    });
  };

  const updateOrderStatus = async () => {
    try {
      console.log('inside updateorder status', slideCount);

      setLoading(true);
      const status = {
        id: orderDetails._id,
        status: SliderText[slideCount]?.flowName,
      };
      socketInstance?.emit('update-order-status', status);
      if (slideCount >= SliderText.length - 1) {
        setOrderStarted(false);
        setPath([]);
        dispatch(removeOrderDetails());
        dispatch(setOrderStatus(''));
        dispatch(setDriverPath([]));
        setSlideCount(0);
        setButtonText('ACCEPT ORDER');
        setAvailableOrders([]);
        return;
      }
      setSlideCount(slideCount + 1);
      setButtonText(SliderText[slideCount + 1].flowName);
      dispatch(setOrderStatus(slideCount));
    } catch (error) {
      console.log('Error', error);
    }
  };

  const orderStatusListener = async () => {
    socketInstance.on('order-update-response', (message: any) => {
      setLoading(true);
      let body = parseSocketMessage(message);
      // console.log('order-update-response>>>>>>>', body.order);
      if (body.status === 405) {
        Toast.show({
          type: 'error',
          text1: 'Order cancelled by customer!',
          visibilityTime: 5000,
        });
        setOrderStarted(false);
        setPath([]);
        dispatch(removeOrderDetails());
        setSlideCount(0);
        setButtonText('ACCEPT ORDER');
        return;
      } else {
        if (body.order.status === 'DISPATCHED') {
          dispatch(setDriverPath(body.path.coords));
          setPath(body.path.coords);
        }
        Toast.show({
          type: 'error',
          text1: `ORDER SUCCESSFULLY ${body.order.status} !`,
          visibilityTime: 5000,
        });
      }
    });
  };

  const onRejectOrder = async () => {
    try {
      setAvailableOrders([]);
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

  const startChatListener = () => {
    console.log('start chat with bc', isDriverOnline);
    if (isDriverOnline) {
      // acceptOrder();
    }
  };

  const startSocketListeners = () => {
    orderStatusListener();
    newOrdersListener();
    orderAcceptResponseListener();
    // startChatListener();
    // checkDriver();
  };

  useEffect(() => {
    if (isFirstRender.current) {
      driverStatusToggle(isDriverOnline);
    }
    isFirstRender.current = false;
  }, [isDriverOnline]);

  useEffect(() => {
    // driverSocketConnection();
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

      {
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
              <Text style={{fontSize: 25, color: '#333333', marginLeft: wp(3)}}>Today Progress            </Text>
            </View>
            <View style={styles.circleModel}>
                  <View style={styles.circle}>
                    <View
                      style={{flexDirection: 'column', alignItems: 'center'}}>
                      <Image source={require('../images/Rupay.png')} />
                      <Text> Earning</Text>
                    </View>
                    <Text style={{fontWeight: 'bold'}}>
                      {progressData.today?.earning || 20}
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
              <Text style={{fontSize: 25, color: '#333333', marginLeft: wp(3)}}>
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
                      {progressData.today?.earning || 20}
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
          {/* Month Model View */}
          <View style={styles.todayModalView}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{fontSize: 25, color: '#333333', marginLeft: wp(3)}}>
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
                      {progressData.today?.earning || 20}
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
                      {progressData.today?.earning || 20}
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
                      {progressData.today?.earning || 20}
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
                      {progressData.today?.earning || 20}
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
            </View>
          )}

        {_isEmpty(orderDetails) && availableOrders[0] && !orderStarted && (
          // <View>
          //   <OrderScreen />
          // </View>
          <View key={`order_${0 + 1}`} style={[styles.modalView, {opacity: 2}]}>
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
                Order Id : {availableOrders[0].order_details?.vendor_order_id}
              </Text>
            </View>
            {/* Circul data */}
            <View style={styles.circleModel}>
              <View style={styles.circle}>
                <Text style={{alignItems: 'center'}}>{'₹'}</Text>
                <Text style={{alignItems: 'center'}}>{'Earning'}</Text>
                <Text
                  style={{fontWeight: '600', color: '#000000', fontSize: 15}}>
                  234567{'₹'}
                </Text>
              </View>
            </View>
            <View style={styles.text}>
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
            </View>
            <View style={{alignItems: 'center', marginTop: '5%'}}>
              <Text>
                <Image source={require('../images/cart.png')} /> Pickup Location
              </Text>
              <Text style={{fontWeight: '600', color: '#333333', fontSize: 15}}>
                {availableOrders[0].pickup_details.address}
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
                onReachedToEnd={handleEndReached}
                containerStyle={{backgroundColor: '#118F5E', color: 'red'}}
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
                onReachedToEnd={onRejectOrder}
                containerStyle={{backgroundColor: '#FFFFFF', color: 'red'}}
                underlayStyle={{backgroundColor: 'Red'}}
                title="Reject Order"
                titleStyle={{color: 'red'}}
                slideDirection="right">
                <Text style={{color: 'red', fontSize: 18}}>hiiiiiiitejas</Text>
              </SlideButton>
            </View>
          </View>
        )}

        {/* // If order Accepted */}
        {orderStarted && !_isEmpty(orderDetails) && (
          <View>
            {/* order Details card */}
            {slideCount <= 2 && (
              <View style={styles.orderDetailsCard1}>
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
                      {orderDetails?.order_details.vendor_order_id.slice(-6)}
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
                    {200}
                    {'₹'}
                  </Text>
                </View>
                <View style={styles.line} />
                <View style={{alignItems: 'center', top: hp(6)}}>
                  <Text>
                    <Image source={require('../images/cart.png')} /> Pickup Food
                  </Text>
                  <Text
                    style={{fontWeight: '600', color: '#333333', fontSize: 15}}>
                    {orderDetails?.pickup_details?.address}
                  </Text>
                </View>
              </View>
            )}
            {slideCount > 2 && (
              <View style={styles.orderDetailsCard2}>
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
                      {orderDetails?.order_details.vendor_order_id.slice(-6)}
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
                    {200}
                    {'₹'}
                  </Text>
                </View>
                <View style={styles.line} />
                <View style={{alignItems: 'center', top: hp(6)}}>
                  <Text>
                    <Image source={require('../images/cart.png')} /> Food Drop
                    Location
                  </Text>
                  <Text
                    style={{fontWeight: '600', color: '#333333', fontSize: 15}}>
                    {orderDetails?.drop_details?.address}
                  </Text>
                </View>
                <View style={styles.line1} />
                <View style={styles.contactNumber}>
                  {/* <callLogo /> */}
                  <Image source={require('../images/callicon.png')} />
                  <Text style={{color: '#333333'}}>
                    {' '}
                    +91 {orderDetails.drop_details.contact_number}
                  </Text>
                </View>
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
                coordinates={path}
                strokeColor={'#404080'}
                strokeWidth={4}
              />
            </MapView>

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
                containerStyle={{backgroundColor: '#118F5E', color: 'red'}}
                underlayStyle={{backgroundColor: 'Red'}}
                title={buttonText}
                slideDirection="right"></SlideButton>
            </View>
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
    // marginTop: hp(6.5),
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
  orderDetailsCard2: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: wp(95),
    alignSelf: 'center',
    height: hp(30),
    zIndex: 4,
    position: 'absolute',
    marginTop: wp(3),
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
});

export default PetPujaScreen;
