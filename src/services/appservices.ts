import axios from 'axios';
import store, {removeUserData} from '../redux/redux';

const customAxios = axios.create({
  // baseURL: `https://cab-e-socket-service-dev-fa3ocuxbpq-el.a.run.app`,
  // baseURL: `http://192.168.0.132:5000`,
  // baseURL: `https://green-beans-rhyme.loca.lt`,
  // baseURL: `https://a8aa-2401-4900-51cc-7a9d-ef16-58ea-c989-2d`,
  // baseURL: `https://1525-182-48-208-143.ngrok-free.app`,
  baseURL: `https://sukam-api.cargator.org/`,
  timeout: 30000,
});

customAxios.interceptors.request.use(
  function (request) {
    // Do something before request is sent
    if (request) {
      request.headers['Authorization'] = `Bearer ${
        store.getState().loginToken
      }`;
    }
    return request;
  },
  function (error) {
    // Do something with request error
    // console.log(`Interceptors Request Error :>> `, error);
    return Promise.reject(error);
  },
);

customAxios.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    // console.log(response.data);
    return response.data;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    // If user mobile number will mismatch logout
    if (error.response?.status == 405) {
      store.dispatch(removeUserData());
    }
    // console.log(`Interceptors Response Error :>> `, error);
    return Promise.reject(error);
  },
);

export default customAxios;
