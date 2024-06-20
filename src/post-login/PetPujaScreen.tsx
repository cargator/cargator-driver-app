import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Pressable,
  ImageBackground,
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
import {isEmpty as _isEmpty} from 'lodash';
import {getSocketInstance, socketDisconnect} from '../utils/socket';
import {
  removeOrderDetails,
  removeUserData,
  setOrderDetails,
} from '../redux/redux';
import customAxios from '../services/appservices';
import RejectRideIcon from '../svg/RejectRideIcon';
import Toast from 'react-native-toast-message';
import Spinner from '../svg/spinner';

export let socketInstance: any;

const PetPujaScreen = ({navigation}: any) => {
  const orderDetails = useSelector((store: any) => store.orderDetails);
  const loginToken = useSelector((store: any) => store.loginToken);
  const userId = useSelector((store: any) => store.userId);
  const userData = useSelector((store: any) => store.userData);

  const dispatch = useDispatch();
  const isFirstRender = useRef(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isProfileModal, setIsProfileModal] = useState<boolean>(false);
  const [orderAccept, setOrderAccept] = useState<boolean>(false);
  const [isDriverOnline, setIsDriverOnline] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [availableOrders, setAvailableOrders] = useState<any>([]);
  const [orderStarted, setOrderStarted] = useState<boolean>(false)

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

  const parseSocketMessage = (message: any) => {
    try {
      return JSON.parse(message);
    } catch (error) {
      console.log(`parseSocketMessage error :>> `, error);
    }
  };

  const orderAcceptResponseListener = () => {
    socketInstance.on('accept-order-response', (message: any) => {
      console.log('ride-accept-response event :>> ', message);
      // setLoading(true);
      let body = parseSocketMessage(message);
      console.log('accept-order-response event :>> ', message.message);

      if (body.driverId && body.driverId.toString() != userId) {
        setAvailableOrders((orders: any) =>
          orders.filter((order: any) => order._id != body.order._id),
        );
        Toast.show({
          type: 'error',
          text1: 'Order not available !',
          visibilityTime: 5000,
        });
      } else {
        if (body.driverId && body.order) {
          dispatch(setOrderDetails(body.order));
          setOrderStarted(true)
          // setPath(body.ride.driverPathToPickUp);
          // setMessages(body.ride.chatMessages);
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
        // setAvailableOrders(allOrder);
        // console.log(" ========== msg =========", orders);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const driverStatusToggle = async (event: boolean) => {
    try {
      setLoading(true);
      console.log('asdfghjk');
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

  const onAcceptOrder = (order: any) => {
    console.log('inside accept ride function >>>>>>>>>>>>');

    setLoading(true);
    socketInstance?.emit('accept-order', {id: order._id.toString()});
    setAvailableOrders((availableOrders: any[]) =>
      availableOrders.filter((ele: any) => ele._id != order._id),
    );
    console.log('ride-accept emiited');
  };
  // const rejectOrder = async () => {
  //   try {

  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  const startChatListener = () => {
    console.log('start chat with bc', isDriverOnline);
    if (isDriverOnline) {
      console.log('i am here');
      // acceptOrder();
    }
  };

  const startSocketListeners = () => {
    newOrdersListener();
    orderAcceptResponseListener();
    // rideStatusListener();
    startChatListener();
    // checkDriver();
  };

  useEffect(() => {
    if (isFirstRender.current) {
      driverStatusToggle(isDriverOnline);
    }
    isFirstRender.current = false;
  }, [isDriverOnline]);

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

      <View>
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
                  My Progress
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    marginLeft: wp(26),
                    marginTop: hp(0.5),
                    textAlign: 'right',
                  }}>
                  Today
                </Text>
              </View>
              <View style={styles.circleModel}>
                <View style={styles.circle}>
                  <Text>Earning</Text>
                  <Text style={{fontWeight: 'bold'}}>12345</Text>
                </View>
                <View style={styles.circle}>
                  <Text>Login Hours</Text>
                  <Text style={{fontWeight: 'bold'}}>0.00</Text>
                </View>
                <View style={styles.circle}>
                  <Text>Orders</Text>
                  <Text style={{fontWeight: 'bold'}}>0</Text>
                </View>
              </View>
            </View>
            {/* Week Model View */}
            <View style={styles.todayModalView}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  style={{fontSize: 25, color: '#333333', marginLeft: wp(3)}}>
                  My Progress
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    marginLeft: wp(26),
                    marginTop: hp(0.5),
                    textAlign: 'right',
                  }}>
                  This Week
                </Text>
              </View>
              <View style={styles.circleModel}>
                <View style={styles.circle}>
                  <Text>Earning</Text>
                  <Text>0</Text>
                </View>
                <View style={styles.circle}>
                  <Text>Login Hours</Text>
                  <Text>0.00</Text>
                </View>
                <View style={styles.circle}>
                  <Text>Orders</Text>
                  <Text>0</Text>
                </View>
              </View>
            </View>
            {/* Month Model View */}
            <View style={styles.todayModalView}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  style={{fontSize: 25, color: '#333333', marginLeft: wp(3)}}>
                  My Progress
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    marginLeft: wp(26),
                    marginTop: hp(0.5),
                    textAlign: 'right',
                  }}>
                  This Month
                </Text>
              </View>
              <View style={styles.circleModel}>
                <View style={styles.circle}>
                  <Text>Earning</Text>
                  <Text>0</Text>
                </View>
                <View style={styles.circle}>
                  <Text>Login Hours</Text>
                  <Text>0.00</Text>
                </View>
                <View style={styles.circle}>
                  <Text>Orders</Text>
                  <Text>0</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {isDriverOnline && _isEmpty(orderDetails) && _isEmpty(availableOrders) &&(
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
                      color:'#333333'
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
                  My Progress
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    marginLeft: wp(26),
                    marginTop: hp(0.5),
                    textAlign: 'right',
                  }}>
                  Today
                </Text>
              </View>
              <View style={styles.circleModel}>
                <View style={styles.circle}>
                  <Text>Earning</Text>
                  <Text style={{fontWeight: 'bold'}}>12345</Text>
                </View>
                <View style={styles.circle}>
                  <Text>Login Hours</Text>
                  <Text style={{fontWeight: 'bold'}}>0.00</Text>
                </View>
                <View style={styles.circle}>
                  <Text>Orders</Text>
                  <Text style={{fontWeight: 'bold'}}>0</Text>
                </View>
              </View>
            </View>
            {/* Week Model View */}
            <View style={styles.todayModalView}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  style={{fontSize: 25, color: '#333333', marginLeft: wp(3)}}>
                  My Progress
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    marginLeft: wp(26),
                    marginTop: hp(0.5),
                    textAlign: 'right',
                  }}>
                  This Week
                </Text>
              </View>
              <View style={styles.circleModel}>
                <View style={styles.circle}>
                  <Text>Earning</Text>
                  <Text>0</Text>
                </View>
                <View style={styles.circle}>
                  <Text>Login Hours</Text>
                  <Text>0.00</Text>
                </View>
                <View style={styles.circle}>
                  <Text>Orders</Text>
                  <Text>0</Text>
                </View>
              </View>
            </View>
            {/* Month Model View */}
            <View style={styles.todayModalView}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  style={{fontSize: 25, color: '#333333', marginLeft: wp(3)}}>
                  My Progress
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    marginLeft: wp(26),
                    marginTop: hp(0.5),
                    textAlign: 'right',
                  }}>
                  This Month
                </Text>
              </View>
              <View style={styles.circleModel}>
                <View style={styles.circle}>
                  <Text>Earning</Text>
                  <Text>0</Text>
                </View>
                <View style={styles.circle}>
                  <Text>Login Hours</Text>
                  <Text>0.00</Text>
                </View>
                <View style={styles.circle}>
                  <Text>Orders</Text>
                  <Text>0</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {_isEmpty(orderDetails) && availableOrders[0] && (
          <View key={`order_${0 + 1}`} style={[styles.modalView, {opacity: 2}]}>
            <View style={styles.availableRidesModal}>
              <View style={styles.availableRidesButtonsView}>
                <Pressable
                  onPress={() => {
                    // onRejectRide(availableOrders[0]);
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
                    onAcceptOrder(availableOrders[0]);
                  }}>
                  <Text style={styles.textStyle}>Accept</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

       
      </View>
    </>
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
  orderView: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#3cb371',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
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
    justifyContent:'center',
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
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: 'white',
    borderColor: '#28DA95',
    borderTopWidth: 2,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineModelView: {
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
  mapView: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    width: wp(95),
    alignSelf: 'center',
    marginVertical: hp(25),
    bottom: hp(7),
  },
  searchOrderView: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    width: wp(60),
    height: hp(10),
    position: 'absolute',
    zIndex: 1,
    top: 10,
    left: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boldText: {
    fontFamily: 'Roboto Mono',
    marginTop: hp(10),
    fontSize: hp(2.5),
    fontWeight: '600',
    textAlign: 'center',
    color: '#212121',
  },
  holdOntext: {
    fontFamily: 'Roboto Mono',
    marginTop: hp(1),
    fontSize: hp(2),
    fontWeight: '500',
    textAlign: 'center',
    color: '#464E5F',
  },
  ParentSpinner: {
    alignSelf: 'center',
    position: 'relative',
  },
  ChildSpinner: {
    alignSelf: 'center',
    position: 'absolute',
    marginTop: hp(5),
  },
  modalView: {
    margin: hp(2),
    // width: wp(50),
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
    alignSelf: 'center',
    marginTop: hp(20),
  },
  availableRidesModal: {
    gap: hp(2),
  },
  availableRidesButtonsView: {
    // flexDirection: 'row',
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
  textStyle: {
    fontFamily: 'RobotoMono-Regular',
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default PetPujaScreen;


// {!orderAccept && (
//   <View style={styles.headerBar}>
//     <View>
//       <TouchableOpacity
//         onPress={() => {
//           // console.log('SideBarIcon pressed!');
//           navigation.toggleDrawer();
//         }}>
//         <SidebarIcon />
//       </TouchableOpacity>
//     </View>

//     {/* {isDriverOnline && !assignedRide && ( */}
//     {_isEmpty(orderDetails) && (
//       <OnlineOfflineSwitch
//         isDriverOnline={isDriverOnline}
//         driverStatusToggle={driverStatusToggle}
//       />
//     )}

//     <View style={styles.profileIcon}>
//       <TouchableOpacity
//         hitSlop={{
//           left: widthPercentageToDP(10),
//           right: widthPercentageToDP(5),
//           top: heightPercentageToDP(2),
//         }}
//         onPress={() => setIsProfileModal(!isProfileModal)}>
//         <Text style={styles.profileIconText}>
//           {userData.firstName[0].toUpperCase()}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   </View>
// )}