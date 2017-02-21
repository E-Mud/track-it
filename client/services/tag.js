import api from './api';

export default {
  getTags: () => {
    return api.get('tags').then((res) => {
      return res.data
    })
  }
}
