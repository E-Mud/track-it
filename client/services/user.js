import api from './api';

export default {
  registerUser: (user) => {
    return api.post('users/register', user).then((res) => {
      return res.data
    })
  },

  login: (user) => {
    return api.post('users/login', user).then((res) => {
      api.saveAuthToken(res.authToken)
      return res.data
    })
  }
}
