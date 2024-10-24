import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import SidebarIcon from '../../svg/SidebarIcon';
import LoaderComponent from '../../components/LoaderComponent';

const RideHistory = (props: any) => {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <>
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => {
            props.navigation.toggleDrawer();
          }}>
          <SidebarIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rol-Drive</Text>
      </View>
      {loading ? (
        <View style={styles.loader}>
          <LoaderComponent />
        </View>
      ) : (
        <>
          <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <Text
                style={{
                  alignItems: 'center',
                  fontFamily: 'RobotoMono-Regular',
                  fontWeight: '700',
                  fontSize: 20,
                  color: '#000000',
                }}>
                No History!
              </Text>
            </ScrollView>
          </View>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  headerBar: {
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
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  loader: {
    height: hp(100),
    width: wp(100),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  scrollContainer: {
    paddingTop: hp(12), // Ensures content doesn't overlap the header
    alignItems: 'center',
    justifyContent: 'center',
    width: wp(100),
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: hp(10),
    width: wp(100),
    height: hp(100),
  },
});

export default RideHistory;
