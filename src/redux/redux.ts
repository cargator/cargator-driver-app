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
    currentOnGoingOrderDetails: {},
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
      state.currentOnGoingOrderDetails = {};
    },
    resetAllOrders: state => {
      state.currentOnGoingOrderDetails = {};
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
    setCurrentOnGoingOrderDetails: (state, action) => {
      state.currentOnGoingOrderDetails = action.payload;
    },
    removeCurrentOnGoingOrderDetails: state => {
      state.currentOnGoingOrderDetails = {};
    },
    setRejectedOrders: (state, action) => {
      state.rejectedOrders = action.payload;
    },
    removeRejectedOrders: state => {
      state.currentOnGoingOrderDetails = [];
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
  setCurrentOnGoingOrderDetails,
  removeCurrentOnGoingOrderDetails,
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
