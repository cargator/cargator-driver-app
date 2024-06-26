import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Image, ImageBackground} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import SidebarIcon from '../../svg/SidebarIcon';
import LoaderComponent from '../../components/LoaderComponent';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
  } from 'react-native-responsive-screen';

// Mock data
const prev = [
  {
    _id: '411563121716194068',
    date: '05 June, 2024',
    dist: '2 kms',
    time: '20 mins',
    status: 'Complete',
    earning: 20,
  },
  {
    _id: '2',
    date: '05 June, 2024',
    dist: '2 kms',
    time: '20 mins',
    status: 'Complete',
    earning: 20,
  },
  {
    _id: '3',
    date: '05 June, 2024',
    dist: '2kms',
    time: '20 mins',
    status: 'Complete',
    earning: 20,
  },
  {
    _id: '4',
    date: '05 June, 2024',
    dist: '2kms',
    time: '20 mins',
    status: 'Complete',
    earning: 20,
  },
  {
    _id: '5',
    date: '05 June, 2024',
    dist: '2 kms',
    time: '20 mins',
    status: 'Complete',
    earning: 20,
  },
];

const HistoryPage = (props: any) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [historyData, setHistoryData] = useState<
    {
      _id: string;
      date: string;
      dist: string;
      time: string;
      status: string;
      earning: number;
    }[]
  >([]); // Specify the type explicitly

  useEffect(() => {
    // Simulate fetching data (replace with actual API call)
    const fetchHistory = async () => {
      try {
        // Simulate API response delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setHistoryData(prev); // Set the mock data here
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchHistory();
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
          <Text style={{fontSize: hp(3), fontFamily: 'RobotoMono-Regular'}}>
            My History
          </Text>
        </View>
      </TouchableOpacity>
      {loading ? (
        <LoaderComponent />
      ) : (
        <>
          <View style={{backgroundColor: 'white'}}>
            {/* <Text>History</Text> */}
          </View>
          <View style={styles.container}>
            <View style={styles.imageContainer}>
              <ImageBackground
                source={require('../../images/orderHistoryBanner.png')}
                resizeMode="cover"
                style={styles.image}>
                <Incentive />
              </ImageBackground>
            </View>
            {/* <Image style={styles.image} source={require('../../images/orderHistoryBanner.png')} />  */}
            {historyData.map(item => (
              <OrderHistoryCart order={item} key={item._id} />
            ))}
          </View>
        </>
      )}
    </>
  );
};
const Incentive = () => {
  return (
    <>
      <View style={{alignItems: 'center'}}>
        <Text style={{color: 'white', fontFamily: 'Roboto Mono'}}>
          Incentive
        </Text>
        <Text style={styles.IncentiveOne}> 400₹ </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
          paddingHorizontal: '10%',
        }}>
        <View style={{alignItems: 'center'}}>
          <Text style={{color: 'white'}}>Total Hours</Text>
          <Text style={{color: 'white'}}>10h:27:28</Text>
        </View>
        <View style={{alignItems: 'center'}}>
          <Text style={{color: 'white'}}>Total Ride</Text>
          <Text style={{color: 'white'}}>15</Text>
        </View>
      </View>
    </>
  );
};

const OrderHistoryCart = ({
  order,
}: {
  order: {
    _id: string;
    date: string;
    dist: string;
    time: string;
    status: string;
    earning: number;
  };
}) => {
  // Specify the type for order explicitly
  return (
    <View style={styles.historyItem}>
      <View style={{flexDirection: 'row', marginBottom: 5}}>
        <Text style={styles.orderId}>Order Id : </Text>
        <Text style={styles.orderId}> {order._id}</Text>
      </View>

      <View style={styles.row}>
        <Text style={{...styles.value, color: 'black'}}>
          <Image source={require('../../images/date.png')} /> {order.date}
        </Text>

        <View style={styles.row}>
          <View style={{marginRight: '13%'}}>
            <Image
              style={{position: 'absolute'}}
              source={require('../../images/watch.png')}
            />
            <Image
              style={{position: 'absolute', marginTop: 5, marginLeft: 9}}
              source={require('../../images/distance.png')}
            />
          </View>
          <Text style={{color: 'black', fontWeight: 'bold', fontSize: 12.5}}>
            {order.time} - {order.dist}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.value}>
          <Image source={require('../../images/watch.png')} /> {order.status}
        </Text>

        <Text style={{fontSize: 18, marginLeft: '32%'}}>₹</Text>
        <Text
          style={{
            ...styles.orderId,
            color: '#118F5E',
            flex: 1,
            marginLeft: 20,
          }}>
          {order.earning}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(2),
    width: wp(100),
  },
  historyItem: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  value: {
    flex: 1,
    color: 'black',
    fontWeight: 'bold',
    fontSize: 12.5,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  image: {
    justifyContent: 'center',
    height: 135,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    // borderRadius: 10
  },
  IncentiveOne: {
    color: 'white',
    textShadowColor: 'black',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowOffset: {width: 0.4, height: 5},
    textShadowRadius: 14,
    paddingBottom: 10,
  },
});

export default HistoryPage;
