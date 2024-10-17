import React, {useEffect, useRef, useState} from 'react';
import {View, Button, Alert, StyleSheet, ActivityIndicator, Text, Animated} from 'react-native';
// import {launchCamera, Asset, CameraOptions} from 'react-native-image-picker';
import ImagePicker from 'react-native-image-crop-picker';

import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {getS3SignUrlApi, updateImageKey} from '../../services/userservices';
import RNFetchBlob from 'rn-fetch-blob';
import axios from 'axios';
import {Buffer} from 'buffer';
import { requestCameraPermission } from '../../components/functions';
import Toast from 'react-native-toast-message';
import { randomLoderColor } from '../../svg/helper/constant';
import { TouchableOpacity } from 'react-native-gesture-handler';

// interface ImagePickerResponse {
//   assets?: Asset[];
//   didCancel?: boolean;
//   errorCode?: string;
//   errorMessage?: string;
// }

const OpenCamera = ({location, status, orderID}: any) => {
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function getS3SignUrl(key: string, contentType: string, type: string) {
    try {
      const headers = {'Content-Type': 'application/json'};
      const response: any = await getS3SignUrlApi(
        {
          key,
          contentType,
          type,
        },
        {headers},
      );

      return response.url;
    } catch (error: any) {
      console.log('error', error);
    }
  }


  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
     if (!hasPermission) {
       Alert.alert(
         'Permission Denied',
         'Camera permission is required to use this feature.',
       );
       return;
     }
 
   ImagePicker.openCamera({
     width: 1000,
     height: 1000,
     mediaType: 'photo', 
     saveToPhotos: true,
     cropping: true,
     compressImageMaxWidth: 1000,  
     compressImageMaxHeight: 1000,
     compressImageQuality: 0.8,    
   }).then(image => {
     setImageUri(image.path);
     uploadImage(image.path);
   }).catch(error => {
     console.log('Camera Error: ', error.message);
   });
 };
 

  // const openCamera = async () => {
  //   const hasPermission = await requestCameraPermission();
  //   if (!hasPermission) {
  //     Alert.alert(
  //       'Permission Denied',
  //       'Camera permission is required to use this feature.',
  //     );
  //     return;
  //   }

  //   const options: CameraOptions = {
  //     mediaType: 'photo',
  //     saveToPhotos: true,
  //   };

  //   launchCamera(options, (response: ImagePickerResponse) => {
  //     if (response.didCancel) {
  //       console.log('User cancelled image picker');
  //     } else if (response.errorCode) {
  //       console.log('ImagePicker Error: ', response.errorMessage);
  //     } else if (response.assets && response.assets.length > 0) {
  //       const photoUri = response.assets[0].uri || null;
  //       setImageUri(photoUri || null);
  //       uploadImage(photoUri);
  //     }
  //   });
  // };

  const uploadImage = async (photoUri: string | null) => {
    if (!photoUri) return;

    setIsUploading(true);

    console.log("status, orderId, location >>>",status, orderID, location)

    try {
      const key =
        status === 'ARRIVED'
          ? `foodPackage/PickUp/image-${orderID}.jpg`
          : `foodPackage/Drop/image-${orderID}.jpg`;

      const contentType = 'image/*';
      const presignedUrl = await getS3SignUrl(key, contentType, 'put');
      const strippedUri = photoUri.replace('file://', ''); // 

      const fileContent = await RNFetchBlob.fs.readFile(strippedUri, 'base64'); // The file will read and returned as a Base64 string

      const buffer = Buffer.from(fileContent, 'base64'); //This line creates a Buffer object from the Base64-encoded string 
      try {
        const result = await axios.put(presignedUrl, buffer);
        if(result.status === 200){
          setIsUploading(false);
          console.log('result  ==>', result.status);
          const response: any = await updateImageKey({
            vendor_order_id: orderID,
            status: status,
            imageKey: key,
            latLong: location
          });
          Toast.show({
            type: 'success',
            text1: `FOOD IMAGE UOLOADED SUCCESSFULLY !`,
            visibilityTime: 5000,
          });
        }
      } catch (error) {
        console.log('error', error);
        setIsUploading(false);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'An error occurred while uploading the image.');
      setIsUploading(false);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const startBlinking = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.3, // Lower opacity for blink effect
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1, // Back to full opacity
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startBlinking();
  }, [blinkAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: blinkAnim }}>
      <TouchableOpacity onPress={openCamera} style={{borderRadius:25,backgroundColor:'#015FAC',paddingHorizontal:wp(4),paddingVertical:hp(0.7)}}>
        <Text style={{color:'#fff',fontWeight:'700'}}>
        Take a photo
        </Text>
      </TouchableOpacity>
      </Animated.View>

      {isUploading && <ActivityIndicator size={30} color={randomLoderColor[Math.floor(Math.random() * randomLoderColor.length)]}  style={{position:'absolute',flex:1,justifyContent:'center',alignSelf:'center'}}/>}
      {/* {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.imagePreview}
        />
      )} */}
    </View>

  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    position:'absolute',
    bottom:hp(16),
    // borderRadius:hp(10),
    // overflow:'hidden'
  
  },
  imagePreview: {
    width: 20,
    height: 20,
    marginTop: 20,
    borderRadius: 10,
  },
});

export default OpenCamera;