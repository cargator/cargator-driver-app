import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import LoaderKit from 'react-native-loader-kit'

const OnLineScreen = () => {
  return (
    <View style={styles.main}>
    <View style={styles.header}>
      <Text style={styles.text}> Searching for orders</Text>
      <LoaderKit
        style={styles.loader}
      name={'BallPulse'} // Optional: see list of animations below
     color={'black'} // Optional: color can be: 'red', 'green',... or '#ddd', '#ffffff',...
     />
    </View>
    <View style={styles.container}>
      <LoaderKit
  style={styles.loader2}
  name={'BallScaleMultiple'} // Optional: see list of animations below
  color={'green'} // Optional: color can be: 'red', 'green',... or '#ddd', '#ffffff',...
/>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loader2:{
   marginTop:'90%',
    width: 300, 
    height: 300 ,
  },
main:{
  backgroundColor: '#f5f5f5',
},
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity:0.5,
    backgroundColor: '#fff',
  },
  loader: {
    width: 18,
    height: 18,
    marginTop:13,
    marginLeft: 5, // Optional: adds some space between text and loader
  },
  header:{
    flexDirection: 'row',
    alignItems: 'center',
  },
  text:{
    fontSize: 28,
    color:'black'
  }

});

export default OnLineScreen;
