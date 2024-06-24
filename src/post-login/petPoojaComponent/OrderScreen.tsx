import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {blue, green} from 'react-native-reanimated';
import Svg, {Circle} from 'react-native-svg';
import SlideButton from 'rn-slide-button';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { color } from 'react-native-elements/dist/helpers';

const ProgressItem = ({label, value}: {label: string; value: string}) => {
  return (
    <View style={styles.progressItem}>
      <Svg height="100" width="100">
        <Circle
          cx="50"
          cy="50"
          r="48"
          stroke="#00cc66"
          strokeWidth="2"
          fill="none"
          opacity="200%"
        />
      </Svg>
    
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value} ₹</Text>
    </View>
  );
};

const OrderScreen = ({order}: any) => {
  useEffect(() => {
    console.log(order);
  });

  return (
    <>
      <View style={{height: '25%'}}></View>
      <View style={styles.container}>
        <View style={styles.order}>
          <Text>Order ID:</Text>
          <Text style={{color:'green',fontSize:18,fontWeight:'bold'}} >{order._id.$oid}</Text>
          </View>
        
        <View style={styles.progressItem}>
        <ProgressItem label={'₹\nEarning'} value={order.Earning} />
        </View>
        <View style={styles.text}>
          <Text>Time : {order.Time}</Text>
          <Text>Distance :{order.Distance}</Text>
        </View>
        <View style={{alignItems: 'center',marginTop:'5%'}}>
          <Text> <Image
        source={require('../../images/cart.png')}   /> Pickup Location</Text>
          <Text style={{fontWeight:'bold'}}>{order.pickup_details.address}</Text>
        </View>
        <View>
          <SlideButton
            width={290}
            height={50}
            animationDuration={180}
            autoResetDelay={1080}
            animation={true}
            autoReset={true}
            borderRadius={15}
            sliderWidth={50}
          //  icon={<Image source={require('../../images/btn.png')}  />} 
            containerStyle={{backgroundColor: 'green', color: 'red'}}
            underlayStyle={{backgroundColor: 'Red'}}
            title='Accept Order'
            slideDirection="right">
          </SlideButton>

          <SlideButton
            width={290}
            height={50}
            borderRadius={15}
            animationDuration={180}
            autoResetDelay={1080}
            animation={true}
            autoReset={true}
            sliderWidth={50}
            containerStyle={{ backgroundColor: 'transparent', color: 'red'}}
            underlayStyle={{backgroundColor: 'Red'}}
             title='Reject Order'
            titleStyle={{color:'red'}}
            slideDirection="right">
            <Text style={{color: 'red', fontSize: 18}}>hiiiiiiitejas</Text>
          </SlideButton>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  progressItem: {
    // width: 100,
    // height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop:'2.5%'
  },
  label: {
    position: 'absolute',
    top: 10,
    textAlign: 'center',
  },
  value: {
    // position: 'absolute',
    bottom: 50,
    fontSize: 24,
    fontWeight: 'bold',
    color:'black',
    textAlign: 'center',
  },
  container: {
    alignItems: 'center',
  },
  text: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 70,
  },
  order:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});

export default OrderScreen;
