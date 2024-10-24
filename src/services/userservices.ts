import customAxios from './appservices';

export const login = (data: {mobileNumber: any; type: string}) => {
  return customAxios.post('/login', data);
};

export const verifyOtp = (data: {
  otp: any;
  type: string;
  mobileNumber: any;
}) => {
  return customAxios.post('/verifyOtp', data);
};

export const getPreSignedUrl = (data: {
  key: any;
  ContentType: string;
  type: string;
}) => {
  return customAxios.post('/presignedurl', data);
};

export const getcountryCodeAPI = () => {
  return customAxios.get('/getCountryCodeMobile');
};

export const getDriverAppFlowAPI = () => {
  console.log('object');
  return customAxios.get('/getAppFlowMobile');
};

// breakpoint api
export const getBreakPointsAPI = () => {
  return customAxios.get('/get-breaking-points-mobile');
};

//  Custom Driver Rides API's

export const createRides = (data: any) => {
  return customAxios.post('/createRide', data);
};

export const upDateRideStatus = (data: any) => {
  console.log('upDateRideStatus called');
  return customAxios.patch('/updateRide', data);
};

//petPuja API ----------------------

export const driverLivelocationAPI = (liveLocation: any) => {
  return customAxios.post(`/update-live-location`, liveLocation);
};

export const driverUpdateTimelineAPI = (timeline: any) => {
  return customAxios.post(`/update-timeline`, timeline);
};

export const getAllOrdersAPI = () => {
  return customAxios.get('/get-pending-orders');
};

export const getdriverDetailsAPI = (id: any) => {
  return customAxios.get(`/getDriverById/${id}`);
};

export const orderAcceptAPI = (order: any) => {
  return customAxios.post('/order-accept', order);
};

export const updateOrderAPI = (data: any) => {
  return customAxios.post('/order-update', data);
};

export const toggleDriverStatus = () => {
  return customAxios.post('/toggle-driver-status');
};

export const getDriverStatusAPI = () => {
  return customAxios.get('/get-driver-status');
};

export const getMyPendingOrdersFromAPI = () => {
  return customAxios.get('/get-my-pending-order');
};

export const updatePaymentStatusInDB = (body: any) => {
  return customAxios.post('/update-payment-status-of-order', body);
};

export const getS3SignUrlApi = (data: any, headers: any) => {
  return customAxios.post(`/presignedurl`, data, headers);
};

export const updateImageKey = (data: any) => {
  return customAxios.post(`/update-food-imageKey`, data);
};

export const updateVehicleImageKey = (data: any) => {
  return customAxios.post(`/update-vehicle-imageKey`, data);
};

export const updateDeviceInfo = (data: any) => {
  return customAxios.post(`/update-device-info`, data);
};