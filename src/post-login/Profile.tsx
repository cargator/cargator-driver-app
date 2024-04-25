import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { useDispatch, useSelector } from 'react-redux';
import SidebarIcon from '../svg/SidebarIcon';
import moment from 'moment';
import LoaderComponent from '../components/LoaderComponent';
import { userDetails } from '../services/rideservices';
import { useIsFocused } from '@react-navigation/native';
import LogOutIcon from '../svg/LogOutIcon';
import { socketDisconnect } from '../utils/socket';
import { removeUserData } from '../redux/redux';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { isEmpty } from 'lodash';
import RNFetchBlob from 'rn-fetch-blob';
import { FetchUserImage } from '../components/functions';
const Profile = (props: any) => {
  const userId = useSelector((store: any) => store.userData._id);
  const userImg = useSelector((store: any) => store.userImage.path);
  const profileImageKey = useSelector(
    (store: any) => store.userData.profileImageKey,
  );
  const [driverDetails, setDriverDetails] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const [formattedDate, setFormattedDate] = useState('');
  const handleLogout = async () => {
    try {
      await RNFetchBlob.fs.unlink(`file://${userImg}`);
      socketDisconnect();
      dispatch(removeUserData());
    } catch (error) {
      console.log('error while logging out', error);
    }
  };
  const getDriverDetail = async () => {
    try {
      setLoading(true);
      const response = await userDetails(userId);
      setDriverDetails(response.data);
      setFormattedDate(moment(response.data.createdAt).format('D MMMM, YYYY'));
    } catch (error) {
      console.log('Driver Detail error :>> ', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      getDriverDetail();
    } else {
      setDriverDetails([]);
    }
  }, [isFocused]);

  const checkImageExists = async () => {
    try {
      const exists = await RNFetchBlob.fs.exists(userImg);
      if (!exists) {
        console.log('fetching user Image.....as he may have cleared cache');
        await FetchUserImage(dispatch, profileImageKey, userId);
      }
    } catch (error) {
      console.log('error in checkImageExists', error);
      Toast.show({
        type: 'error',
        text1: 'Something went wrong !',
      });
    }
  };
  useEffect(() => {
    checkImageExists();
  }, []);
  return (
    <>
      <TouchableOpacity
        style={styles.header}
        onPress={() => props.navigation.toggleDrawer()}>
        <SidebarIcon />
        <View
          style={{
            alignSelf: 'flex-start',
            flexDirection: 'row',
            flex: 1,
            marginLeft: wp(2),
            marginTop: hp(0.4),
          }}>
          <Text style={{ fontSize: hp(3), fontFamily: 'RobotoMono-Regular' }}>
            My Profile
          </Text>
        </View>
      </TouchableOpacity>
      {loading || isEmpty(driverDetails) ? (
        <LoaderComponent />
      ) : (
        <>
          <View style={styles.container}>
            <View style={{ alignItems: 'center' }}>
              <Image
                style={styles.profileView}
                source={{ uri: `file://${userImg}` }}
              />

              <View style={styles.profileDataContainer}>
                <View style={styles.contentView}>
                  <Text style={styles.contentViewHeading}>Name</Text>
                  <Text style={styles.contentViewText}>
                    {driverDetails.firstName} {driverDetails.lastName}
                  </Text>
                </View>

                <View style={styles.contentView}>
                  <Text style={styles.contentViewHeading}>Mobile Number</Text>
                  <Text style={styles.contentViewText}>
                    +{driverDetails.mobileNumber}
                  </Text>
                </View>
                <View style={styles.contentView}>
                  <Text style={styles.contentViewHeading}>Vehicle Number</Text>
                  <Text style={styles.contentViewText}>
                    {driverDetails.vehicleNumber ?
                      `${driverDetails.vehicleNumber.substring(0, 2)}{' '}
                      ${driverDetails.vehicleNumber.substring(2, 4)}{' '}
                      ${driverDetails.vehicleNumber.substring(4, 6)}{' '}
                      ${driverDetails.vehicleNumber.substring(6)}`
                      : 'N/A'
                    }
                  </Text>
                </View>
                <View style={styles.contentView}>
                  <Text style={styles.contentViewHeading}>Vehicle Type</Text>
                  <Text style={styles.contentViewText}>
                    {driverDetails.vehicleType}
                  </Text>
                </View>
                <View style={styles.contentView}>
                  <Text style={styles.contentViewHeading}>Vehicle Name</Text>
                  <Text style={styles.contentViewText}>
                    {driverDetails.vehicleName}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.bottomView}>
            <TouchableOpacity onPress={handleLogout}>
              <LogOutIcon />
            </TouchableOpacity>
            <Text style={styles.date}>Member Since {formattedDate}</Text>
          </View>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  profileDataContainer: {
    alignSelf: 'center',
    gap: wp(2),
    marginTop: hp(5),
    // width: wp(70),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(2),
    width: wp(100),
  },
  profileView: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(50),
    backgroundColor: '#2BB180',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(10),
  },
  profileText: { color: '#ffffff', fontSize: wp(10) },
  horixontalLine: {
    backgroundColor: '#E5E7EB',
    height: 1,
    width: wp(60),
    marginTop: hp(8),
    alignSelf: 'center',
  },
  contentView: {
    borderRadius: wp(3),
    shadowColor: '#171717',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 25,
    width: wp(90),
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  contentViewHeading: {
    fontFamily: 'RobotoMono-Regular',
    color: '#9CA3AF',
    fontSize: hp(1.8),
    fontWeight: '500',
  },
  contentViewText: {
    fontFamily: 'RobotoMono-Regular',
    color: '#212121',
    fontSize: hp(2.2),
    fontWeight: '500',
  },
  text: { fontSize: wp(5), color: '#000000' },
  loaderStyles: { marginTop: hp(40), alignSelf: 'center' },
  bottomView: {
    top: hp(15),
    alignSelf: 'center',
    alignItems: 'center',
  },
  date: { fontFamily: 'RobotoMono-Regular', marginTop: hp(4), color: '#BAB6B6', fontWeight: '600' },
});

export default Profile;
