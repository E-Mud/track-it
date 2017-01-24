import axios from 'axios';

class API {
  constructor() {
    this.authToken = null;
  }

  setAuthToken(token) {
    this.authToken = token
  }

  saveAuthToken(token) {
    this.setAuthToken(token)
    window.localStorage.setItem('authToken', this.getAuthToken())
  }

  getAuthToken() {
    return this.authToken
  }

  clearAuthToken() {
    this.authToken = null
    window.localStorage.removeItem('authToken')
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

api.setAuthToken(localStorage.getItem('authToken'))

export default api;
