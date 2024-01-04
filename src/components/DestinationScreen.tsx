import React, {useState} from 'react';
import {Modal, StyleSheet, Text, Pressable, View} from 'react-native';

import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {socketInstance} from '../post-login/MapScreen';
import {useSelector} from 'react-redux';

const DestinationScreen = ({navigation, route}: any) => {
  const [modalVisible, setModalVisible] = useState(true);
  const rideDetails = useSelector((store: any) => store.rideDetails);

  const handlePaymentCompletedButton = () => {
    socketInstance?.emit('payment-completed', {
      rideId: route?.params?.assignedRide._id
        ? route.params.assignedRide._id
        : rideDetails?._id,
    });
    setModalVisible(!modalVisible);
    // dispatch(removePhoneNumber())
    // navigation.navigate('LoginScreen');
    route.params.setAssignedRide();
    navigation.navigate('MapScreen');
  };

  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View>
              <Text
                style={{
                  color: 'black',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                Fare Completed !
              </Text>

              <Text
                style={{
                  color: 'black',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                Total Fare: Rs.
                {route?.params?.assignedRide?.fare
                  ? route.params.assignedRide.fare
                  : rideDetails?.fare}
              </Text>
            </View>

            <View>
              <Text style={{color: 'black', fontWeight: 'bold', margin: wp(2)}}>
                {/* Your Waiting Time was {route.params.waitingTime ? route.params.waitingTime:0} seconds. */}
                Your Waiting Time is 0
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              <Pressable
                onPress={handlePaymentCompletedButton}
                style={[styles.button, styles.buttonAccept]}>
                <Text style={styles.textStyle}>Payment Completed</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    height: hp(30),
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
});

export default DestinationScreen;
