import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    userData: {},
    phoneNumber: '',
    infoVisible: false,
    userId: '',
    rideDetails: {},
    locationPermission: false,
    gpsPermission: false,
    pendingPayment: false,
    loginToken: '',
    livelocation: {},
    messages: [],
    unseenMessagesCount: 0,
    userImage: {
      exists: false,
      path: '',
    },
    driverPath: [],
    rideStatus:'',
    driverAppFlow:'',
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    removeUserData: state => {
      state.userData = {};
      state.phoneNumber = '';
      state.infoVisible = false;
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
    },
    setPhoneNumber: (state, action) => {
      state.phoneNumber = action.payload;
    },
    removePhoneNumber: state => {
      state.phoneNumber = '';
    },
    setInfoVisible: (state, action) => {
      state.infoVisible = action.payload;
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
    setlivelocation: (state, action) => {
      state.livelocation = action.payload;
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
    setDriverPath: (state, action) => {
      state.driverPath = action.payload;
    },
    setRideStatus: (state, action) => {
      state.rideStatus = action.payload;
    },
    setDriverAppFlow: (state, action) => {
      state.driverAppFlow = action.payload;
    }
  },
});

const persistedReducer = persistReducer(persistConfig, authSlice.reducer);

export const {
  setUserData,
  removeUserData,
  setPhoneNumber,
  removePhoneNumber,
  setInfoVisible,
  setUserId,
  setRideDetails,
  removeRideDetails,
  setLocationPermission,
  setGpsPermission,
  setPendingPayment,
  setLoginToken,
  setlivelocation,
  setMessagesInRedux,
  setUnseenMessagesCountInRedux,
  setUserImgExists,
  setDriverPath,
  setRideStatus,
  setDriverAppFlow,
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
