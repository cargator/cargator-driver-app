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

export const getOrderHistory = (page: number, data: any) => {
  console.log({page},{data});
  
  return customAxios.post(`/get-history?page=${page}&limit=100`, data);
};

