import Geolocation from 'react-native-geolocation-service';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Linking,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from 'react-native';
import MapView, {Marker, Polyline} from 'react-native-maps';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import ToggleSwitch from 'toggle-switch-react-native';
import {getSocketInstance, socketDisconnect} from '../utils/socket';
import LoaderComponent from '../components/LoaderComponent';
import {requestLocationPermission} from '../components/functions'; //! Commented API CALL.
import Pickup from './Pickup';
import {useDispatch, useSelector} from 'react-redux';
import {removePhoneNumber, setUserId} from '../redux/redux';
import {Toast} from 'react-native-toast-message/lib/src/Toast';

// const TEMP_DRIVER_ID = '64b250ea1486ace160c5c71a'; //! Remove.
// const TEMP_DRIVER_ID = '64b4e258450fdbcc59693cae';

export let socketInstance: any;

const MapScreen = ({navigation}: any) => {
  const userId = useSelector((store: any) => store.userId);
  const pendingPayment = useSelector((store: any) => store.pendingPayment);
  // const TEMP_DRIVER_ID: any = useSelector((store: any) => store?.phoneNumber);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isDriverOnline, setIsDriverOnline] = useState<boolean>(true);
  const [availableRides, setAvailableRides] = useState<any>([]);
  const [assignedRide, setAssignedRide] = useState<any>();
  const [path, setPath] = useState<any>([]);
  const [isPickupScreen, setIsPickupScreen] = useState<boolean>(false);
  const [isRideStarted, setIsRideStarted] = useState<boolean>(false);
  const [waitingTime, setWaitingTime] = useState(0); // Time in SECONDS while waiting for customer-pickup.
  // const [destinationPath, setDestinationPath] = useState<any>();
  const isFirstRender = useRef(true);
  const [mylocation, setMyLocation] = useState<any>({
    latitude: 19.165131064505033,
    longitude: 72.96577142466332,
  });
  const [geolocationWatchId, setGeolocationWatchId] = useState<any>();
  const mapRef = useRef<any>(null);

  const parseSocketMessage = (message: any) => {
    try {
      return JSON.parse(message);
    } catch (error) {}
  };

  const handleReachedDestination = async () => {
    Alert.alert('Confirmation', 'Are you sure for reached destination', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {
          socketInstance?.emit('ride-update', {
            message: 'reached destination',
            rideId: assignedRide._id,
          });
          navigation.navigate('DestinationScreen', {
            waitingTime,
            assignedRide,
            setAssignedRide,
          });
        },
      },
    ]);
  };

  const navigateToGoogleMaps = ({latitude, longitude}: any) => {
    const url = `https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=${latitude},${longitude}`;
    Linking.openURL(url).then(supported => {
      if (supported) {
        return Linking.openURL(url);
      } else {
      }
    });
  };

  const handleReachedPickup = async () => {
    if (assignedRide?.status == 'pending-arrival') {
      socketInstance?.emit('reached-pickup-location', {
        message: 'driver reached pickup-location',
        rideId: assignedRide._id,
      });
    }
    setIsPickupScreen(true);
  };

  const fitMapToMarkers = useCallback(() => {
    if (!isRideStarted) {
      if (mapRef.current) {
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
        console.log('fitToSuppliedMarkers: Till Destination');
        // const markerIDs = ['dropLocationMarker', 'pickUpLocationMarker'];
        const markerIDs = ['myLocationMarker', 'dropLocationMarker'];
        setTimeout(() => {
          mapRef.current?.fitToSuppliedMarkers(markerIDs, {
            edgePadding: {top: 100, right: 100, bottom: 100, left: 100},
            animated: true,
          });
        }, 10);
      }
    }
  }, [assignedRide, isRideStarted]);

  const onAcceptRide = (ride: any) => {
    console.log('onPressAccept Called >> ride :>> ', ride);
    setLoading(true);
    socketInstance.emit('ride-accept', {id: ride._id.toString()});
    setAvailableRides((allRides: any[]) =>
      allRides.filter(ele => ele._id != ride._id),
    );
    console.log('ride-accept event emitted >> rideId :>> ', ride._id);
  };

  const onRejectRide = (ride: any) => {
    console.log('onPressReject Called >> ride :>> ', ride);
    setLoading(true);
    socketInstance?.emit('cancel-ride', {id: ride._id.toString()});
    setAvailableRides((allRides: any[]) =>
      allRides.filter(ele => ele._id != ride._id),
    );
    setLoading(false);
  };

  // 'ride-status' event called when driver has ongoing-ride.
  const rideStatusListener = () => {
    socketInstance?.on('ride-status', async (message: any) => {
      setLoading(true);
      let body = parseSocketMessage(message);
      if (body?.onGoingRide) {
        if (body.onGoingRide[0].status == 'pending-arrival') {
          setIsPickupScreen(false);
          setIsRideStarted(false);
          setPath(body.onGoingRide[0].driverPathToPickUp);
        } else if (body.onGoingRide[0].status == 'ride-started') {
          setIsRideStarted(true);
          setIsPickupScreen(false);
          setPath(body.onGoingRide[0].pickupToDropPath);
          setLoading(false);
        } else if (body.onGoingRide[0].status == 'pending-payment') {
          // setIsRideStarted(true);
          setIsPickupScreen(false);
        }
        setAssignedRide(body.onGoingRide[0]); // Only set current-ongoing ride in the Available-Rides[]
      } else if (body?.data) {
        if (body.data.status == 'pending-arrival') {
          setIsPickupScreen(false);
          setIsRideStarted(false);
          setPath(body.data.driverPathToPickUp);
        } else if (body.data.status == 'pending-otp') {
          setIsPickupScreen(true);
          setIsRideStarted(false);
          setPath([]);
        } else if (body?.data.status == 'ride-started') {
          setIsRideStarted(true);
          setIsPickupScreen(false);
          setPath(body.data.pickupToDropPath);
          setLoading(false);
        } else if (body?.data.status == 'pending-payment') {
          setIsRideStarted(true);
          setIsPickupScreen(false);
          navigation.navigate('DestinationScreen', {
            waitingTime,
            assignedRide: body.data,
            setAssignedRide,
          });
          // setPath([]);
        }
      }
      setLoading(false);
    });
  };

  const rideAcceptResponseListener = () => {
    socketInstance.on('ride-accept-response', (message: any) => {
      // setLoading(true);
      console.log('ride-accept-response event >> body :>> ', message);

      let body = parseSocketMessage(message);
      console.log('ride-accept-response >> BODY :>> ', body);
      if (body.driverId && body.driverId.toString() != userId) {
        // console.log('INSIDE ride-accept-response FILTER Condition');
        setAvailableRides((rides: any) =>
          rides.filter((ride: any) => ride._id != body.ride._id),
        );
      } else {
        if (body.driverId && body.ride) {
          setAssignedRide(body.ride);
          setPath(body.ride.driverPathToPickUp);
        }
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
        setLoading(true);
        console.log(`cancel-ride event >> body :>> `, body);
        body = parseSocketMessage(body);
        setAvailableRides((rides: any) =>
          rides.filter((ride: any) => ride._id != body.rideId),
        );
        setIsRideStarted(false);
        setIsPickupScreen(false);
        setAssignedRide(undefined);
        setPath([]);
        setWaitingTime(0);
        // navigation.navigate('MapScreen');
        setLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Ride cancelled by rider.',
          visibilityTime: 5000,
        });
      });
    } catch (error) {
      console.log(`error :>> `, error);
      setLoading(false);
    }
  };

  const startSocketListeners = () => {
    newRidesListener();
    rideAcceptResponseListener();
    rideStatusListener();
  };

  const emitLiveLocation = () => {
    try {
      setLoading(true);
      const watchId = Geolocation.watchPosition(
        position => {
          const {coords} = position;
          socketInstance?.emit('live-location', {
            coordinates: [coords.longitude, coords.latitude],
            rideId: assignedRide ? assignedRide._id : null,
          });
          setMyLocation({
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
            setTimeout(() => {
              requestLocationPermission(dispatch);
            }, 2000);
          }
        },
        {enableHighAccuracy: true, distanceFilter: 5},
      );
      // console.log(`emitLiveLocation >> watchId :>> `, watchId);
      setGeolocationWatchId(watchId);
      setLoading(false);
    } catch (error) {
      console.log(`emitLiveLocation error >> Inside CATCH() :>> `, error);
      setLoading(false);
    }
  };

  const driverStatusToggle = async (event: boolean) => {
    try {
      setLoading(true);
      setIsDriverOnline(event);
      if (!event) {
        setAvailableRides([]);
        socketDisconnect();
      } else {
        socketInstance = await getSocketInstance(userId);
        startSocketListeners();
        emitLiveLocation();
      }
    } catch (error) {
      console.log(`driverStatusToggle error :>> `, error);
    } finally {
      setLoading(false);
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
    if (assignedRide?.status == 'pending-payment') {
      navigation.navigate('DestinationScreen', {
        waitingTime,
        assignedRide,
        setAssignedRide,
      });
    }
  }, [assignedRide]);

  useEffect(() => {
    console.log('isRideStarted', isRideStarted);
  }, [isRideStarted]);

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.mainView}>
        {loading ? (
          <LoaderComponent />
        ) : (
          <>
            {/* {assignedRide?.status!='pending-payment' && (<> */}
            {!assignedRide && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  margin: wp(2),
                }}>
                {/* <View
                  style={{
                    backgroundColor: isDriverOnline ? '#90EE90' : '#FF0000',
                  }}>
                  <Text style={{color: 'white', padding: wp(2)}}>
                    {isDriverOnline ? 'Online' : 'Offline'}
                  </Text>
                </View> */}

                <TouchableOpacity
                  style={{
                    backgroundColor: '#FF0000',
                    alignSelf: 'center',
                    borderRadius: wp(1),
                  }}
                  onPress={() => {
                    setAvailableRides([]);
                    socketDisconnect();
                    dispatch(removePhoneNumber());
                    dispatch(setUserId(''));
                  }}>
                  <Text style={{color: 'white', padding: wp(2)}}>Logout</Text>
                </TouchableOpacity>
                {/* <Image
                  style={{width: wp(30), height: hp(7), borderRadius: wp(5)}}
                  source={require('./IMG_20230725_171352.jpg')}
                /> */}
                <View style={{marginTop: hp(2)}}>
                  <ToggleSwitch
                    isOn={isDriverOnline}
                    onColor="#90EE90"
                    offColor="#FF0000"
                    labelStyle={[styles.switch]}
                    onToggle={driverStatusToggle}
                  />
                  <Text
                    style={{
                      color: isDriverOnline ? '#90EE90' : '#FF0000',
                      padding: wp(1),
                      marginRight: wp(1),
                    }}>
                    {isDriverOnline ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </View>
            )}

            {!isDriverOnline && (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: '#000000',
                    fontSize: hp(3),
                    fontWeight: '600',
                  }}>
                  You are Offline !!!
                </Text>
              </View>
            )}

            {isDriverOnline && (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {!assignedRide && availableRides?.length === 0 && (
                  <Text
                    style={{
                      color: '#000000',
                      fontSize: hp(3),
                      fontWeight: '600',
                    }}>
                    No Rides Found !!!
                  </Text>
                )}

                {!assignedRide && availableRides[0] && (
                  // availableRides?.map((ride: any, index: any) => {
                  //   return (
                  <View key={`ride_${0 + 1}`} style={styles.modalView}>
                    <View>
                      <Text style={{color: 'black', fontWeight: 'bold'}}>
                        Pickup Location:
                      </Text>
                      <Text style={{color: 'black', fontSize: hp(1.8)}}>
                        {availableRides[0].pickUpAddress}
                      </Text>

                      {/* <Text
                        style={{
                          color: 'black',
                          fontWeight: 'bold',
                          marginTop: wp(2),
                          marginBottom: wp(2),
                        }}>
                        Distance: {ride.pickUpDistance}
                        Distance: {ride.driverDistanceToPickUp}
                      </Text>

                      <Text
                        style={{
                          color: 'black',
                          fontWeight: 'bold',
                          marginTop: wp(2),
                          marginBottom: wp(2),
                        }}>
                        Duration: {ride.driverDurationToPickUp}
                      </Text> */}

                      <View
                        style={{
                          alignItems: 'flex-end',
                          flexDirection: 'row',
                        }}>
                        <Pressable
                          style={[styles.button, styles.buttonReject]}
                          onPress={() => {
                            onRejectRide(availableRides[0]);
                          }}>
                          <Text style={styles.textStyle}>Reject</Text>
                        </Pressable>

                        <Pressable
                          onPress={() => {
                            onAcceptRide(availableRides[0]);
                          }}
                          style={[styles.button, styles.buttonAccept]}>
                          <Text style={styles.textStyle}>Accept</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                )}

                {assignedRide && isPickupScreen && !isRideStarted && (
                  <View
                    style={{
                      alignItems: 'center',
                    }}>
                    <Pickup
                      setWaitingTime={setWaitingTime}
                      setIsRideStarted={setIsRideStarted}
                      setIsPickupScreen={setIsPickupScreen}
                      assignedRide={assignedRide}
                    />
                  </View>
                )}

                {assignedRide &&
                  !isPickupScreen &&
                  assignedRide?.status != 'pending-payment' && (
                    <View>
                      {!isPickupScreen && (
                        <View style={styles.pickUpAddressMap}>
                          <Text
                            style={{
                              fontWeight: '800',
                              color: 'green',
                              // padding: hp(0.5),
                            }}>
                            Pickup Location
                          </Text>
                          <Text
                            style={{
                              color: 'black',
                              fontSize: hp(1.8),
                              padding: hp(0.2),
                            }}
                            numberOfLines={2}>
                            {assignedRide?.pickUpAddress}
                          </Text>

                          {!isRideStarted && (
                            <>
                              <Text
                                style={{
                                  color: 'black',
                                  fontWeight: 'bold',
                                }}>
                                Distance:{' '}
                                {assignedRide?.driverDistanceToPickUp?.text}
                              </Text>
                              <Text
                                style={{
                                  color: 'black',
                                  fontWeight: 'bold',
                                }}>
                                Duration:{' '}
                                {assignedRide?.driverDurationToPickUp?.text}
                              </Text>
                            </>
                          )}
                        </View>
                      )}

                      {assignedRide && !isPickupScreen && isRideStarted && (
                        <View style={styles.dropAddressMap}>
                          <Text
                            style={{
                              fontWeight: '800',
                              color: 'red',
                              // padding: hp(0.5),
                            }}>
                            Destination Location
                          </Text>
                          <Text
                            style={{
                              color: 'black',
                              fontSize: hp(1.8),
                              padding: hp(0.2),
                            }}
                            numberOfLines={2}>
                            {assignedRide?.dropAddress}
                          </Text>
                          {isRideStarted && (
                            <>
                              <Text
                                style={{
                                  color: 'black',
                                  fontWeight: 'bold',
                                }}>
                                Distance: {assignedRide?.distance}
                              </Text>
                              <Text
                                style={{
                                  color: 'black',
                                  fontWeight: 'bold',
                                }}>
                                Duration: {assignedRide?.duration}
                              </Text>
                            </>
                          )}
                        </View>
                      )}

                      <View>
                        <MapView
                          ref={mapRef}
                          onMapReady={() => fitMapToMarkers()}
                          initialRegion={{
                            latitude: mylocation.latitude,
                            longitude: mylocation.longitude,
                            latitudeDelta: 0.0622,
                            longitudeDelta: 0.0121,
                          }}
                          style={[
                            styles.map,
                            {
                              height:
                                !isPickupScreen && isRideStarted
                                  ? hp(73.5)
                                  : hp(79.5),
                            },
                          ]}>
                          <Marker
                            identifier="myLocationMarker"
                            coordinate={mylocation}
                            pinColor="blue"
                          />

                          {assignedRide.pickUpLocation && !isRideStarted && (
                            <Marker
                              identifier="pickUpLocationMarker"
                              coordinate={{
                                latitude: assignedRide.pickUpLocation[0],
                                longitude: assignedRide.pickUpLocation[1],
                              }}
                              pinColor="green"
                            />
                          )}

                          {assignedRide.dropLocation && isRideStarted && (
                            <Marker
                              identifier="dropLocationMarker"
                              coordinate={{
                                latitude: assignedRide.dropLocation[0],
                                longitude: assignedRide.dropLocation[1],
                              }}
                            />
                          )}

                          {path?.length > 0 && (
                            <Polyline
                              coordinates={path}
                              strokeColor={'red'}
                              strokeWidth={4}
                            />
                          )}
                        </MapView>
                      </View>

                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                          gap: wp(2),
                          position: 'absolute',
                          bottom: hp(0),
                          right: hp(1),
                        }}>
                        <TouchableOpacity
                          style={[
                            styles.mapButton,
                            {backgroundColor: 'blue', marginLeft: wp(10)},
                          ]}
                          onPress={() =>
                            navigateToGoogleMaps(
                              !isRideStarted
                                ? {
                                    latitude: assignedRide.pickUpLocation[0],
                                    longitude: assignedRide.pickUpLocation[1],
                                  }
                                : {
                                    latitude: assignedRide.dropLocation[0],
                                    longitude: assignedRide.dropLocation[1],
                                  },
                            )
                          }>
                          <Text style={{textAlign: 'center', color: 'white'}}>
                            Navigate
                          </Text>
                        </TouchableOpacity>

                        {!isRideStarted ? (
                          <TouchableOpacity
                            style={[
                              styles.mapButton,
                              {
                                backgroundColor: 'green',
                                width: wp(35),
                                marginRight: wp(2),
                              },
                            ]}
                            onPress={handleReachedPickup}>
                            <Text style={{textAlign: 'center', color: 'white'}}>
                              Reached Pickup
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            onPress={handleReachedDestination}
                            style={[
                              styles.mapButton,
                              {
                                backgroundColor: 'orange',
                                width: wp(38),
                                marginRight: wp(2),
                              },
                            ]}>
                            <Text style={{textAlign: 'center', color: 'white'}}>
                              Reached Destination
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )}
              </View>
            )}
            {/* </>)} */}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
  },
  map: {
    width: wp(90),
    marginTop: hp(1),
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
    margin: hp(5),
    backgroundColor: 'white',
    borderRadius: wp(5),
    padding: wp(5),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: wp(0),
      height: hp(2),
    },
    shadowOpacity: wp(0.25),
    shadowRadius: wp(4),
    elevation: hp(5),
  },
  button: {
    borderRadius: hp(3),
    padding: hp(2),
    width: wp(30),
    margin: wp(2),
  },
  buttonAccept: {
    backgroundColor: 'green',
  },
  buttonReject: {
    backgroundColor: 'red',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: hp(2),
    textAlign: 'center',
  },
  pickUpAddressMap: {
    borderWidth: 1,
    borderColor: 'black',
    width: wp(90),
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: hp(1),
    padding: hp(0.5),
    // height: hp(11.5),
    // flex: 1,
    // zIndex: 2,
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
    // flex: 1,
    // height: hp(9),
    // zIndex: 2,
  },
});

export default MapScreen;
