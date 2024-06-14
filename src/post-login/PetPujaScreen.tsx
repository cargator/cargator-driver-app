
// // import React, { useEffect, useRef, useState } from 'react'
// // import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
// // import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
// // import SlideButton from 'rn-slide-button';
// // import {
// //   heightPercentageToDP as hp,
// // } from 'react-native-responsive-screen';
// // import { countBy, size } from 'lodash';
// // import MapViewDirections from 'react-native-maps-directions';
// // import GetLocation from 'react-native-get-location'
// // import { getSocketInstance, socketDisconnect } from '../utils/socket';
// // import { useSelector } from 'react-redux';

// // const flow = [
// //   { flowName: "Reached PickUp Location" },
// //   { flowName: "Order PickUped" },
// //   { flowName: "Reached Destination" },
// //   { flowName: "Order Delivered" },
// // ]

// // export let socketInstance: any;
// // const PetPujaScreen = () => {

// //   const loginToken = useSelector((store: any) => store.loginToken);
// //   const [availableOrders, setAvailableOrders] = useState<any>([])
// //   const mapRef = useRef<any>(null);
// //   const [region, setRegion] = useState<any>({});
// //   const [path, setPath] = useState<any>([]);
// //   const [mylocation, setMyLocation] = useState({
// //     latitude: 19.165061,
// //     longitude: 72.965545,
// //   });

// //   const [destination, setDestination] = useState({
// //     latitude: 0,
// //     longitude: 0,
// //   })

// //   const [pickUpLocation, setPickUpLocation] = useState({
// //     latitude: 0,
// //     longitude: 0,
// //   })


// //   const [buttonText, setButtonText] = useState<any>("Reached Pickup Location");
// //   const [pickup, newpickup] = useState()
// //   const [acceptOrder, setAcceptOrder] = useState<boolean>(false)

// //   const handleAcceptOrder = async (order: any) => {
// //     try {
// //       setPickUpLocation({latitude:order.pickup_details.latitud, longitude:order.pickup_details.longitude})
// //       setDestination({latitude:order.drop_details.latitude, longitude:order.drop_details.longitude})
// //       socketInstance.emit('order-accept',order)
// //       setAvailableOrders((availableOrders: any[]) =>
// //         availableOrders.filter(ele => ele._id != order._id),
// //       );
// //     } catch (error:any) {
// //       console.log("error :>>", error)
// //     }
// //   }


// //   const checkSocket = async () => {
// //     socketInstance = await getSocketInstance(loginToken);
// //     startSocketListeners();
// //   }

// //   const startSocketListeners = () => {
// //     newOrderListener();
// //     orderAcceptResponseListener();
// //     // rideStatusListener();
// //     // startChatListener();
// //     // checkDriver();
// //   };

// //   const newOrderListener = () => {
// //     try {
// //       socketInstance.on('order-request', async (order: any) => {
// //         // message = parseSocketMessage(order);
// //         console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>", order)
// //         setAvailableOrders((prev: any) => {
// //           // Check if the order already exists in the array
// //           const orderExists = prev.some((existingOrder: any) => existingOrder._id === order._id);
// //           // If the order doesn't exist, add it to the array
// //           if (!orderExists) {
// //             return [...prev, order];
// //           }
// //           // If the order exists, return the previous state without changes
// //           return prev;
// //         });
// //       });

// //     } catch (err: any) {
// //       console.log("error :", err)
// //     }
// //   }

// //   const orderAcceptResponseListener = async () => {
// //     try {
// //       socketInstance.on('order-accept-response', async (body :any) => {
// //         console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>", body)
// //         setPath(body.path)
// //       })
// //     } catch (error) {

// //     }
// //   }


// //   useEffect(() => {
// //     checkSocket()
// //   })

