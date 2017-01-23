import api from './api';

export default {
  registerUser: (user) => {
    return api.post('users/register', user).then((res) => {
      return res.data
    })
  }
}
