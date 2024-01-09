import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {socketInstance as socket} from './MapScreenOld';

const SelectCustomer = ({
  chooseRide,
  setLoading,
  setNavigationStep,
  setAvailableRides,
  updateMapDirections,
}: any) => {
  console.log(`SelectCustomer called >> chooseRide :>>`, chooseRide);

  const onPressAccept = async () => {
    console.log('onPressAccept Called');
    setLoading(true);
    updateMapDirections(chooseRide);
    setNavigationStep(1);
    socket?.emit('ride-accept', {id: chooseRide?._id}); // eventName:ride-accept
    setLoading(false);
  };

  const onPressReject = () => {
    console.log('onPressReject Called');
    setAvailableRides((allRides: any[]) =>
      allRides.filter(ride => ride._id != chooseRide._id),
    );
    socket?.emit('cancel-ride', {ride_id: chooseRide?._id});
  };

  return (
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <View>
          <Text style={{fontFamily: 'RobotoMono-Regular',color: 'black', fontWeight: 'bold'}}>
            Pickup Location:
          </Text>
          <Text style={{fontFamily: 'RobotoMono-Regular',color: 'black', fontSize: hp(1.8)}}>
            {chooseRide.pickUpAddress}
          </Text>
        </View>

        <View>
          <Text style={{fontFamily: 'RobotoMono-Regular', color: 'black', fontWeight: 'bold', margin: wp(2)}}>
            Estimated Fare: $10
          </Text>
        </View>

        <View
          style={{
            alignItems: 'flex-end',
            flexDirection: 'row',
          }}>
          <Pressable
            style={[styles.button, styles.buttonReject]}
            onPress={onPressReject}>
            <Text style={styles.textStyle}>Reject</Text>
          </Pressable>

          <Pressable
            onPress={onPressAccept}
            style={[styles.button, styles.buttonAccept]}>
            <Text style={styles.textStyle}>Accept</Text>
          </Pressable>
        </View>
      </View>
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
    fontFamily: 'RobotoMono-Regular',
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: hp(2),
    textAlign: 'center',
  },
});

export default SelectCustomer;
