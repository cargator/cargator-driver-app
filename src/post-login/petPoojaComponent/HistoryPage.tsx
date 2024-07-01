import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import SidebarIcon from '../../svg/SidebarIcon';
import LoaderComponent from '../../components/LoaderComponent';
import DatePicker from 'react-native-date-picker';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import axios from 'axios';
import { string } from 'yup';

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
    _id: '411563121716194069',
    date: '05 June, 2024',
    dist: '2 kms',
    time: '20 mins',
    status: 'Complete',
    earning: 20,
  },
  {
    _id: '411563121716194076',
    date: '05 June, 2024',
    dist: '2kms',
    time: '20 mins',
    status: 'Complete',
    earning: 20,
  },
  {
    _id: '411563121716194067',
    date: '05 June, 2024',
    dist: '2kms',
    time: '20 mins',
    status: 'Complete',
    earning: 20,
  },
  {
    _id: '411563121716194034',
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
  const [page, setPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [finaldate,setFinalDate]=useState(String);

  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const setScreenDate = async (newDate: number, month: number, year: number) => {
         await setFinalDate(newDate+' '+months[month] +', '+year) 
  };

  const fetchHistory = async (page: number) => {
    try {
      setLoading(page === 1);
      setIsLoadingMore(page !== 1);
      await new Promise(resolve => setTimeout(resolve, 1000));
      //  API call
      const data = prev; // Use mock data for demonstration
      setHistoryData(data);
      setLoading(false);
      setIsLoadingMore(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const api=async ()=>{
    console.log("start");
    
    const data=await axios.get('http://192.168.1.53:3001/getHistory')
    console.log(data);
    console.log("end");
    
  }
  
  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" />
      </View>
    );
  };

  useEffect(() => {
    fetchHistory(page);
    if(!finaldate)
      {
        setScreenDate(
          date.getDate(),
          date.getMonth(),
          date.getFullYear()
        );
       
        
        
      }
  }, [page]);

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
          }}></View>
      </TouchableOpacity>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          // backgroundColor: 'yellow',
        }}>
        <Text
          style={{
            fontSize: 18,
            fontFamily: 'RobotoMono-Regular',
            color: 'black',
            paddingLeft: '4%',
          }}>
          Order History
        </Text>
        <View
          style={{
            flexDirection: 'row',
            gap: 2,
            borderWidth: 1,
            borderColor: 'black',
            marginRight: '5%',
            borderRadius: 5,
            padding: 5,
          }}>
          <Image
            style={{marginTop: 4}}
            source={require('../../images/date2.png')}
          />
          <TouchableOpacity onPress={() => setOpen(true)}>
            <Text style={{color: 'black'}}>{finaldate}</Text>
            {/* <Text></Text> */}
          </TouchableOpacity>
          <DatePicker
            modal
            open={open}
            mode="date"
            date={date}
            onConfirm={newdate => {
              api();
              setOpen(false);
              setDate(newdate);
              setScreenDate(
                newdate.getDate(),
                newdate.getMonth(),
                newdate.getFullYear()
              );
            }}
            onCancel={() => {
              setOpen(false);
            }}
          />
        </View>
      </View>
      {loading ? (
        <LoaderComponent />
      ) : (
        <>
          <View></View>
          <View style={styles.container}>
            <View style={styles.imageContainer}>
              <ImageBackground
                source={require('../../images/orderHistoryBanner.png')}
                resizeMode="cover"
                style={styles.image}>
                <Incentive />
              </ImageBackground>
            </View>
            <FlatList
              data={historyData}
              renderItem={({item}) => <OrderHistoryCart order={item} />}
              keyExtractor={item => item._id}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.8}
              ListFooterComponent={renderFooter}
              showsVerticalScrollIndicator={false}
            />
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
        <Text style={styles.orderId}> {order._id.slice(-6)}</Text>
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

        <Text style={{fontSize: 18, marginLeft: '30%'}}>₹</Text>
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
    height:35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // backgroundColor: 'red',
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
    marginBottom: 4,
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
    fontSize: 16,
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
  footer: {
    paddingVertical: 20,
  },
});

export default HistoryPage;