// //   return (
// //     <>
// //       {!acceptOrder &&
// //         <View style={styles.container} id='orderBlock'>
// //           {availableOrders.map((order: any, index: number) => (
// //             <TouchableOpacity key={index} style={styles.orderItem} onPress={() => handleAcceptOrder(order)}>
// //               <Text>Order ID: {order.order_details.vendor_order_id}</Text>
// //               <Text>Order Price: {order.order_details.order_total}</Text>
// //             </TouchableOpacity>
// //           ))}
// //         </View>
// //       }
// //       {acceptOrder && <MapView provider={PROVIDER_GOOGLE} style={styles.map}
// //         ref={mapRef}
// //         initialRegion={{
// //           latitude: 19.165061,
// //           longitude: 72.965545,
// //           latitudeDelta: 0.0122,
// //           longitudeDelta: 0.0121,
// //         }}
// //         region={{
// //           latitude: region.latitude || mylocation.latitude,
// //           longitude: region.longitude || mylocation.longitude,
// //           latitudeDelta: region.latitudeDelta || 0.0122,
// //           longitudeDelta: region.longitudeDelta || 0.0121,
// //         }}
// //         mapPadding={{ top: 200, right: 50, left: 20, bottom: 30 }}>
// //         <Marker coordinate={mylocation} />
// //         <Marker coordinate={destination} />
// //         {/* {<MapViewDirections
// //           origin={mylocation}
// //           destination={destination}
// //           // apikey={GOOGLE_MAPS_APIKEY}
// //         />} */}
// //       </MapView>

// //       }
// //       {acceptOrder &&
// //         <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: hp(1), }}>
// //           {/* <TouchableOpacity onPress={status}> */}
// //           <SlideButton
// //             width={290}
// //             height={50}
// //             animationDuration={180}
// //             autoResetDelay={108}
// //             animation={true}
// //             autoReset={true}
// //             sliderWidth={50}

// //             // onReachedToEnd={status}
// //             // onSlideSuccess={handleSlide}
// //             containerStyle={{ backgroundColor: '#3A5299', color: 'red' }}
// //             thumbStyle={{ backgroundColor: 'white' }}
// //             underlayStyle={{ backgroundColor: '#4964b3' }}
// //             // icon={<Image source={require('../svg/arrao2.png')} style={styles.thumbImage} />} // Adjust width and height as needed
// //             // title={sliderButtonLoader ? <ActivityIndicator size="small" color="#fff" /> : buttonText}
// //             title={buttonText}
// //             slideDirection="right"

// //           >
// //             {/* <Text style={{ color: 'white', fontSize: 18 }}>{sliderButtonLoader ? <ActivityIndicator size="small" color="#fff" /> : buttonText}</Text> */}
// //           </SlideButton>
// //           {/* </TouchableOpacity> */}
// //         </View>}



// //     </>
// //   );

// // }
// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#b4b4b4',
// //     width: '80%',
// //     marginLeft: '10%',
// //     marginTop: '20%',
// //     marginBottom: '15%',
// //     borderWidth: 2,
// //     borderColor: 'black',
// //     borderRadius: 10,
// //     padding: '2%',
// //   },
// //   orderItem: {
// //     padding: 16,
// //     marginVertical: 8,
// //     backgroundColor: '#3cb371',
// //     borderWidth: 1,
// //     borderColor: '#ddd',
// //     borderRadius: 4,
// //   },
// //   map: {
// //     width: '100%',
// //     height: '90%',
// //   },
// // });

// // export default PetPujaScreen;





// import React, { useCallback, useEffect, useRef, useState } from 'react'
// import { StyleSheet, View, Text, TouchableOpacity, Image, PermissionsAndroid } from 'react-native';
// import Geolocation from '@react-native-community/geolocation';
// import * as geolib from 'geolib';
// import { Toast } from 'react-native-toast-message/lib/src/Toast';
// import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
// import SlideButton from 'rn-slide-button';
// import {
//   heightPercentageToDP as hp,
//   widthPercentageToDP,
// } from 'react-native-responsive-screen';
// import { countBy, size } from 'lodash';
// import MapViewDirections from 'react-native-maps-directions';
// import GetLocation from 'react-native-get-location'
// import { getSocketInstance, socketDisconnect } from '../utils/socket';
// import { useDispatch, useSelector } from 'react-redux';
// import { getOrdersAPI, orderAcceptAPI, updateOrderAPI } from '../services/userservices';
// import { removeOrderDetails, setLocationPermission, setOrderDetails, setOrderStatus } from '../redux/redux';
// import PetPujaScreen from './petPoojaComponent/PetPujaScreen';
// // import { Image } from 'react-native-svg';

