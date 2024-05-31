import React, { useRef, useState } from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import SlideButton from 'rn-slide-button';
import {
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { countBy, size } from 'lodash';
import MapViewDirections from 'react-native-maps-directions';



const PetPujaScreen = () => {


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

      "latitude": 19.06212,
      "longitude": 72.86045,
      "address": "ahmedabad",
      "city": "Ahmedabad"
    },
    "drop_details": {
      "name": "demo",
      "contact_number": "1234567890",
      "latitude": 19.268603,
      "longitude": 73.37125,
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
  const [havingOrder, setHavingOrder] = useState(true)
  const setNewOrder = () => {
    console.log("set");
    setHavingOrder(prev => !prev)

  }


  const mapRef = useRef<any>(null);
  const [region, setRegion] = useState<any>({});
  const [isRideStarted, setIsRideStarted] = useState<boolean>(false);
  const [path, setNewPath] = useState<any>([]);
  const GOOGLE_MAPS_APIKEY = "..."
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

  const setPath = () => {

  }

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
          path.map((point: any, index: any) => {
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
          coordinates={[mylocation, destination]}
          strokeColor="yellow" // fallback for when `strokeColors` is not supported by the map-provider
          strokeColors={[
            '#7F0000',
            '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
            '#B24112',
            '#E5845C',
            '#238C23',
            '#7F0000',
          ]}
          strokeWidth={6}
        />
        {/* <MapViewDirections
    origin={mylocation}
    destination={destination}
    apikey={GOOGLE_MAPS_APIKEY}
  /> */}
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

