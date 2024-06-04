
import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import SlideButton from 'rn-slide-button';
import {
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { countBy, size } from 'lodash';
import MapViewDirections from 'react-native-maps-directions';
import GetLocation from 'react-native-get-location'
import { getSocketInstance, socketDisconnect } from '../utils/socket';
import { useSelector } from 'react-redux';

const order = {
  "_id": {
    "$oid": "664c7f805b628602bcc587f4"
  },
  "order_details": {
    "vendor_order_id": "411563121716194267",
    "order_total": 240,
    "paid": false,
    "order_source": "POS",
    "customer_orderId": ""
  },
  "pickup_details": {
    "name": "HO Demo - Sumit Bhatiya - Delivery Integration",
    "contact_number": "1234567890",
    "latitude": 19.16835878564917,
    "longitude": 72.96088330018131,
    "address": "ahmedabad",
    "city": "Ahmedabad"
  },
  "drop_details": {
    "name": "demo",
    "contact_number": "1234567890",
    "latitude": 19.168486125810627,
    "longitude": 72.95657688815858,
    "address": "Ahmedabad,Demo, Gujarat,Ahmedabad",
    "city": "Ahmedabad"
  },
  "order_items": [
    {
      "id": "90",
      "name": "Chicken Lollypop",
      "quantity": 1,
      "price": 120,
      "_id": {
        "$oid": "664c7f805b628602bcc587f5"
      }
    },
    {
      "id": "91",
      "name": "Chicken Fry",
      "quantity": 1,
      "price": 120,
      "_id": {
        "$oid": "664c7f805b628602bcc587f6"
      }
    }
  ],
  "createdAt": {
    "$date": "2024-05-21T11:03:28.612Z"
  },
  "updatedAt": {
    "$date": "2024-05-21T11:03:28.612Z"
  },
  "__v": 0
}

export let socketInstance: any;
const PetPujaScreen = () => {

  const loginToken = useSelector((store: any) => store.loginToken);
  const [availableOrders, setAvailableOrders] = useState<any>([])
  const mapRef = useRef<any>(null);
  const [region, setRegion] = useState<any>({});
  const [isRideStarted, setIsRideStarted] = useState<boolean>(false);
  const [path, setNewPath] = useState<any>([]);
  const GOOGLE_MAPS_APIKEY = 'ftretetr567tgjy7oyu'
  const [mylocation, setMyLocation] = useState({
    latitude: 19.165131064505033,
    longitude: 72.96577142466332,
  });

  const [destination, setDestination] = useState({
    latitude: order.pickup_details.latitude,
    longitude: order.pickup_details.longitude
  })
  const [heading, setHeading] = useState<any>(0)
  const [buttonText, setButtonText] = useState<any>("Reached Pickup Location");
  const [pickup, newpickup] = useState()


  const [havingOrder, setHavingOrder] = useState(true)
  const setNewOrder = () => {
    console.log("set");
    setHavingOrder(prev => !prev)
  }



  const parseSocketMessage = (message: any) => {
    try {
      return JSON.parse(message);
    } catch (error) {
      console.log(`parseSocketMessage error :>> `, error);
    }
  };

  const status = () => {
    console.log("hi");

    if (buttonText == 'Reached Pickup Location') {
      setButtonText('Order Pickuped')
      setMyLocation(destination)
      setDestination({
        latitude: order.drop_details.latitude,
        longitude: order.drop_details.longitude
      })
    }
    else if (buttonText == 'Order Pickuped') {
      setButtonText('Reach Destination')
    }
    else if (buttonText == 'Reach Destination') {
      setButtonText('Order Delivered')
    }
    else {
      setNewOrder();
      setButtonText('Reached Pickup Location')
    }
  }
  const  checkSocket = async() => {
    socketInstance = await getSocketInstance(loginToken);
    startSocketListeners();
  }

  const startSocketListeners = () => {
    newOrderListener();
    // rideAcceptResponseListener();
    // rideStatusListener();
    // startChatListener();
    // checkDriver();
  };

  const newOrderListener = () => {
    try {
      socketInstance.on('order-request', async (order: any) => {
        // message = parseSocketMessage(order);
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
      });

    }catch(err : any){
      console.log("error :", err)
    }
  }


  useEffect(() => {
    checkSocket()
  })

  return (
    <>
      {havingOrder && <View style={styles.container} id='orderBlock' >
        <TouchableOpacity onPress={setNewOrder}>
          <Text>Order Id : {order._id.$oid}</Text>
          <Text>Name :{order.drop_details.name}</Text>
          <Text>Pickup :{order.pickup_details.address}</Text>
          <Text>Drop :{order.drop_details.address}</Text>
          <Text>Total Bill:{order.order_details.order_total}</Text>
        </TouchableOpacity>
      </View>
      }
      {!havingOrder && <MapView provider={PROVIDER_GOOGLE} style={styles.map}
        ref={mapRef}
        initialRegion={{
          latitude: order.pickup_details.latitude,
          longitude: order.pickup_details.longitude,
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
        <Marker coordinate={mylocation} />
        <Marker coordinate={destination} />
        {<MapViewDirections
          origin={mylocation}
          destination={destination}
          apikey={GOOGLE_MAPS_APIKEY}
        />}
      </MapView>

      }
      {!havingOrder &&
        <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: hp(1), }}>
          {/* <TouchableOpacity onPress={status}> */}
          <SlideButton
            width={290}
            height={50}
            animationDuration={180}
            autoResetDelay={108}
            animation={true}
            autoReset={true}
            sliderWidth={50}

            onReachedToEnd={status}
            // onSlideSuccess={handleSlide}
            containerStyle={{ backgroundColor: '#3A5299', color: 'red' }}
            thumbStyle={{ backgroundColor: 'white' }}
            underlayStyle={{ backgroundColor: '#4964b3' }}
            // icon={<Image source={require('../svg/arrao2.png')} style={styles.thumbImage} />} // Adjust width and height as needed
            // title={sliderButtonLoader ? <ActivityIndicator size="small" color="#fff" /> : buttonText}
            title={buttonText}
            slideDirection="right"

          >
            {/* <Text style={{ color: 'white', fontSize: 18 }}>{sliderButtonLoader ? <ActivityIndicator size="small" color="#fff" /> : buttonText}</Text> */}
          </SlideButton>
          {/* </TouchableOpacity> */}
        </View>}



    </>
  );

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'yellow', // Optional: set a background color if needed
    height: 1,
    width: '80%',
    marginLeft: '10%',
    marginTop: '5%',
    marginBottom: '150%',
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 10,
    padding: '2%'
  },
  map: {
    // marginTop: heightPercentageToDP(10),
    width: '100%',
    height: '90%',
    // marginBottom: widthPercentageToDP(40)
  }
}


);

export default PetPujaScreen;