// const flow = [
//   { flowName: "Reached PickUp Location" },
//   { flowName: "Order PickUped" },
//   { flowName: "Reached Destination" },
//   { flowName: "Order Delivered" },
// ]

// let intervalId: any;

// export let socketInstance: any;
// const PetPujaScreen = () => {

//   const dispatch = useDispatch();
//   const loginToken = useSelector((store: any) => store.loginToken);
//   const userId = useSelector((store: any) => store.userId);
//   const orderStatus = useSelector((store: any) => store.orderStatus);
//   console.log("order status", orderStatus);

//   const orderDetails = useSelector((store: any) => store.orderDetails);
//   const [orderId, setOrderId] = useState<any>()
//   const [geolocationWatchId, setGeolocationWatchId] = useState<any>();
//   const [heading, setHeading] = useState<any>(0)
//   const [availableOrders, setAvailableOrders] = useState<any>([])
//   const [ongoingOrder, SetOngoingOrder] = useState<any>()
//   const [orderPickUped, setOrderPickUped] = useState<boolean>(false)
//   const mapRef = useRef<any>(null);
//   const [region, setRegion] = useState<any>({});
//   const [path, setPath] = useState<any>([]);
//   const [slideCount, setSlideCount] = useState<any>(0)
//   const [buttonText, setButtonText] = useState<any>("Reach Pickup Location");
//   const [acceptOrder, setAcceptOrder] = useState<boolean>(false)
//   const [refresh, setRefresh] = useState<boolean>(false);
//   const [mylocation, setMyLocation] = useState({
//     latitude: 19.172141,
//     longitude: 72.956832
//   });

//   const [position, setPosition] = useState({
//     latitude: 0,
//     longitude: 0,
//     latitudeDelta: 0.01,
//     longitudeDelta: 0.01,
//   });

//   const [destination, setDestination] = useState({
//     latitude: 0,
//     longitude: 0,
//   })

//   const [pickUpLocation, setPickUpLocation] = useState({
//     latitude: 0,
//     longitude: 0,
//   })


//   const getNewOrders = async () => {
//     try {
//       const orders = await getOrdersAPI();
//       orders.data.map((order: any) => {
//         setAvailableOrders((prev: any) => {
//           // Check if the order already exists in the array
//           const orderExists = prev.some((existingOrder: any) => existingOrder._id === order._id);
//           // If the order doesn't exist, add it to the array
//           if (!orderExists) {
//             return [...prev, order];
//           }
//           // If the order exists, return the previous state without changes
//           return prev;
//         });
//       })

//     } catch (error: any) {
//       console.log("error", error)
//     }
//   }

//   const emitLiveLocation = () => {
//     let prevLocation: any = null;
//     try {
//       const watchId = Geolocation.watchPosition(
//         (position) => {
//           const { latitude, longitude, heading } = position.coords;
//           const newLocation = { latitude, longitude };
//           setMyLocation(newLocation)
//           setHeading(heading)
//           if (acceptOrder) {
//             if (prevLocation) {
//               const distance = geolib.getDistance(prevLocation, newLocation);
//               if (distance >= 15) {
//                 setMyLocation(newLocation);
//                 prevLocation = newLocation;
//               }
//             } else {
//               setMyLocation(newLocation);
//               prevLocation = newLocation;
//             }
//           }
//         },
//         (error) => {
//           console.log(`emitLiveLocation error :>> `, error);
//           if (error.message == 'Location permission not granted.') {
//             Toast.show({
//               type: 'error',
//               text1: 'Please allow location permission.',
//             });
//             dispatch(setLocationPermission(false));
//           }
//         },
//         { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000, distanceFilter: 15 }
//       );
//       setGeolocationWatchId(watchId);
//       return () => {
//         Geolocation.clearWatch(watchId);
//       };
//     } catch (error) {
//       console.log(`emitLiveLocation error :>> `, error);
//     }
//   };


