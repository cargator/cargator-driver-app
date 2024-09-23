import React, {useState} from 'react';
import {View, Button, Alert, StyleSheet, ActivityIndicator} from 'react-native';
import {launchCamera, Asset, CameraOptions} from 'react-native-image-picker';
import {PermissionsAndroid, Platform} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {getS3SignUrlApi, updateImageKey} from '../../services/userservices';
import RNFetchBlob from 'rn-fetch-blob';


interface ImagePickerResponse {
  assets?: Asset[];
  didCancel?: boolean;
  errorCode?: string;
  errorMessage?: string;
}

const OpenCamera = ({location,status,orderID}:any) => {

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Function to request camera permissions for Android
  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera access to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

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
    //   console.log('response', response);
      return response.url;
    } catch (error: any) {
      console.log('error', error);
    }
  }

  // Function to open the camera
  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Camera permission is required to use this feature.',
      );
      return;
    }

    const options: CameraOptions = {
      mediaType: 'photo',
      saveToPhotos: false,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const photoUri = response.assets[0].uri || null;
        console.log(">>>>>>>>>>>>>>>>",response.assets[0].uri);
        setImageUri(photoUri || null);
        uploadImage(photoUri);
      }
    });
  };

  // Function to upload image to S3 using a signed URL
  const uploadImage = async (photoUri: string | null) => {
    if (!photoUri) return;
   
    setIsUploading(true);
   
    try {
      const key = status === 'ARRIVED' 
        ? `foodPackage/PickUp/image-${orderID}.jpg`
        : `foodPackage/Drop/image-${orderID}.jpg`;
   
      const contentType = 'image/*';
      const presignedUrl = await getS3SignUrl(key, contentType, 'put');

      const imageData = await RNFetchBlob.fs.readFile(photoUri, 'base64'); // Or 'ascii' for binary buffer

      // Step 2: Convert base64 string into binary data buffer
    //   const buffer = RNFetchBlob.base64.decode(imageData);

    //   console.log("??????????",buffer);
   
    //   const response = await RNFetchBlob.fetch(
    //     'PUT',
    //     presignedUrl,
    //     {
    //       'Content-Type': 'image/jpg',
    //     },
    //     buffer,
    //   );

    //   console.log("<<<<<<<object>>>>>>>",response);
   
    //   if (response.status === 200) {
    //     await updateImageKey({ imageKey: key, contentType, status,location });
    //     console.log('Image uploaded successfully!');
    //   }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'An error occurred while uploading the image.');
    } finally {
      setIsUploading(false);
    }
}
   
  return (
    <View style={styles.container}>
      <Button title="Take a Photo" onPress={openCamera} />
      {isUploading && <ActivityIndicator size="large" color="#00ff00" />}
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    marginLeft: wp(10),
  },
  imagePreview: {
    width: 20,
    height: 20,
    marginTop: 20,
    borderRadius: 10,
  },
});

export default OpenCamera;
