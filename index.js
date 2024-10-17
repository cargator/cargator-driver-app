/**
 * @format
 */
import ReactNativeForegroundService from "@supersami/rn-foreground-service";
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
// import ImageCropPicker from "react-native-image-crop-picker";
// export default ImageCropPicker;
// export const openPicker = ImageCropPicker.openPicker;
// export const openCropper = ImageCropPicker.openCropper;
// export const clean = ImageCropPicker.clean;

ReactNativeForegroundService.register();
AppRegistry.registerComponent(appName, () => App);
