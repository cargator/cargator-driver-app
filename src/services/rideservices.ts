import customAxios from './appservices';
export const type = {
  type: 'driver',
};
export const getRideHistory = (userId: any) => {
  return customAxios.post(`/getRideHistory/${userId}`, type);
};

export const userDetails = (id: any) => {
  return customAxios.get(`/getDriverById/${id}`);
};

export const getProgressDetails = () => {
  return customAxios.get(`/progress`);
};

export const getOrderHistory = (page: number, data: any, limit = 100) => {
  console.log({page},{data});
  
  return customAxios.post(`/get-history?page=${page}&limit=${limit}`, data);
};

export const updateFcmToken = (data: {token: any}) => {
  return customAxios.post(`/update-FCM-token`, data);
};