import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
  Image,
  Alert,
  Modal,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {Toast} from 'react-native-toast-message/lib/src/Toast';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useIsFocused} from '@react-navigation/native';
import Calender from '../svg/Calender';
import Vehicle from '../svg/Vehicle';
import {isEmpty as _isEmpty} from 'lodash';
import moment from 'moment';
import SmallPickupIcon from '../svg/SmallPickupIcon';
import SmallDropIcon from '../svg/SmallDropIcon';
import LoaderComponent from '../components/LoaderComponent';

const HomeScreen = ({navigation}: any) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [scheduledRides, setScheduledRides] = useState<any>([
    {
      rideService: '5-hour ride',
      customerDetails: {name: 'John Doe', MobileNumber: '1234567890'},
      vehicleType: 'Lexux 300h',
      rideStatus: 'Pending',
      pickupAddress: '123 Main St, Dubai ',
      dropAddress: '456 Market St, Dubai ',
      pickupLocation: {latitude: 25.276987, longitude: 55.296249}, // Example coordinates for Dubai
      dropLocation: {latitude: 25.276987, longitude: 55.296249},
      pickupTime: '2024-10-26T06:00:00Z',
    },
    {
      rideService: '10-hour ride',
      customerDetails: {name: 'Emily Johnson', MobileNumber: '2345678901'},
      vehicleType: 'SUV',
      rideStatus: 'Ongoing',
      pickupAddress: '789 Elm St, Dubai',
      dropAddress: '321 Oak St, Dubai',
      pickupLocation: {latitude: 25.204849, longitude: 55.270782}, // Example coordinates for Dubai
      dropLocation: {latitude: 25.204849, longitude: 55.270782},
      pickupTime: '2024-10-21T06:00:00Z',
    },
    {
      rideService: 'Airport drop',
      customerDetails: {name: 'Michael Brown', MobileNumber: '3456789012'},
      vehicleType: 'Luxury Sedan',
      rideStatus: 'Completed',
      pickupAddress: '456 Pine St, Dubai',
      dropAddress: 'Dubai International Airport',
      pickupLocation: {latitude: 25.253174, longitude: 55.365672}, // Example coordinates for Dubai International Airport
      dropLocation: {latitude: 25.253174, longitude: 55.365672},
      pickupTime: '2025-10-21T06:00:00Z',
    },
    {
      rideService: 'Airport pick-up',
      customerDetails: {name: 'Sophia Davis', MobileNumber: '4567890123'},
      vehicleType: 'Minivan',
      rideStatus: 'Completed',
      pickupAddress: 'Dubai International Airport',
      dropAddress: '123 Birch St, Dubai',
      pickupLocation: {latitude: 25.253174, longitude: 55.365672}, // Example coordinates for Dubai International Airport
      dropLocation: {latitude: 25.276987, longitude: 55.296249}, // Example coordinates for drop location in Dubai
      pickupTime: '2024-12-26T08:00:00Z',
    },
    {
      rideService: 'Abu Dhabi ride',
      customerDetails: {name: 'David Wilson', MobileNumber: '5678901234'},
      vehicleType: 'Luxury SUV',
      rideStatus: 'Pending',
      pickupAddress: '101 Maple St, Dubai',
      dropAddress: 'Abu Dhabi International Airport',
      pickupLocation: {latitude: 25.276987, longitude: 55.296249}, // Example coordinates for pickup in Dubai
      dropLocation: {latitude: 24.4333, longitude: 54.7524}, // Example coordinates for Abu Dhabi International Airport
      pickupTime: '2024-11-26T06:50:00Z',
    },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRide, setSelectedRide] = useState<any>(null);

  const formatDateTime = (dateString: any) => {
    // Ensure the date string conforms to proper ISO 8601 format
    const correctedDate = moment.utc(dateString, moment.ISO_8601, true);
    if (!correctedDate.isValid()) {
      console.error('Invalid date format:', dateString);
      return 'Invalid date';
    }
    return correctedDate.local().format('Do MMM, h:mm A');
  };

  const handleStartRide = (ride: any) => {
    setSelectedRide(ride);
    setModalVisible(true);
  };

  const confirmStartRide = () => {
    setModalVisible(false);
    navigation.navigate('RideAcceptScreen', {ride: selectedRide});
  };

  return (
    <>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
          
          <Image
            source={require('../images/menu.png')}
            style={styles.centerIcon}
          />
        </TouchableOpacity>

        <Image
          source={require('../images/RolDriveIcon.png')}
          style={styles.centerIcon}
        />

        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image
            source={require('../images/SupportIcon.png')}
            style={styles.centerIcon}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <LoaderComponent />
        </View>
      ) : (
        <>
          <View style={styles.container}>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Text style={styles.rideTitle}>Upcoming Rides</Text>
            </View>
            {_isEmpty(scheduledRides) ? (
              <View style={styles.noRidesContainer}>
                <Text style={styles.noRidesContainerText}>
                  No scheduled rides found !
                </Text>
              </View>
            ) : (
              <ScrollView>
                {scheduledRides?.length > 0 &&
                  scheduledRides.map((rides: any, i: any) => {
                    return (
                      <View style={styles.pickUpView} key={i + 1}>
                        <View style={styles.parentView}>
                          <View style={styles.pickUpIconView}>
                            <SmallPickupIcon />
                          </View>
                          <View style={styles.subView}>
                            <View style={{flexDirection: 'column'}}>
                              <Text style={styles.heading}>Pickup</Text>
                              <Text style={styles.addressText}>
                                {rides.pickupAddress}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.verticalLine} />

                          <View style={styles.dropView}>
                            <View style={styles.dropIconView}>
                              <SmallDropIcon />
                            </View>
                            <View
                              style={{
                                flexDirection: 'column',
                                marginLeft: wp(1),
                              }}>
                              <Text style={styles.heading}>Destination</Text>
                              <Text style={styles.addressText}>
                                {rides.dropAddress}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.horizontal} />
                          <View style={styles.extraDetailView}>
                            <View style={styles.detailItem}>
                              <Calender />
                              <View style={styles.detailTextContainer}>
                                <Text style={styles.text}>Date & Time</Text>
                                <Text style={styles.subText}>
                                  {formatDateTime(rides.pickupTime)}
                                </Text>
                              </View>
                            </View>

                            <View style={styles.detailItem}>
                              <Vehicle />
                              <View style={styles.detailTextContainer}>
                                <Text style={styles.text}>Vehicle</Text>
                                <Text
                                  style={[styles.subText, {maxWidth: wp(15)}]}>
                                  {rides.vehicleType}
                                </Text>
                              </View>
                            </View>
                          </View>

                          <View style={styles.horizontal} />
                          <View style={styles.rideServiceType}>
                            <View style={styles.rideInfo}>
                              <Text
                                style={{
                                  alignItems: 'center',
                                  fontFamily: 'RobotoMono-Regular',
                                  fontWeight: '700',
                                  fontSize: 20,
                                  color: '#000000',
                                  marginBottom: hp(1),
                                }}>
                                {rides.rideService}
                              </Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => handleStartRide(rides)}
                              style={styles.startRideButton}>
                              <Text style={styles.startRideText}>
                                Start Ride
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })}
              </ScrollView>
            )}
          </View>
          {/* Modal for confirmation */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(false);
            }}>
            <View style={styles.modalContainer}>
              <View style={styles.modalView}>
                <Text style={styles.modalMessage}>
                  Are you sure you want to start the ride?
                </Text>
                <Text style={styles.modalTitle}>
                  {selectedRide?.rideService}
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalButtonCancel}
                    onPress={() => setModalVisible(false)}>
                    <Text style={styles.modalButtonCancelText}>No</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalButtonConfirm}
                    onPress={confirmStartRide}>
                    <Text style={styles.modalButtonYesText}>Yes, Continue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1),
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    backgroundColor: '#FFFFFF',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },

  centerIcon: {
    width: wp(10),
    height: hp(5),
    resizeMode: 'contain',
    flex: 1,
  },
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: '700',
    fontFamily: 'RobotoMono-Regular',
  },
  rideTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'RobotoMono-Regular',
    alignSelf: 'center',
    justifyContent: 'center',
    color: '#212121',
  },
  container: {
    flex: 1,
    paddingTop: hp(9),
    backgroundColor: '#FFF8F5',
  },
  dropIconView: {marginRight: wp(2)},
  pickUpIconView: {
    marginTop: hp(3),
    marginLeft: wp(5),
  },
  mainView: {
    width: wp(90),
    height: hp(8),
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    marginLeft: hp(1.5),
  },
  heading: {
    fontWeight: '800',
    color: '#000000',
    fontSize: hp(2),
  },
  parentView: {
    backgroundColor: '#ffffff',
    width: wp(90),
    alignSelf: 'center',
    marginTop: hp(2),
    borderRadius: wp(2),
    elevation: 2,
    // flex: 1,
    // height: hp(10),
    // maxHeight: hp(45),
  },
  pickUpView: {
    // backgroundColor: '#F2F3F7',
    // borderRadius: wp(8),
    // marginBottom: hp(2),
    // display: 'flex',
    // padding: wp(1),
    // height: hp(100),
    // paddingLeft: 5,
    // paddingRight: 5,
    // marginTop: hp(3),
  },
  textScheduleRideDetail: {
    fontWeight: '700',
    fontFamily: 'RobotoMono-Regular',
    color: '#000000',
    fontSize: hp(2),
    marginTop: hp(-1),
    marginBottom: hp(2),
    paddingLeft: wp(3),
  },
  noRidesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: hp(100),
  },
  noRidesContainerText: {
    fontWeight: '700',
    fontFamily: 'RobotoMono-Regular',
    color: '#000',
    fontSize: hp(5),
  },
  loader: {
    height: hp(100),
    width: wp(100),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  addressText: {
    fontWeight: '700',
    fontFamily: 'RobotoMono-Regular',
    color: '#000000',
    fontSize: hp(1.6),
    maxWidth: wp(68),
    marginTop: hp(0.5),
  },
  dateTimeText: {
    fontWeight: '700',
    fontFamily: 'RobotoMono-Regular',
    color: '#000000',
    fontSize: hp(2),
    padding: wp(3),
  },
  subHeadingContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: hp(2),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(1),
  },
  subHeading: {
    fontWeight: '700',
    fontFamily: 'RobotoMono-Regular',
    margin: wp(5),
    fontSize: hp(2),
    color: '#9CA3AF',
  },
  subHeadingData: {
    fontWeight: '700',
    fontFamily: 'RobotoMono-Regular',
    color: '#000000',
    margin: wp(5),
    marginTop: hp(-2),
    marginBottom: hp(2),
    fontSize: wp(5),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  pickUpContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: hp(2),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    paddingRight: 5,
    justifyContent: 'space-between',
  },
  horizontal: {
    backgroundColor: '#F2F3F7',
    height: 1,
    width: wp(80),
    marginLeft: wp(6),
    alignSelf: 'center',
    marginTop: hp(2),
  },

  verticalLine: {
    width: wp(0.5),
    alignSelf: 'flex-start',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderRadius: 1,
    marginLeft: wp(9.2),
    height: hp(5),
    maxHeight: hp(7),
    flex: 2,
    position: 'absolute',
    marginTop: hp(7.5),
  },
  subView: {
    // backgroundColor: '#ffffff',
    width: wp(73),
    flexDirection: 'row',
    // alignSelf: 'center',
    marginLeft: wp(15),
    marginTop: hp(-3.5),
    alignSelf: 'flex-start',
    left: wp(2),
    position: 'relative',
  },
  dropView: {
    width: wp(80),
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: hp(2),
  },
  extraDetailView: {
    flexDirection: 'row', // Align items in a row
    justifyContent: 'space-between', // Space between the two items
    alignItems: 'center', // Center items vertically
    margin: wp(4),
    flexWrap: 'nowrap', // Ensure no wrapping occurs (if possible)
  },

  detailItem: {
    flexDirection: 'row', // Ensure each item (Date & Time and Vehicle) is aligned in a row
    alignItems: 'center', // Align icons and text in the center
    // flex: 1, // Let items grow and shrink equally to take up available space
    marginRight: wp(2),
  },

  detailTextContainer: {
    flexDirection: 'column',
    marginLeft: wp(3),
  },

  text: {
    fontFamily: 'RobotoMono-Regular',
    color: '#9CA3AF',
    fontWeight: '700',
  },

  subText: {
    fontFamily: 'RobotoMono-Regular',
    fontWeight: '800',
    color: '#000000',
    fontSize: hp(1.8),
    flexWrap: 'wrap', // Ensure no wrapping occurs (if possible)
  },

  rideServiceType: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: wp(4),
  },
  rideInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  startRideButton: {
    padding: wp(3),
    marginBottom: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5302',
    borderColor: 'green',
    borderRadius: wp(3),
    width: wp(35),
    flexDirection: 'row',
    gap: wp(2),
  },
  startRideText: {
    fontFamily: 'RobotoMono-Regular',
    fontSize: wp(4.5),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalView: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 2,
    alignItems: 'center',
    justifyContent:'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: wp(95),
    height: hp(27),
  },
  modalTitle: {
    fontFamily: 'RobotoMono-Regular',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: hp(3),
    color: '#212121',
  },
  modalMessage: {
    fontFamily: 'RobotoMono-Regular',
    fontWeight: '600',
    fontSize: 18,
    paddingHorizontal: wp(15),
    marginBottom: hp(2),
    textAlign: 'center',
    color: '#223544',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: wp(85),
  },
  modalButtonCancel: {
    borderWidth: 1,
    borderColor: '#EB5757',
    padding: 10,
    borderRadius: 5,
    width: '45%',
  },
  modalButtonConfirm: {
    backgroundColor: '#FF5302',
    padding: 10,
    borderRadius: 5,
    width: '45%',
  },
  modalButtonCancelText: {
    fontFamily: 'RobotoMono-Regular',
    color: '#EB5757',
    textAlign: 'center',
    fontWeight: '700',
  },
  modalButtonYesText: {
    fontFamily: 'RobotoMono-Regular',
    color: 'white',
    textAlign: 'center',
    fontWeight: '700',
  },
});

export default HomeScreen;