//   const getCurrentPosition = useCallback(async () => {
//     try {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//         {
//           title: 'Location Permission',
//           message: 'This app needs access to your location',
//           buttonNegative: 'Cancel',
//           buttonPositive: 'OK',
//         },
//       );
//       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//         Geolocation.getCurrentPosition(
//           (position) => {
//             setPosition({
//               latitude: position.coords.latitude,
//               longitude: position.coords.longitude,
//               latitudeDelta: 0.01,
//               longitudeDelta: 0.01,
//             });
//             setMyLocation({
//               latitude: position.coords.latitude,
//               longitude: position.coords.longitude,
//             });
//           },
//           (error: any) => console.log('location err', error),
//           {
//             enableHighAccuracy: false,
//             timeout: 10000,
//           }
//         );
//       } else {
//         console.log('Location permission denied');
//       }
//     } catch (err) {
//       console.warn(err);
//     }
//   }, []);

//   const handleAcceptOrder = async (order: any) => {
//     try {
//       clearInterval(intervalId);
//       setPickUpLocation({ latitude: order.pickup_details.latitude, longitude: order.pickup_details.longitude })
//       setDestination({ latitude: order.drop_details.latitude, longitude: order.drop_details.longitude })
//       const data = {
//         driverLocation: mylocation,
//         pickUpDetails: order.pickup_details,
//         OrderId: order._id,
//         DriverId: userId
//       }
//       const res = await orderAcceptAPI(data)
//       console.log("insode handleAccept:>>>>>", res.data);
//       dispatch(setOrderDetails(res?.data))
//       dispatch(setOrderStatus(slideCount))
//       SetOngoingOrder(res.data);
//       // setSlideCount(slideCount + 1)
//       // setButtonText(flow[slideCount +1].flowName)
//       setPath(res.data.driverDataFromCurrLocationToPickup.coords)
//       setAcceptOrder(true)
//       setOrderId(order._id)
//     } catch (error: any) {
//       console.log("error :>>", error)
//       Toast.show({
//         type: 'error',
//         text1: 'Error of Accepting Order !',
//       });
//       setButtonText(flow[slideCount].flowName)
//     }
//   }

//   useEffect(() => {
//   }, [path])

//   const handleUpdateOrder = async () => {
//     try {
//       const data = {
//         orderId: orderId,
//         status: flow[slideCount].flowName,
//         pickUpLocation: pickUpLocation,
//         destination: destination,
//         DriverId: userId
//       }

//       const res = await updateOrderAPI(data);
//       dispatch(setOrderDetails(res?.data))
//       console.log("insode handleUpdate:>>>>>", res.data);
//       dispatch(setOrderStatus(slideCount + 1))
//       Toast.show({
//         type: 'success',
//         text1: `Successfully ${flow[slideCount].flowName} !`,
//       });
//       if (slideCount >= flow.length - 1) {
//         setAcceptOrder(false)
//         setPath([])
//         dispatch(removeOrderDetails())
//         dispatch(setOrderStatus(''))
//         setSlideCount(0)
//         setOrderPickUped(false)
//         setAvailableOrders([])
//         setButtonText(flow[0].flowName)
//         setRefresh(prev => !prev)
//         return
//       }
//       setPath(res.data.driverDataFromCurrLocationToPickup.coords)
//       setSlideCount(slideCount + 1)
//       setButtonText(flow[slideCount + 1].flowName)
//       setOrderPickUped(true)
//       setPickUpLocation({ latitude: res.data.response.pickup_details.latitude, longitude: res.data.response.pickup_details.longitude })
//     } catch (error: any) {
//       console.log("error :>>", error)
//     }
//   }


//   useEffect(() => {
//     getNewOrders();
//     intervalId = setInterval(getNewOrders, 10000);
//     return () => clearInterval(intervalId);
//   }, [refresh]);

//   useEffect(() => {
//     Geolocation.clearWatch(geolocationWatchId);
//     emitLiveLocation();
//   }, [acceptOrder]);

