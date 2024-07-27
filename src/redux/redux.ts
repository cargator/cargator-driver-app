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
    rideDetails: {},
    locationPermission: false,
    gpsPermission: false,
    pendingPayment: false,
    loginToken: '',
    livelocation: {longitude: 72.870729, latitude: 19.051322},
    messages: [],
    unseenMessagesCount: 0,
    userImage: {
      exists: false,
      path: '',
    },
    rideStatus: '',
    driverAppFlow: '',
    currentOnGoingOrderDetails: {},
    orderStatus: '',
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    removeUserData: state => {
      state.userData = {};
      state.phoneNumber = '';
      state.userId = '';
      state.rideDetails = {};
      state.pendingPayment = false;
      state.loginToken = '';
      state.messages = [];
      state.unseenMessagesCount = 0;
      state.userImage = {
        exists: false,
        path: '',
      };
      state.currentOnGoingOrderDetails = {};
    },
    resetAllOrders: state => {
      state.currentOnGoingOrderDetails = {};
      state.orderStatus = '';
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
    setRideDetails: (state, action) => {
      state.rideDetails = action.payload;
    },
    removeRideDetails: state => {
      state.rideDetails = {};
    },
    setLocationPermission: (state, action) => {
      state.locationPermission = action.payload;
    },
    setGpsPermission: (state, action) => {
      state.gpsPermission = action.payload;
    },
    setPendingPayment: (state, action) => {
      state.pendingPayment = action.payload;
    },
    setLoginToken: (state, action) => {
      state.loginToken = action.payload;
    },
    setMessagesInRedux: (state, action) => {
      state.messages = action.payload;
    },
    setUnseenMessagesCountInRedux: (state, action) => {
      state.unseenMessagesCount = action.payload;
    },
    setUserImgExists: (state, action) => {
      state.userImage = action.payload;
    },
    setRideStatus: (state, action) => {
      state.rideStatus = action.payload;
    },
    setDriverAppFlow: (state, action) => {
      state.driverAppFlow = action.payload;
    },
    setCurrentOnGoingOrderDetails: (state, action) => {
      state.currentOnGoingOrderDetails = action.payload;
    },
    removeCurrentOnGoingOrderDetails: state => {
      state.currentOnGoingOrderDetails = {};
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
  setRideDetails,
  removeRideDetails,
  setLocationPermission,
  setGpsPermission,
  setPendingPayment,
  setLoginToken,
  setMessagesInRedux,
  setUnseenMessagesCountInRedux,
  setUserImgExists,
  setRideStatus,
  setDriverAppFlow,
  setCurrentOnGoingOrderDetails,
  removeCurrentOnGoingOrderDetails,
  resetAllOrders,
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
