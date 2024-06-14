import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const ProgressItem = ({ label, value }: { label: string, value: string }) => {
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
        />
      </Svg>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const OrderScreen = () => {
    return (
        // < >
        <View style={{height:'100%'}}>
        
        <View style={styles.container}>

       

          <View style={styles.headerContainer}>
            <Text style={styles.header}>My Progress</Text>
            <Text style={styles.subHeader}>Today</Text>
          </View>
          <View style={styles.progressItems}>
            <ProgressItem label="Earning" value="0" />
            <ProgressItem label="Login hours" value="0.00" />
            <ProgressItem label="Orders" value="0" />
          </View>
        </View>

        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>My Progress</Text>
            <Text style={styles.subHeader}>This Week</Text>
          </View>
          <View style={styles.progressItems}>
            <ProgressItem label="Earning" value="0" />
            <ProgressItem label="Login hours" value="0.00" />
            <ProgressItem label="Orders" value="0" />
          </View>
        </View>

        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>My Progress</Text>
            <Text style={styles.subHeader}>This Month</Text>
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
    };
    
    

const styles = StyleSheet.create({
  container: {
    flex: 0.25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    height:'100%'

  },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: 20,
  },
  header: {
    fontSize: 24,
    // marginBottom: 20,
    color:'black',
   
  },
  subHeader: {
    marginTop:'4%',
    fontSize: 12,
    color: 'grey',
    
  },
  progressItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'center',
    height:'80%',
    width: '90%',
    // paddingBottom:'40%'
   
  },
  progressItem: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',

  },
  label: {
    position: 'absolute',
    top: 1,
    textAlign: 'center',
  },
  value: {
    // position: 'absolute',
    bottom: 40,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default OrderScreen;