//   useEffect(() => {
//     getCurrentPosition()
//   }, [getCurrentPosition]);

//   useEffect(() => {
//     if (orderStatus === Number('0')) {
//       console.log("hiiiiiiiiiii-1")
//       setAcceptOrder(true);
//       setSlideCount(orderStatus);
//       setButtonText(flow[orderStatus].flowName);
//       setOrderId(orderDetails.response._id)
//       setPath(orderDetails.driverDataFromCurrLocationToPickup.coords)
//       setPickUpLocation({ latitude: orderDetails.response.pickup_details.latitude, longitude: orderDetails.response.pickup_details.longitude })
//       setDestination({ latitude: orderDetails.response.drop_details.latitude, longitude: orderDetails.response.drop_details.longitude })
//       console.log(">>>>>>>>>>>>>>>>>>>", { latitude: orderDetails.response.drop_details.latitude, longitude: orderDetails.response.drop_details.longitude })
//     } else if (orderStatus > flow.length - 1) {
//       console.log("hiiiiiiiiiii-2")
//       setAcceptOrder(false)
//       setPath([])
//       setSlideCount(0)
//       setOrderPickUped(false)
//       setAvailableOrders([])
//       setButtonText(flow[0]?.flowName)
//       setRefresh(prev => !prev)
//       return
//     } else if (orderStatus > Number('0')) {
//       console.log("hiiiiiiiiiii-3")
//       setAcceptOrder(true)
//       setSlideCount(orderStatus );
//       setButtonText(flow[orderStatus]?.flowName);
//       setOrderId(orderDetails.response._id)
//       setPath(orderDetails.driverDataFromCurrLocationToPickup.coords)
//       setPickUpLocation({ latitude: orderDetails.response.pickup_details.latitude, longitude: orderDetails.response.pickup_details.longitude })
//       setDestination({ latitude: orderDetails.response.drop_details.latitude, longitude: orderDetails.response.drop_details.longitude })
//       console.log(">>>>>>>>>>>>>>>>>>>1", { latitude: orderDetails.response.drop_details.latitude, longitude: orderDetails.response.drop_details.longitude })
//     }
//   }, [getCurrentPosition])


//   return (
//     <>
//     <PetPujaScreen/>
//       {!acceptOrder &&
//         <View style={styles.container} id='orderBlock'>
//           {/* {availableOrders.length === 0 ? (
//             <Text style={{textAlign:'center',marginTop:hp(38),fontSize:25,color:'black'}}>No order Available !</Text>
//           ) : (
//             availableOrders.map((order: any, index: number) => (
//               <TouchableOpacity key={index} style={styles.orderItem} onPress={() => handleAcceptOrder(order)}>
//                 <Text>Order ID: {order.order_details.vendor_order_id}</Text>
//                 <Text>Order Price: {order.order_details.order_total}</Text>
//               </TouchableOpacity>
//             ))
//           )} */}
//         </View>
//       }
//       {acceptOrder &&
//         <MapView provider={PROVIDER_GOOGLE} style={styles.map}
//           ref={mapRef}
//           initialRegion={{
//             latitude: 19.165061,
//             longitude: 72.965545,
//             latitudeDelta: 0.0122,
//             longitudeDelta: 0.0121,
//           }}
//           region={{
//             latitude: region.latitude || mylocation.latitude,
//             longitude: region.longitude || mylocation.longitude,
//             latitudeDelta: region.latitudeDelta || 0.0122,
//             longitudeDelta: region.longitudeDelta || 0.0121,
//           }}
//           mapPadding={{ top: 200, right: 50, left: 20, bottom: 30 }}>
//           <Marker
//             identifier="myLocationMarker"
//             coordinate={mylocation}
//             icon={require('../images/MapDriverIcon.png')}
//           />

