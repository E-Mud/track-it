import axios from 'axios';

class API {
  constructor() {
    this.authToken = null;
  }

  setAuthToken(token) {
    this.authToken = token
  }

  getAuthToken() {
    return this.authToken
  }

  clearAuthToken() {
    this.authToken = null
  }

  get(url) {

  }

  post(url, body) {
    return axios.post(url, body)
  }
}

const api = new API();

axios.defaults.baseURL = '/api';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';
//
//
// axios.interceptors.request.use(function (config) {
//   // Do something before request is sent
//   config.headers = Object.assign({'Authentication': 'Bearer ' + api.getAuthToken}, config.headers || {});
//
//   return config;
// });

export default api;
