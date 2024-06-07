
// import React, { useEffect, useRef, useState } from 'react'
// import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
// import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
// import SlideButton from 'rn-slide-button';
// import {
//   heightPercentageToDP as hp,
// } from 'react-native-responsive-screen';
// import { countBy, size } from 'lodash';
// import MapViewDirections from 'react-native-maps-directions';
// import GetLocation from 'react-native-get-location'
// import { getSocketInstance, socketDisconnect } from '../utils/socket';
// import { useSelector } from 'react-redux';

// const flow = [
//   { flowName: "Reached PickUp Location" },
//   { flowName: "Order PickUped" },
//   { flowName: "Reached Destination" },
//   { flowName: "Order Delivered" },
// ]

// export let socketInstance: any;
// const PetPujaScreen = () => {

//   const loginToken = useSelector((store: any) => store.loginToken);
//   const [availableOrders, setAvailableOrders] = useState<any>([])
//   const mapRef = useRef<any>(null);
//   const [region, setRegion] = useState<any>({});
//   const [path, setPath] = useState<any>([]);
//   const [mylocation, setMyLocation] = useState({
//     latitude: 19.165061,
//     longitude: 72.965545,
//   });

//   const [destination, setDestination] = useState({
//     latitude: 0,
//     longitude: 0,
//   })

//   const [pickUpLocation, setPickUpLocation] = useState({
//     latitude: 0,
//     longitude: 0,
//   })


//   const [buttonText, setButtonText] = useState<any>("Reached Pickup Location");
//   const [pickup, newpickup] = useState()
//   const [acceptOrder, setAcceptOrder] = useState<boolean>(false)

//   const handleAcceptOrder = async (order: any) => {
//     try {
//       setPickUpLocation({latitude:order.pickup_details.latitud, longitude:order.pickup_details.longitude})
//       setDestination({latitude:order.drop_details.latitude, longitude:order.drop_details.longitude})
//       socketInstance.emit('order-accept',order)
//       setAvailableOrders((availableOrders: any[]) =>
//         availableOrders.filter(ele => ele._id != order._id),
//       );
//     } catch (error:any) {
//       console.log("error :>>", error)
//     }
//   }


//   const checkSocket = async () => {
//     socketInstance = await getSocketInstance(loginToken);
//     startSocketListeners();
//   }

//   const startSocketListeners = () => {
//     newOrderListener();
//     orderAcceptResponseListener();
//     // rideStatusListener();
//     // startChatListener();
//     // checkDriver();
//   };

//   const newOrderListener = () => {
//     try {
//       socketInstance.on('order-request', async (order: any) => {
//         // message = parseSocketMessage(order);
//         console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>", order)
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
//       });

//     } catch (err: any) {
//       console.log("error :", err)
//     }
//   }

//   const orderAcceptResponseListener = async () => {
//     try {
//       socketInstance.on('order-accept-response', async (body :any) => {
//         console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>", body)
//         setPath(body.path)
//       })
//     } catch (error) {

//     }
//   }


//   useEffect(() => {
//     checkSocket()
//   })

//   return (
//     <>
//       {!acceptOrder &&
//         <View style={styles.container} id='orderBlock'>
//           {availableOrders.map((order: any, index: number) => (
//             <TouchableOpacity key={index} style={styles.orderItem} onPress={() => handleAcceptOrder(order)}>
//               <Text>Order ID: {order.order_details.vendor_order_id}</Text>
//               <Text>Order Price: {order.order_details.order_total}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       }
//       {acceptOrder && <MapView provider={PROVIDER_GOOGLE} style={styles.map}
//         ref={mapRef}
//         initialRegion={{
//           latitude: 19.165061,
//           longitude: 72.965545,
//           latitudeDelta: 0.0122,
//           longitudeDelta: 0.0121,
//         }}
//         region={{
//           latitude: region.latitude || mylocation.latitude,
//           longitude: region.longitude || mylocation.longitude,
//           latitudeDelta: region.latitudeDelta || 0.0122,
//           longitudeDelta: region.longitudeDelta || 0.0121,
//         }}
//         mapPadding={{ top: 200, right: 50, left: 20, bottom: 30 }}>
//         <Marker coordinate={mylocation} />
//         <Marker coordinate={destination} />
//         {/* {<MapViewDirections
//           origin={mylocation}
//           destination={destination}
//           // apikey={GOOGLE_MAPS_APIKEY}
//         />} */}
//       </MapView>