//           {!orderPickUped && (
//             <Marker
//               identifier="pickUpLocationMarker"
//               coordinate={{
//                 latitude: pickUpLocation.latitude,
//                 longitude: pickUpLocation.longitude,
//               }}
//               icon={require('../images/MapPickupDropLocationIcon.png')}
//             />
//           )}
//           {orderPickUped && (
//             <Marker
//               identifier="pickUpLocationMarker"
//               coordinate={{
//                 latitude: destination.latitude,
//                 longitude: destination.longitude,
//               }}
//               icon={require('../images/MapPickupDropLocationIcon.png')}
//             />
//           )
//           }

//           <Polyline
//             coordinates={path}
//             strokeColor={'#404080'}
//             strokeWidth={4}
//           />
//           {/* {<MapViewDirections
//           origin={mylocation}
//           destination={destination}
//           // apikey={GOOGLE_MAPS_APIKEY}
//         />} */}
//         </MapView>

//       }
//       {acceptOrder &&
//         <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: hp(1), }}>
//           {/* <TouchableOpacity onPress={status}> */}
//           <SlideButton
//             width={290}
//             height={50}
//             animationDuration={180}
//             autoResetDelay={1080}
//             animation={true}
//             autoReset={true}
//             sliderWidth={50}
//             onReachedToEnd={handleUpdateOrder}
//             // onSlideSuccess={handleSlide}
//             containerStyle={{ backgroundColor: '#3A5299', color: 'red' }}
//             thumbStyle={{ backgroundColor: 'white' }}
//             underlayStyle={{ backgroundColor: '#4964b3' }}
//             icon={<Image source={require('../svg/arrao2.png')} style={styles.thumbImage} />} // Adjust width and height as needed
//             title={buttonText}
//             slideDirection="right"
//           >
//             <Text style={{ color: 'white', fontSize: 18 }}>{buttonText}</Text>
//           </SlideButton>
//           {/* </TouchableOpacity> */}
//         </View>}



//     </>
//   );

// }
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#b4b4b4',
//     width: '80%',
//     marginLeft: '10%',
//     marginTop: '20%',
//     marginBottom: '15%',
//     borderWidth: 2,
//     borderColor: 'black',
//     borderRadius: 10,
//     padding: '2%',
//   },
//   orderItem: {
//     padding: 16,
//     marginVertical: 8,
//     backgroundColor: '#3cb371',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 4,
//   },
//   map: {
//     width: '100%',
//     height: '90%',
//   },
//   thumbImage: {
//     width: widthPercentageToDP(12),
//     height: widthPercentageToDP(12),
//     borderRadius: widthPercentageToDP(30),
//     resizeMode: 'cover',
//   },
// });

// export default PetPujaScreen;

