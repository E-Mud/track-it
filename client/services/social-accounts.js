import api from './api';

export default {
  getAccounts: () => {
    return api.get('accounts').then((res) => {
      return res.data
    })
  }
}
