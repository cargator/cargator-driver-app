import React from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import OffLineScreen from './offLineScreen';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
// import SvgSpinner from '../../images/spinner.svg'; // Import the SVG spinner

const ProgressItem = ({ label, value }: { label: string, value: string }) => {
  return (
    <View style={styles.progressItem}>
      <Svg height="100" width="100">
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="10%" stopColor="#00cc66" stopOpacity="1" />
            <Stop offset="50%" stopColor="#00cc66" stopOpacity="0.2" />
          </LinearGradient>
        </Defs>
        <Circle
          cx="50"
          cy="50"
          r="48"
          stroke="url(#grad)"
          strokeWidth="1.2"
          fill="none"
        />
      </Svg>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const OnLineScreen = () => {

  
  return (
    // < >
    <View style={{height:'100%'}}>
      <View style={styles.container}>
      <Image
        source={require('../../images/map.png')}
        style={styles.image}
      />
      {/* <OffLineScreen/> */}
      {/* <SvgSpinner width={100} height={100} />  */}
    </View>
    <View style={[styles.container]}>

   

      <View style={styles.headerContainer}>
        <Text style={styles.header}>Today Progress</Text>
        
      </View>
      <View style={styles.progressItems}>
        <ProgressItem label="Earning" value="0" />
        <ProgressItem label="Login hours" value="0.00" />
        <ProgressItem label="Orders" value="0" />
      </View>
    </View>

    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>This Week Progress</Text>
       
      </View>
      <View style={styles.progressItems}>
        <ProgressItem label="Earning" value="0" />
        <ProgressItem label="Login hours" value="0.00" />
        <ProgressItem label="Orders" value="0" />
      </View>
    </View>

    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>This Month Progress</Text>
    
      </View>
      <View style={styles.progressItems}>
        <ProgressItem label="Earning" value="0" />
        <ProgressItem label="Login hours" value="0.00" />
        <ProgressItem label="Orders" value="0" />
      </View>
    </View>

   </View>
    // </>
  );

  // return (
  //   <View style={styles.container}>
  //     <Image
  //       source={require('../../images/map.png')}
  //       style={styles.image}
  //     />
  //     {/* <OffLineScreen/> */}
  //     {/* <SvgSpinner width={100} height={100} />  */}
  //   </View>
  // );
};

// const styles = StyleSheet.create({
//   container: {
//     alignItems: 'center',
//   },
//   image: {
//     width: '100%',
//     margin:0,
//     padding:0
//   },
// });
const styles = StyleSheet.create({
  container: {
    flex:0.2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    height:'100%'

  },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginVertical: 20,
  },
  header: {
    fontSize: 20,
    // marginBottom: 20,
    color:'black',
   
  },

  progressItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'center',
    height:'80%',
    width: '95%',
    // paddingBottom:'40%'
   
  },
  progressItem: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    // position: 'relative',
  },
  label: {
    position: 'absolute',
    top: 1,
    // textAlign: 'center',
  },
  value: {
    // position: 'absolute',
    bottom: 50,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  }, image: {
        width: '100%',
        margin:0,
        padding:0
      },
});

export default OnLineScreen;
