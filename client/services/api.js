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
    return axios({
      method: 'post',
      url,
      data: body
    })
  }
}

const api = new API();

axios.defaults.baseURL = '/api';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';

axios.interceptors.response.use(undefined, function (error) {
  return Promise.reject(error.response);
});

export default api;
