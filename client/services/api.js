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
    return axios({
      method: 'get',
      url
    })
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

axios.interceptors.request.use((config) => {
  config.headers = Object.assign({'Authorization': 'Bearer ' + api.getAuthToken()}, config.headers || {})
  return config;
});

axios.interceptors.response.use(undefined, (error) => {
  return Promise.reject(error.response);
});

const readAuthTokenCookie = () => {
    let cookies = document.cookie.split('; ');

    for(let i=cookies.length-1; i>=0; i--){
       let splittedCookie = cookies[i].split('=');
       let cookieName = splittedCookie[0].trim();

       if(cookieName === 'authToken'){
         return splittedCookie[1];
       }
    }

    return null;
}

// api.setAuthToken(readAuthTokenCookie())

export default api;
