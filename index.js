/**
 * @format
 */
import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// import * as Sentry from '@sentry/react-native';

// Sentry.init({
//   dsn: 'https://03458ba1d2632278ec64519d2973d263@o4507626764959744.ingest.us.sentry.io/4508138641162240',
//   tracesSampleRate: 1.0,
//   _experiments: {
//     replaysSessionSampleRate: 1.0, 
//     replaysOnErrorSampleRate: 1.0,
//     profilesSampleRate: 1.0,
//   },
//   integrations: [
//     Sentry.mobileReplayIntegration({
//       maskAllText: false,   
//       maskAllImages: false, 
//       maskAllVectors: false, 
//     }),
//   ],
// });
  

ReactNativeForegroundService.register();
AppRegistry.registerComponent(appName, () => App);