import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Animated } from 'react-native';
import {
  heightPercentageToDP,
  heightPercentageToDP as hp,
  widthPercentageToDP,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import SidebarIcon from '../svg/SidebarIcon';
import { useDispatch, useSelector } from 'react-redux';
import OnlineOfflineSwitch from './OnlineOfflineSwitch';
import { isEmpty as _isEmpty } from 'lodash';
import { getSocketInstance, socketDisconnect } from '../utils/socket';
import { removeUserData } from '../redux/redux';
import customAxios from '../services/appservices';
import OfflineIcon from '../svg/OfflineIcon';
import BlurMap from '../svg/BlurMap';
import { Button } from 'react-native-elements';
import Spinner from 'react-native-spinkit';


export let socketInstance: any;

const PetPujaScreen = ({ navigation }: any) => {
  const orderDetails = useSelector((store: any) => store.orderDetails);
  const loginToken = useSelector((store: any) => store.loginToken);
  const userId = useSelector((store: any) => store.userId);
  const userData = useSelector((store: any) => store.userData);



  const dispatch = useDispatch();
  const isFirstRender = useRef(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isProfileModal, setIsProfileModal] = useState<boolean>(false);
  const [orderAccept, setOrderAccept] = useState<boolean>(false)
  const [isDriverOnline, setIsDriverOnline] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [availableOrders, setAvailableOrders] = useState<any>([])
  const [popup, setPopup] = useState(false);

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

  const newOrdersListener = () => {
    try {
      socketInstance.on('order-request', async (orders: []) => {
        console.log(">>>>>>>>>>>", orders);

        orders.map((order: any) => {
          setAvailableOrders((prev: any) => {
            // Check if the order already exists in the array
            const orderExists = prev.some((existingOrder: any) => existingOrder._id === order._id);
            // If the order doesn't exist, add it to the array
            if (!orderExists) {
              return [...prev, order];
            }
            // If the order exists, return the previous state without changes
            return prev;
          });
        })
        // console.log(" ========== msg =========", orders);
      })
    } catch (error) {
      console.log(error);

    }
  }

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

  const startSocketListeners = () => {
    newOrdersListener();
    // rideAcceptResponseListener();
    // rideStatusListener();
    // startChatListener();
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
          <Text style={styles.offlineModalHeaderText}>Hello {userData.firstName.split(' ')[0]}!</Text>
          {/* Today Model View */}
          <View style={styles.todayModalView}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 25, color: '#333333', marginLeft: wp(3) }}>My Progress</Text>
              <Text style={{ fontSize: 18, marginLeft: wp(26), marginTop: hp(0.5), textAlign: 'right' }}>Today</Text>
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
          {/* Week Model View */}
          <View style={styles.todayModalView}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 25, color: '#333333', marginLeft: wp(3) }}>My Progress</Text>
              <Text style={{ fontSize: 18, marginLeft: wp(26), marginTop: hp(0.5), textAlign: 'right' }}>This Week</Text>
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 25, color: '#333333', marginLeft: wp(3) }}>My Progress</Text>
              <Text style={{ fontSize: 18, marginLeft: wp(26), marginTop: hp(0.5), textAlign: 'right' }}>This Month</Text>
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

      {isDriverOnline && (
        <View style={styles.onlineModelView}>
          {/* <Text style={styles.offlineModalHeaderText}>Hello {userData.firstName.split(' ')[0]}!</Text>
          <View style={styles.mapView}>
            <View style={styles.searchOrderView} >
              <Text style={{ fontSize: 25, fontWeight: '400', color: '#333333' }}>Searching for Order...</Text>
            </View>
            <BlurMap />
          </View> */}
          <Text style={styles.boldText}>
            We're finding a order for You
          </Text>
          <Text style={styles.holdOntext}>
            Kindly hold on for a second
          </Text>
          <View
            style={{
              marginTop: hp(10),
            }}>
            {popup ? (
              <View>
                <View
                  style={{
                    padding: 20,
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    elevation: 2, // for Android shadow
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Roboto Mono',
                      marginBottom: 20,
                      fontSize: 16,
                      textAlign: 'center',
                    }}>
                    Order cancelled by customer
                  </Text>
                  {/* <Button title="OK" onPress={handleCancelRide} /> */}
                </View>
              </View>
            ) : (
              <>
                <Spinner
                  isVisible={true}
                  type="Pulse"
                  color="#9999cc"
                  style={styles.ParentSpinner}
                  size={wp(60)}
                />
                <Spinner
                  isVisible={true}
                  type="Pulse"
                  color='#118F5E'
                  size={wp(40)}
                  style={styles.ChildSpinner}
                />
                  <Spinner
                  isVisible={true}
                  type="Pulse"
                  color='#118F5E'
                  size={wp(40)}
                  style={styles.ChildSpinner}
                />
              </>
            )}
          </View>
        </View>
      )}

      {!orderAccept && (
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
      )}
      {availableOrders.length > 0 &&
        <View style={styles.orderView}>
          <Text>{availableOrders[0].order_details.vendor_order_id}</Text>
          <Text>{availableOrders[0].pickup_details.name}</Text>
          <Text>{availableOrders[0].drop_details.name}</Text>
          <Text>{availableOrders[0].order_items[0].name}</Text>
        </View>
      }
    </>
  );

}

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
    marginTop: hp(6.5)
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
    flex: 1
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
    marginTop: hp(6.5)
  },
  mapView: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    width: wp(95),
    alignSelf: 'center',
    marginVertical: hp(25),
    bottom: hp(7)
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
    alignItems: 'center'
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
});

export default PetPujaScreen;