import AsyncStorage from '@react-native-async-storage/async-storage';
import {configureStore, createSlice} from '@reduxjs/toolkit';
import {persistReducer, persistStore} from 'redux-persist';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    userData: {},
    phoneNumber: '',
    userId: '',
    locationPermission: false,
    gpsPermission: false,
    loginToken: '',
    livelocation: {longitude: 72.870729, latitude: 19.051322},
    userImage: {
      exists: false,
      path: '',
    },
    vehicleImage: {
      exists: false,
      path: ''
    },
    vehicleImageKey: '',
    currentOnGoingRide: {},
    rejectedOrders: [],
    riderPath:[],
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    removeUserData: state => {
      state.userData = {};
      state.phoneNumber = '';
      state.userId = '';
      state.loginToken = '';
      state.userImage = {
        exists: false,
        path: '',
      };
      state.vehicleImage = {
        exists: false,
        path: '',
      };
      state.vehicleImageKey = '';
      state.currentOnGoingRide = {};
    },
    resetAllOrders: state => {
      state.currentOnGoingRide = {};
    },
    setPhoneNumber: (state, action) => {
      state.phoneNumber = action.payload;
    },
    removePhoneNumber: state => {
      state.phoneNumber = '';
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    setLocationPermission: (state, action) => {
      state.locationPermission = action.payload;
    },
    setGpsPermission: (state, action) => {
      state.gpsPermission = action.payload;
    },
    setLoginToken: (state, action) => {
      state.loginToken = action.payload;
    },
    setUserImgExists: (state, action) => {
      state.userImage = action.payload;
    },
    setVehicleImgExists: (state, action) => {
      state.vehicleImage = action.payload;
    },
    setVehicleImageKey: (state, action) => {
      state.vehicleImageKey = action.payload;
    },
    setCurrentOnGoingRide: (state, action) => {
      state.currentOnGoingRide = action.payload;
    },
    removeCurrentOnGoingRide: state => {
      state.currentOnGoingRide = {};
    },
    setRejectedOrders: (state, action) => {
      state.rejectedOrders = action.payload;
    },
    removeRejectedOrders: state => {
      state.currentOnGoingRide = [];
    },
    setRiderPath: (state, action) => {
      state.riderPath = action.payload;
    },
  },
});

const persistedReducer = persistReducer(persistConfig, authSlice.reducer);

export const {
  setUserData,
  removeUserData,
  setPhoneNumber,
  removePhoneNumber,
  setUserId,
  setLocationPermission,
  setGpsPermission,
  setLoginToken,
  setUserImgExists,
  setVehicleImgExists,
  setVehicleImageKey,
  setCurrentOnGoingRide,
  removeCurrentOnGoingRide,
  resetAllOrders,
  setRejectedOrders,
  removeRejectedOrders,
  setRiderPath,
} = authSlice.actions;

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
export const persistor = persistStore(store);