//       }
//       {acceptOrder &&
//         <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: hp(1), }}>
//           {/* <TouchableOpacity onPress={status}> */}
//           <SlideButton
//             width={290}
//             height={50}
//             animationDuration={180}
//             autoResetDelay={108}
//             animation={true}
//             autoReset={true}
//             sliderWidth={50}

//             // onReachedToEnd={status}
//             // onSlideSuccess={handleSlide}
//             containerStyle={{ backgroundColor: '#3A5299', color: 'red' }}
//             thumbStyle={{ backgroundColor: 'white' }}
//             underlayStyle={{ backgroundColor: '#4964b3' }}
//             // icon={<Image source={require('../svg/arrao2.png')} style={styles.thumbImage} />} // Adjust width and height as needed
//             // title={sliderButtonLoader ? <ActivityIndicator size="small" color="#fff" /> : buttonText}
//             title={buttonText}
//             slideDirection="right"

//           >
//             {/* <Text style={{ color: 'white', fontSize: 18 }}>{sliderButtonLoader ? <ActivityIndicator size="small" color="#fff" /> : buttonText}</Text> */}
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
// });

// export default PetPujaScreen;





import React, { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Image, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import * as geolib from 'geolib';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import SlideButton from 'rn-slide-button';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import { countBy, size } from 'lodash';
import MapViewDirections from 'react-native-maps-directions';
import GetLocation from 'react-native-get-location'
import { getSocketInstance, socketDisconnect } from '../utils/socket';
import { useDispatch, useSelector } from 'react-redux';
import { getOrdersAPI, orderAcceptAPI, updateOrderAPI } from '../services/userservices';
import { removeOrderDetails, setLocationPermission, setOrderDetails, setOrderStatus } from '../redux/redux';
// import { Image } from 'react-native-svg';

const flow = [
  { flowName: "Reached PickUp Location" },
  { flowName: "Order PickUped" },
  { flowName: "Reached Destination" },
  { flowName: "Order Delivered" },
]

let intervalId: any;

export let socketInstance: any;
const PetPujaScreen = () => {

  const dispatch = useDispatch();
  const loginToken = useSelector((store: any) => store.loginToken);
  const userId = useSelector((store: any) => store.userId);
  const orderStatus = useSelector((store: any) => store.orderStatus);
  console.log("order status", orderStatus);

  const orderDetails = useSelector((store: any) => store.orderDetails);
  const [orderId, setOrderId] = useState<any>()
  const [geolocationWatchId, setGeolocationWatchId] = useState<any>();
  const [heading, setHeading] = useState<any>(0)
  const [availableOrders, setAvailableOrders] = useState<any>([])
  const [ongoingOrder, SetOngoingOrder] = useState<any>()
  const [orderPickUped, setOrderPickUped] = useState<boolean>(false)
  const mapRef = useRef<any>(null);
  const [region, setRegion] = useState<any>({});
  const [path, setPath] = useState<any>([]);
  const [slideCount, setSlideCount] = useState<any>(0)
  const [buttonText, setButtonText] = useState<any>("Reach Pickup Location");
  const [acceptOrder, setAcceptOrder] = useState<boolean>(false)
  const [refresh, setRefresh] = useState<boolean>(false);
  const [mylocation, setMyLocation] = useState({
    latitude: 19.172141,
    longitude: 72.956832
  });

  const [position, setPosition] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [destination, setDestination] = useState({
    latitude: 0,
    longitude: 0,
  })

  const [pickUpLocation, setPickUpLocation] = useState({
    latitude: 0,
    longitude: 0,
  })


  const getNewOrders = async () => {
    try {
      const orders = await getOrdersAPI();
      orders.data.map((order: any) => {
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

    } catch (error: any) {
      console.log("error", error)
    }
  }

  const emitLiveLocation = () => {
    let prevLocation: any = null;
    try {
      const watchId = Geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, heading } = position.coords;
          const newLocation = { latitude, longitude };
          setMyLocation(newLocation)
          setHeading(heading)
          if (acceptOrder) {
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
      setGeolocationWatchId(watchId);
      return () => {
        Geolocation.clearWatch(watchId);
      };
    } catch (error) {
      console.log(`emitLiveLocation error :>> `, error);
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

  const handleAcceptOrder = async (order: any) => {
    try {
      clearInterval(intervalId);
      setPickUpLocation({ latitude: order.pickup_details.latitude, longitude: order.pickup_details.longitude })
      setDestination({ latitude: order.drop_details.latitude, longitude: order.drop_details.longitude })
      const data = {
        driverLocation: mylocation,
        pickUpDetails: order.pickup_details,
        id: order._id,
      }
      const res = await orderAcceptAPI(data)
      console.log("insode handleAccept:>>>>>", res.data);
      dispatch(setOrderDetails(res?.data))
      dispatch(setOrderStatus(slideCount))
      SetOngoingOrder(res.data);
      // setSlideCount(slideCount + 1)
      // setButtonText(flow[slideCount +1].flowName)
      setPath(res.data.driverDataFromCurrLocationToPickup.coords)
      setAcceptOrder(true)
      setOrderId(order._id)
    } catch (error: any) {
      console.log("error :>>", error)
      Toast.show({
        type: 'error',
        text1: 'Error of Accepting Order !',
      });
      setButtonText(flow[slideCount].flowName)
    }
  }

  useEffect(() => {
  }, [path])

  const handleUpdateOrder = async () => {
    try {
      const data = {
        orderId: orderId,
        status: flow[slideCount].flowName,
        pickUpLocation: pickUpLocation,
        destination: destination
      }

      const res = await updateOrderAPI(data);
      dispatch(setOrderDetails(res?.data))
      console.log("insode handleUpdate:>>>>>", res.data);
      dispatch(setOrderStatus(slideCount + 1))
      Toast.show({
        type: 'success',
        text1: `Successfully ${flow[slideCount].flowName} !`,
      });
      if (slideCount >= flow.length - 1) {
        setAcceptOrder(false)
        setPath([])
        dispatch(removeOrderDetails())
        dispatch(setOrderStatus(''))
        setSlideCount(0)
        setOrderPickUped(false)
        setAvailableOrders([])
        setButtonText(flow[0].flowName)
        setRefresh(prev => !prev)
        return
      }
      setPath(res.data.driverDataFromCurrLocationToPickup.coords)
      setSlideCount(slideCount + 1)
      setButtonText(flow[slideCount + 1].flowName)
      setOrderPickUped(true)
      setPickUpLocation({ latitude: res.data.response.pickup_details.latitude, longitude: res.data.response.pickup_details.longitude })
    } catch (error: any) {
      console.log("error :>>", error)
    }
  }


  useEffect(() => {
    getNewOrders();
    intervalId = setInterval(getNewOrders, 10000);
    return () => clearInterval(intervalId);
  }, [refresh]);

  useEffect(() => {
    Geolocation.clearWatch(geolocationWatchId);
    emitLiveLocation();
  }, [acceptOrder]);

  useEffect(() => {
    getCurrentPosition()
  }, [getCurrentPosition]);

  useEffect(() => {
    if (orderStatus === Number('0')) {
      console.log("hiiiiiiiiiii-1")
      setAcceptOrder(true);
      setSlideCount(orderStatus);
      setButtonText(flow[orderStatus].flowName);
      setOrderId(orderDetails.response._id)
      setPath(orderDetails.driverDataFromCurrLocationToPickup.coords)
      setPickUpLocation({ latitude: orderDetails.response.pickup_details.latitude, longitude: orderDetails.response.pickup_details.longitude })
      setDestination({ latitude: orderDetails.response.drop_details.latitude, longitude: orderDetails.response.drop_details.longitude })
      console.log(">>>>>>>>>>>>>>>>>>>", { latitude: orderDetails.response.drop_details.latitude, longitude: orderDetails.response.drop_details.longitude })
    } else if (orderStatus === flow.length - 1) {
      console.log("hiiiiiiiiiii-2")
      setAcceptOrder(false)
      setPath([])
      setSlideCount(0)
      setOrderPickUped(false)
      setAvailableOrders([])
      setButtonText(flow[0]?.flowName)
      setRefresh(prev => !prev)
      return
    } else if (orderStatus > Number('0')) {
      console.log("hiiiiiiiiiii-3")
      setAcceptOrder(true)
      setSlideCount(orderStatus + 1);
      setButtonText(flow[orderStatus + 1]?.flowName);
      setOrderId(orderDetails.response._id)
      setPath(orderDetails.driverDataFromCurrLocationToPickup.coords)
      setPickUpLocation({ latitude: orderDetails.response.pickup_details.latitude, longitude: orderDetails.response.pickup_details.longitude })
      setDestination({ latitude: orderDetails.response.drop_details.latitude, longitude: orderDetails.response.drop_details.longitude })
      console.log(">>>>>>>>>>>>>>>>>>>1", { latitude: orderDetails.response.drop_details.latitude, longitude: orderDetails.response.drop_details.longitude })
    }
  }, [getCurrentPosition])


  return (
    <>
      {!acceptOrder &&
        <View style={styles.container} id='orderBlock'>
          {availableOrders.length === 0 ? (
            <Text style={{textAlign:'center',marginTop:hp(38),fontSize:25,color:'black'}}>No order Available !</Text>
          ) : (
            availableOrders.map((order: any, index: number) => (
              <TouchableOpacity key={index} style={styles.orderItem} onPress={() => handleAcceptOrder(order)}>
                <Text>Order ID: {order.order_details.vendor_order_id}</Text>
                <Text>Order Price: {order.order_details.order_total}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      }
      {acceptOrder &&
        <MapView provider={PROVIDER_GOOGLE} style={styles.map}
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
          mapPadding={{ top: 200, right: 50, left: 20, bottom: 30 }}>
          <Marker
            identifier="myLocationMarker"
            coordinate={mylocation}
            icon={require('../images/MapDriverIcon.png')}
          />

          {!orderPickUped && (
            <Marker
              identifier="pickUpLocationMarker"
              coordinate={{
                latitude: pickUpLocation.latitude,
                longitude: pickUpLocation.longitude,
              }}
              icon={require('../images/MapPickupDropLocationIcon.png')}
            />
          )}
          {orderPickUped && (
            <Marker
              identifier="pickUpLocationMarker"
              coordinate={{
                latitude: destination.latitude,
                longitude: destination.longitude,
              }}
              icon={require('../images/MapPickupDropLocationIcon.png')}
            />
          )
          }

          <Polyline
            coordinates={path}
            strokeColor={'#404080'}
            strokeWidth={4}
          />
          {/* {<MapViewDirections
          origin={mylocation}
          destination={destination}
          // apikey={GOOGLE_MAPS_APIKEY}
        />} */}
        </MapView>

      }
      {acceptOrder &&
        <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: hp(1), }}>
          {/* <TouchableOpacity onPress={status}> */}
          <SlideButton
            width={290}
            height={50}
            animationDuration={180}
            autoResetDelay={1080}
            animation={true}
            autoReset={true}
            sliderWidth={50}
            onReachedToEnd={handleUpdateOrder}
            // onSlideSuccess={handleSlide}
            containerStyle={{ backgroundColor: '#3A5299', color: 'red' }}
            thumbStyle={{ backgroundColor: 'white' }}
            underlayStyle={{ backgroundColor: '#4964b3' }}
            icon={<Image source={require('../svg/arrao2.png')} style={styles.thumbImage} />} // Adjust width and height as needed
            title={buttonText}
            slideDirection="right"
          >
            <Text style={{ color: 'white', fontSize: 18 }}>{buttonText}</Text>
          </SlideButton>
          {/* </TouchableOpacity> */}
        </View>}



    </>
  );

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b4b4b4',
    width: '80%',
    marginLeft: '10%',
    marginTop: '20%',
    marginBottom: '15%',
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 10,
    padding: '2%',
  },
  orderItem: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#3cb371',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  map: {
    width: '100%',
    height: '90%',
  },
  thumbImage: {
    width: widthPercentageToDP(12),
    height: widthPercentageToDP(12),
    borderRadius: widthPercentageToDP(30),
    resizeMode: 'cover',
  },
});

export default PetPujaScreen;